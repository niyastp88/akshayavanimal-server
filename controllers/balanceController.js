import Balance from "../models/Balance.js";
import BalanceTx from "../models/BalanceTx.js";

// Create or update opening balance
export const saveBalance = async (req, res) => {
  try {
    const {
      openingCash,
      openingSbiCurrentBank,
      openingSbiSavingsBank,
      openingEdistrict,
      openingPSA,
    } = req.body;

    let balance = await Balance.findOne();

    if (balance) {
      balance.openingCash = openingCash;
      balance.openingSbiCurrentBank = openingSbiCurrentBank;
      balance.openingSbiSavingsBank = openingSbiSavingsBank;
      balance.openingEdistrict = openingEdistrict;
      balance.openingPSA = openingPSA;

      await balance.save();
    } else {
      balance = await Balance.create({
        openingCash,
        openingSbiCurrentBank,
        openingSbiSavingsBank,
        openingEdistrict,
        openingPSA,
      });
    }

    return res.status(200).json(balance);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to save balance",
    });
  }
};

// Get opening balance
export const getBalance = async (req, res) => {
  try {
    const balance = await Balance.findOne();

    return res.status(200).json(balance);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch balance",
    });
  }
};

// Get logged in staff balance history
export const getMyBalanceHistory = async (req, res) => {
  try {
    const data = await BalanceTx.find({
      staffId: req.user.id,
    }).sort({ date: -1 });

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch balance history",
    });
  }
};
