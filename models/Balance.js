import mongoose from "mongoose";

const balanceSchema = new mongoose.Schema(
  {
    openingCash: {
      type: Number,
      default: 0,
    },

    openingSbiCurrentBank: {
      type: Number,
      default: 0,
    },

    openingSbiSavingsBank: {
      type: Number,
      default: 0,
    },

    openingEdistrict: {
      type: Number,
      default: 0,
    },

    openingPSA: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Balance",
  balanceSchema
);