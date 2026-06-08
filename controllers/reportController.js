import Transaction from "../models/Transaction.js";
import Balance from "../models/Balance.js";
import ExpenseTx from "../models/ExpenseTx.js";
import BalanceTx from "../models/BalanceTx.js";

export const getFinancialReport = async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ message: "From and To dates are required parameters" });
    }

    const start = new Date(from);
    const end = new Date(to);
    end.setDate(end.getDate() + 1);

    const balance = await Balance.findOne();

    let cash = balance?.openingCash || 0;
    let sbiCurrent = balance?.openingSbiCurrentBank || 0;
    let sbiSavings = balance?.openingSbiSavingsBank || 0;
    let edistrict = balance?.openingEdistrict || 0;
    let psa = balance?.openingPSA || 0;

    const [allTransactions, allExpenses, allBalances] = await Promise.all([
      Transaction.find(),
      ExpenseTx.find(),
      BalanceTx.find(),
    ]);

    const everything = [
      ...allTransactions.map((t) => ({ ...t.toObject(), category: "tx" })),
      ...allExpenses.map((e) => ({ ...e.toObject(), category: "expense" })),
      ...allBalances.map((b) => ({ ...b.toObject(), category: "balance" })),
    ];

    everything.sort((a, b) => new Date(a.date) - new Date(b.date));

    // 1. ഓരോ ദിവസത്തെയും ഡാറ്റ ഗ്രൂപ്പ് ചെയ്യുന്നു
    const dailyData = {};
    everything.forEach((item) => {
      const dateStr = item.date.toISOString().split("T")[0];
      if (!dailyData[dateStr]) {
        dailyData[dateStr] = { transactions: [], expenses: [], balances: [] };
      }
      if (item.category === "tx") dailyData[dateStr].transactions.push(item);
      else if (item.category === "expense") dailyData[dateStr].expenses.push(item);
      else if (item.category === "balance") dailyData[dateStr].balances.push(item);
    });

    // 2. 🟢 [SUNDAY / GAP FIX]: ഡാറ്റാബേസിലെ ആദ്യ തീയതി മുതൽ ഇന്ന് വരെയുള്ള എല്ലാ തീയതികളും തുടർച്ചയായി (ഒരു ദിവസം പോലും വിടാതെ) ലൂപ്പ് ചെയ്യാൻ പോകുന്നു.
    const sortedDbDates = Object.keys(dailyData).sort((a, b) => new Date(a) - new Date(b));
    let reportRows = [];
    let pendingGpaySettlement = 0;

    let totalCash = 0;
    let totalGpay = 0;
    let totalProfit = 0;

    if (sortedDbDates.length > 0) {
      let currentDate = new Date(sortedDbDates[0]); // ആദ്യത്തെ തീയതി
      
      // ഇന്നത്തെ തീയതി (ഇന്ത്യൻ സമയം വെച്ച് കൃത്യമായി എടുക്കുന്നു)
      const todayStr = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Kolkata" });
      const maxDate = new Date(todayStr); // ഇന്ന് വരെയുള്ള ദിവസങ്ങൾ മാത്രം ലൂപ്പ് ചെയ്താൽ മതി

      while (currentDate <= maxDate) {
        const dateStr = currentDate.toISOString().split("T")[0];
        const dayData = dailyData[dateStr] || { transactions: [], expenses: [], balances: [] };
        const isInWindow = dateStr >= from && dateStr <= to;

        // 🟢 എ) [T+1 SETTLEMENT]: ഇന്നലത്തെ ജിപേ തുക ഉണ്ടെങ്കിൽ അത് ഇന്ന് രാവിലെ SBI Current-ലേക്ക് കൂട്ടുന്നു.
        if (pendingGpaySettlement > 0) {
          sbiCurrent += pendingGpaySettlement;
          
          if (isInWindow) {
            reportRows.push({
              date: dateStr,
              serviceName: `Paytm Settlement (₹${pendingGpaySettlement.toLocaleString("en-IN")})`,
              in: 0,
              out: 0,
              cashBalance: cash,
              sbiCurrent,
              sbiSavings,
              edistrict,
              psa,
            });
          }
          pendingGpaySettlement = 0; // സെറ്റിൽമെന്റ് കഴിഞ്ഞു
        }

        let todaysGpay = 0;

        // ബി) സർവീസ് ട്രാൻസാക്ഷനുകൾ
        dayData.transactions.forEach((item) => {
          cash += item.splitCash || 0;
          sbiCurrent -= item.bankAmount || 0;
          edistrict -= item.edistrictAmount || 0;
          psa -= item.psaAmount || 0;
          todaysGpay += item.gpayAmount || 0;

          if (isInWindow) {
            totalCash += item.splitCash || 0;
            totalGpay += item.gpayAmount || 0;
            totalProfit += item.profit || 0;

            reportRows.push({
              date: dateStr,
              serviceName: item.serviceName,
              in: (item.cashAmount || 0) + (item.bankAmount || 0),
              out: 0,
              cashBalance: cash,
              sbiCurrent,
              sbiSavings,
              edistrict,
              psa,
          });
          }
        });

        // സി) എക്സ്പെൻസുകൾ
        dayData.expenses.forEach((item) => {
          cash -= item.amount || 0;
          if (isInWindow) {
            totalCash -= item.amount || 0;
            reportRows.push({
              date: dateStr,
              serviceName: item.expenseName,
              in: 0,
              out: item.amount,
              cashBalance: cash,
              sbiCurrent,
              sbiSavings,
              edistrict,
              psa,
            });
          }
        });

        // ഡി) ബാലൻസ് ട്രാൻസ്ഫറുകൾ
        dayData.balances.forEach((item) => {
          if (item.type === "SBI Current Account") {
            cash -= item.amount;
            sbiCurrent += item.amount;
          } else if (item.type === "SBI Savings Account") {
            cash -= item.amount;
            sbiSavings += item.amount;
          } else if (item.type === "Edistrict") {
            sbiCurrent -= item.amount;
            edistrict += item.amount;
          } else if (item.type === "PSA") {
            psa += item.amount;
          }

          if (isInWindow) {
            reportRows.push({
              date: dateStr,
              serviceName: item.type,
              in: 0,
              out: item.amount,
              cashBalance: cash,
              sbiCurrent,
              sbiSavings,
              edistrict,
              psa,
            });
          }
        });

        // 🟢 ഇന്നത്തെ ജിപേ നാളത്തെ ലൂപ്പിലേക്ക് മാറ്റിവെക്കുന്നു
        pendingGpaySettlement = todaysGpay;

        // അടുത്ത ദിവസത്തിലേക്ക് ലൂപ്പ് മാറ്റുന്നു
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    // തീയതി ക്രമത്തിൽ സോർട്ട് ചെയ്യുന്നു
    reportRows.sort((a, b) => new Date(a.date) - new Date(b.date));

    return res.status(200).json({
      data: reportRows,
      totals: {
        cash: totalCash,
        gpay: totalGpay,
        profit: totalProfit,
      },
    });

  } catch (error) {
    console.error("Error in financial report generation:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
