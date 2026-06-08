import Transaction from "../models/Transaction.js";
import Service from "../models/Service.js";

// User-defined comment: CREATE TRANSACTION
export const createTransaction = async (req, res) => {
  try {
    const {
      serviceId,
      cashAmount,
      bankAmount,
      splitCash,
      gpayAmount,
      paymentType,
    } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const cash = Number(cashAmount) || 0;
    const bank = Number(bankAmount) || 0;

    let edistrictAmount = 0;
    let psaAmount = 0;
    let profit = 0;

    // User-defined comment: EDISTRICT BILL
    if (service.hasEdistrict && service.hasBill) {
      if (cash <= 1000) profit = 15;
      else if (cash <= 2000) profit = 25;
      else profit = 35;

      edistrictAmount = cash - profit;
    }
    // User-defined comment: NORMAL EDISTRICT
    else if (service.hasEdistrict) {
      edistrictAmount = service.edistrictCharge || 0;
      profit = cash - 7;
    }
    // User-defined comment: PSA
    else if (service.hasPsa) {
      psaAmount = service.psaCharge || 0;
      profit = cash - 109;
    }
    // User-defined comment: CASH + BANK
    else if (service.hasCash && service.hasBank) {
      profit = cash;
    }
    // User-defined comment: CASH ONLY
    else if (service.hasCash) {
      profit = cash;
    }

    const transaction = await Transaction.create({
      serviceName: service.name,
      cashAmount: cash,
      bankAmount: bank,
      splitCash: splitCash || 0,
      gpayAmount: gpayAmount || 0,
      paymentType,
      edistrictAmount,
      psaAmount,
      profit,
      staffId: req.user.id,
      staffName: req.user.name,
    });

    return res.status(201).json(transaction);
  } catch (err) {
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

// User-defined comment: MY TRANSACTIONS (STAFF)
export const getMyTransactions = async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ message: "From and To dates are required" });
    }

    const start = new Date(from);
    const end = new Date(to);
    end.setDate(end.getDate() + 1);

    const data = await Transaction.find({
      staffId: req.user.id,
      date: { $gte: start, $lt: end },
    }).sort({ date: -1 });

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

// User-defined comment: STAFF REPORT (ADMIN)
export const getStaffReport = async (req, res) => {
  try {
    const { staffId, from, to } = req.query;
    if (!staffId || !from || !to) {
      return res.status(400).json({ message: "Staff ID, From and To dates are required" });
    }

    const start = new Date(from);
    const end = new Date(to);
    end.setDate(end.getDate() + 1);

    const data = await Transaction.find({
      staffId,
      date: { $gte: start, $lt: end },
    }).sort({ date: -1 });

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

// User-defined comment: UPDATE
export const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const isAdmin = req.user.role === "admin";
    const today = new Date().toISOString().split("T")[0];
    const txDate = transaction.date.toISOString().split("T")[0];

    if (!isAdmin && today !== txDate) {
      return res.status(403).json({ message: "Cannot edit old data" });
    }

    // User-defined comment: NEW VALUES
    const cash = Number(req.body.cashAmount) || 0;
    const bank = Number(req.body.bankAmount) || 0;
    const splitCash = Number(req.body.splitCash) || 0;
    const gpayAmount = Number(req.body.gpayAmount) || 0;
    const paymentType = req.body.paymentType;

    // User-defined comment: GET SERVICE
    const service = await Service.findOne({ name: transaction.serviceName });

    let edistrictAmount = 0;
    let psaAmount = 0;
    let profit = 0;

    if (service) {
      if (service.hasEdistrict && service.hasBill) {
        if (cash <= 1000) profit = 15;
        else if (cash <= 2000) profit = 25;
        else profit = 35;

        edistrictAmount = cash - profit;
      } else if (service.hasEdistrict) {
        edistrictAmount = service.edistrictCharge || 0;
        profit = cash - 7;
      } else if (service.hasPsa) {
        psaAmount = service.psaCharge || 0;
        profit = cash - 109;
      } else if (service.hasCash && service.hasBank) {
        profit = cash;
      } else if (service.hasCash) {
        profit = cash;
      }
    }

    // User-defined comment: UPDATE ALL FIELDS
    transaction.cashAmount = cash;
    transaction.bankAmount = bank;
    transaction.splitCash = splitCash;
    transaction.gpayAmount = gpayAmount;
    transaction.paymentType = paymentType;
    transaction.edistrictAmount = edistrictAmount;
    transaction.psaAmount = psaAmount;
    transaction.profit = profit;

    await transaction.save();
    return res.status(200).json(transaction);
  } catch (err) {
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

// User-defined comment: DELETE
export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const isAdmin = req.user.role === "admin";
    const today = new Date().toISOString().split("T")[0];
    const txDate = transaction.date.toISOString().split("T")[0];

    if (!isAdmin && today !== txDate) {
      return res.status(403).json({ message: "Cannot delete old data" });
    }

    await transaction.deleteOne();
    return res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
};