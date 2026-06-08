import mongoose from "mongoose";

const addBalanceSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model(
  "AddBalance",
  addBalanceSchema
);