import mongoose from "mongoose";

const expenseTxSchema =
  new mongoose.Schema(
    {
      expenseName: {
        type: String,
        required: true,
      },

      amount: {
        type: Number,
        required: true,
      },

      staffId: {
        type:
          mongoose.Schema.Types
            .ObjectId,

        ref: "User",
      },

      staffName: String,

      date: {
        type: Date,
        default: Date.now,
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model(
  "ExpenseTx",
  expenseTxSchema
);