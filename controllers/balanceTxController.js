import BalanceTx from "../models/BalanceTx.js";

// Add balance transaction
export const createBalanceTx = async (
  req,
  res
) => {
  try {
    const { type, amount } = req.body;

    const data = await BalanceTx.create({
      type,
      amount,
      staffId: req.user.id,
      staffName: req.user.name,
    });

    return res.status(201).json(data);

  } catch (error) {
    return res.status(500).json({
      message: "Failed to create transaction",
    });
  }
};

// Get own balance transactions
export const getMyBalanceTx = async (
  req,
  res
) => {
  try {
    const { from, to } = req.query;

    let filter = {
      staffId: req.user.id,
    };

    if (from && to) {
      const start = new Date(from);

      const end = new Date(to);

      end.setDate(end.getDate() + 1);

      filter.date = {
        $gte: start,
        $lt: end,
      };
    }

    const data = await BalanceTx.find(
      filter
    ).sort({ date: -1 });

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch transactions",
    });
  }
};

// Get all balance transactions
export const getAllBalanceTx = async (
  req,
  res
) => {
  try {
    const { from, to, staffId } =
      req.query;

    let filter = {};

    if (staffId) {
      filter.staffId = staffId;
    }

    if (from && to) {
      const start = new Date(from);

      const end = new Date(to);

      end.setDate(end.getDate() + 1);

      filter.date = {
        $gte: start,
        $lt: end,
      };
    }

    const data = await BalanceTx.find(
      filter
    ).sort({ date: -1 });

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch records",
    });
  }
};

// Update transaction
export const updateBalanceTx = async (
  req,
  res
) => {
  try {
    const item =
      await BalanceTx.findById(
        req.params.id
      );

    if (!item) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    const isAdmin =
      req.user.role === "admin";

    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    const itemDate =
      item.date
        .toISOString()
        .split("T")[0];

    if (!isAdmin && today !== itemDate) {
      return res.status(403).json({
        message: "Not allowed",
      });
    }

    Object.assign(item, req.body);

    await item.save();

    return res.status(200).json(item);

  } catch (error) {
    return res.status(500).json({
      message: "Failed to update transaction",
    });
  }
};

// Delete transaction
export const deleteBalanceTx = async (
  req,
  res
) => {
  try {
    const item =
      await BalanceTx.findById(
        req.params.id
      );

    if (!item) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    const isAdmin =
      req.user.role === "admin";

    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    const itemDate =
      item.date
        .toISOString()
        .split("T")[0];

    if (!isAdmin && today !== itemDate) {
      return res.status(403).json({
        message: "Not allowed",
      });
    }

    await item.deleteOne();

    return res.status(200).json({
      message: "Deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete transaction",
    });
  }
};