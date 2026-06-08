import Transaction from "../models/Transaction.js";
import Balance from "../models/Balance.js";
import ExpenseTx from "../models/ExpenseTx.js";

// User-defined comment: Controller to handle admin dashboard metrics
export const getAdminDashboard = async (req, res) => {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const tomorrow = new Date(new Date(todayStr).setDate(today.getDate() + 1));

    // User-defined comment: Fetch today's data concurrently using Promise.all
    const [transactions, expenses] = await Promise.all([
      Transaction.find({
        date: { $gte: new Date(todayStr), $lt: tomorrow },
      }),
      ExpenseTx.find({
        date: { $gte: new Date(todayStr), $lt: tomorrow },
      }),
    ]);

    let totalCash = 0;
    let totalGpay = 0;
    let totalProfit = 0;

    // User-defined comment: Summing up values from today's transactions
    transactions.forEach((t) => {
      totalCash += t.splitCash || 0;
      totalGpay += t.gpayAmount || 0;
      totalProfit += t.profit || 0;
    });

    // User-defined comment: Deducting expenses from the calculated cash
    expenses.forEach((e) => {
      totalCash -= e.amount || 0;
    });

    // User-defined comment: Fetching all-time cumulative reports from microservice/endpoint
    const reportRes = await fetch(
      `${process.env.URL}/api/reports?from=2020-01-01&to=${todayStr}`
    );

    if (!reportRes.ok) {
      return res.status(502).json({ message: "Failed to fetch internal report service data" });
    }

    const reportData = await reportRes.json();
    let lastRecord;

    // User-defined comment: Fallback to base configuration if no prior records exist
    if (reportData.data && reportData.data.length > 0) {
      lastRecord = reportData.data[reportData.data.length - 1];
    } else {
      const balance = await Balance.findOne();
      lastRecord = {
        cashBalance: balance?.openingCash || 0,
        sbiCurrent: balance?.openingSbiCurrentBank || 0,
        sbiSavings: balance?.openingSbiSavingsBank || 0,
        edistrict: balance?.openingEdistrict || 0,
        psa: balance?.openingPSA || 0,
      };
    }

    return res.status(200).json({
      today: {
        cash: totalCash,
        gpay: totalGpay,
        profit: totalProfit,
      },
      balances: {
        cash: lastRecord.cashBalance || 0,
        sbiCurrent: lastRecord.sbiCurrent || 0,
        sbiSavings: lastRecord.sbiSavings || 0,
        edistrict: lastRecord.edistrict || 0,
        psa: lastRecord.psa || 0,
      },
    });

  } catch (error) {
    console.error("Error in getAdminDashboard:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// User-defined comment: Controller to handle staff dashboard metrics (Hides profit data)
export const getStaffDashboard = async (req, res) => {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const tomorrow = new Date(new Date(todayStr).setDate(today.getDate() + 1));

    const [transactions, expenses] = await Promise.all([
      Transaction.find({
        date: { $gte: new Date(todayStr), $lt: tomorrow },
      }),
      ExpenseTx.find({
        date: { $gte: new Date(todayStr), $lt: tomorrow },
      }),
    ]);

    let totalCash = 0;
    let totalGpay = 0;

    transactions.forEach((t) => {
      totalCash += t.splitCash || 0;
      totalGpay += t.gpayAmount || 0;
    });

    expenses.forEach((e) => {
      totalCash -= e.amount || 0;
    });

    const reportRes = await fetch(
      `${process.env.URL}/api/reports?from=2020-01-01&to=${todayStr}`
    );

    if (!reportRes.ok) {
      return res.status(502).json({ message: "Failed to fetch internal report service data" });
    }

    const reportData = await reportRes.json();
    let lastRecord;

    if (reportData.data && reportData.data.length > 0) {
      lastRecord = reportData.data[reportData.data.length - 1];
    } else {
      const balance = await Balance.findOne();
      lastRecord = {
        cashBalance: balance?.openingCash || 0,
        sbiCurrent: balance?.openingSbiCurrentBank || 0,
        sbiSavings: balance?.openingSbiSavingsBank || 0,
        edistrict: balance?.openingEdistrict || 0,
        psa: balance?.openingPSA || 0,
      };
    }

    return res.status(200).json({
      today: {
        cash: totalCash,
        gpay: totalGpay,
      },
      balances: {
        cash: lastRecord.cashBalance || 0,
        sbiCurrent: lastRecord.sbiCurrent || 0,
        sbiSavings: lastRecord.sbiSavings || 0,
        edistrict: lastRecord.edistrict || 0,
        psa: lastRecord.psa || 0,
      },
    });

  } catch (error) {
    console.error("Error in getStaffDashboard:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};