import mongoose from "mongoose";

const serviceSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
      },

      hasCash: {
        type: Boolean,
        default: false,
      },

      hasBank: {
        type: Boolean,
        default: false,
      },

      hasEdistrict: {
        type: Boolean,
        default: false,
      },

      hasPsa: {
        type: Boolean,
        default: false,
      },

      hasBill: {
        type: Boolean,
        default: false,
      },

      edistrictCharge: {
        type: Number,
        default: 0,
      },

      psaCharge: {
        type: Number,
        default: 0,
      },
    },

    {
      timestamps: true,
    }
  );

export default mongoose.model(
  "Service",
  serviceSchema
);