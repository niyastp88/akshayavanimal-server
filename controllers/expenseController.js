import Expense from "../models/Expense.js";
import ExpenseTx from "../models/ExpenseTx.js";


// Create expense type
export const createExpenseType =
  async (req, res) => {

    try {

      const { name } =
        req.body;

      if (!name) {

        return res
          .status(400)
          .json({
            message:
              "Expense name required",
          });
      }

      const existing =
        await Expense.findOne({
          name,
        });

      if (existing) {

        return res
          .status(409)
          .json({
            message:
              "Expense type already exists",
          });
      }

      const data =
        await Expense.create({
          name,
        });

      return res
        .status(201)
        .json(data);

    } catch {

      return res
        .status(500)
        .json({
          message:
            "Failed to create expense type",
        });
    }
  };



// Get expense types
export const getExpenseTypes =
  async (req, res) => {

    try {

      const page =
        Number(req.query.page) || 1;

      const limit =
        Number(req.query.limit) || 10;

      const skip =
        (page - 1) * limit;

      const total =
        await Expense.countDocuments();

      const data =
        await Expense.find()
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limit);

      return res
        .status(200)
        .json({
          data,
          page,
          totalPages:
            Math.ceil(
              total / limit
            ),
          total,
        });

    } catch {

      return res
        .status(500)
        .json({
          message:
            "Failed to fetch expense types",
        });
    }
  };



// Update expense type
export const updateExpenseType =
  async (req, res) => {

    try {

      const { name } =
        req.body;

      const item =
        await Expense.findById(
          req.params.id
        );

      if (!item) {

        return res
          .status(404)
          .json({
            message:
              "Expense type not found",
          });
      }

      const existing =
        await Expense.findOne({
          name,
          _id: {
            $ne:
              req.params.id,
          },
        });

      if (existing) {

        return res
          .status(409)
          .json({
            message:
              "Expense type already exists",
          });
      }

      item.name =
        name;

      await item.save();

      return res
        .status(200)
        .json(item);

    } catch {

      return res
        .status(500)
        .json({
          message:
            "Failed to update expense type",
        });
    }
  };



// Delete expense type
export const deleteExpenseType =
  async (req, res) => {

    try {

      const item =
        await Expense.findById(
          req.params.id
        );

      if (!item) {

        return res
          .status(404)
          .json({
            message:
              "Expense type not found",
          });
      }

      await item.deleteOne();

      return res
        .status(200)
        .json({
          message:
            "Expense type deleted",
        });

    } catch {

      return res
        .status(500)
        .json({
          message:
            "Delete failed",
        });
    }
  };



// Create expense transaction
export const createExpenseTx =
  async (req, res) => {

    try {

      const {
        expenseName,
        amount,
      } = req.body;

      const tx =
        await ExpenseTx.create({

          expenseName,

          amount,

          staffId:
            req.user.id,

          staffName:
            req.user.name,
        });

      return res
        .status(201)
        .json(tx);

    } catch {

      return res
        .status(500)
        .json({
          message:
            "Failed to create expense",
        });
    }
  };



// Get my expenses
export const getMyExpenses =
  async (req, res) => {

    try {

      const {
        from,
        to,
      } = req.query;

      let filter = {
        staffId:
          req.user.id,
      };

      if (from && to) {

        const start =
          new Date(from);

        const end =
          new Date(to);

        end.setDate(
          end.getDate() + 1
        );

        filter.date = {
          $gte: start,
          $lt: end,
        };
      }

      const data =
        await ExpenseTx.find(
          filter
        ).sort({
          date: -1,
        });

      return res
        .status(200)
        .json(data);

    } catch {

      return res
        .status(500)
        .json({
          message:
            "Failed to fetch expenses",
        });
    }
  };



// Get all expenses
export const getAllExpenses =
  async (req, res) => {

    try {

      const {
        from,
        to,
        staffId,
      } = req.query;

      let filter = {};

      if (staffId) {

        filter.staffId =
          staffId;
      }

      if (from && to) {

        const start =
          new Date(from);

        const end =
          new Date(to);

        end.setDate(
          end.getDate() + 1
        );

        filter.date = {
          $gte: start,
          $lt: end,
        };
      }

      const data =
        await ExpenseTx.find(
          filter
        ).sort({
          date: -1,
        });

      return res
        .status(200)
        .json(data);

    } catch {

      return res
        .status(500)
        .json({
          message:
            "Failed to fetch expenses",
        });
    }
  };



// Update expense transaction
export const updateExpense =
  async (req, res) => {

    try {

      const item =
        await ExpenseTx.findById(
          req.params.id
        );

      if (!item) {

        return res
          .status(404)
          .json({
            message:
              "Expense not found",
          });
      }

      const isAdmin =
        req.user.role ===
        "admin";

      const today =
        new Date()
          .toISOString()
          .split("T")[0];

      const itemDate =
        item.date
          .toISOString()
          .split("T")[0];

      if (
        !isAdmin &&
        today !== itemDate
      ) {

        return res
          .status(403)
          .json({
            message:
              "Not allowed",
          });
      }

      Object.assign(
        item,
        req.body
      );

      await item.save();

      return res
        .status(200)
        .json(item);

    } catch {

      return res
        .status(500)
        .json({
          message:
            "Update failed",
        });
    }
  };



// Delete expense transaction
export const deleteExpense =
  async (req, res) => {

    try {

      const item =
        await ExpenseTx.findById(
          req.params.id
        );

      if (!item) {

        return res
          .status(404)
          .json({
            message:
              "Expense not found",
          });
      }

      const isAdmin =
        req.user.role ===
        "admin";

      const today =
        new Date()
          .toISOString()
          .split("T")[0];

      const itemDate =
        item.date
          .toISOString()
          .split("T")[0];

      if (
        !isAdmin &&
        today !== itemDate
      ) {

        return res
          .status(403)
          .json({
            message:
              "Not allowed",
          });
      }

      await item.deleteOne();

      return res
        .status(200)
        .json({
          message:
            "Deleted",
        });

    } catch {

      return res
        .status(500)
        .json({
          message:
            "Delete failed",
        });
    }
  };