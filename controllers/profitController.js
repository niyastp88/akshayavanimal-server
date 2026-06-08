import Transaction from "../models/Transaction.js";
import ExpenseTx from "../models/ExpenseTx.js";

/**
 * @desc    Get profit report summary (Total Profit, Total Expense, Net Profit)
 * @route   GET /api/profit/summary
 * @access  Protected/Private
 */
export const getProfitSummary = async (req, res) => {
  try {
    const { from, to, type } = req.query;

    let start, end;
    const today = new Date();

    // 1. Determine date range filter based on query type
    if (type === "today") {
      const todayStr = today.toISOString().split("T")[0];
      start = new Date(todayStr);
      end = new Date(todayStr);
      end.setDate(end.getDate() + 1);
    } 
    else if (type === "month") {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date();
      end.setDate(end.getDate() + 1);
    } 
    else {
      // Input validation for custom date filtering
      if (!from || !to) {
        return res.status(400).json({
          success: false,
          message: "Validation Error: Both 'from' and 'to' dates are required for custom range.",
        });
      }
      start = new Date(from);
      end = new Date(to);
      end.setDate(end.getDate() + 1);
    }

    // 2. Performance Boost: Concurrently query both collections using Promise.all
    const [transactions, expenses] = await Promise.all([
      Transaction.find({ date: { $gte: start, $lt: end } }),
      ExpenseTx.find({ date: { $gte: start, $lt: end } }),
    ]);

    let totalProfit = 0;
    let totalExpense = 0;

    // 3. Accumulate total profit from regular transactions
    transactions.forEach((t) => {
      totalProfit += t.profit || 0;
    });

    // 4. Accumulate total expense from expense transactions
    expenses.forEach((e) => {
      totalExpense += e.amount || 0;
    });

    // 5. Send structured RESTful JSON response
    return res.status(200).json({
      success: true,
      data: {
        totalProfit,
        totalExpense,
        netProfit: totalProfit - totalExpense,
      },
    });

  } catch (error) {
    // 6. Global error handler for this controller block
    console.error("Database or Server Error in getProfitSummary:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Unable to process profit data.",
      error: error.message,
    });
  }
};