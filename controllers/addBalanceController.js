import AddBalance from "../models/AddBalance.js";

// Create balance type
export const createBalanceType =
  async (req, res) => {

    try {

      const { name } =
        req.body;

      if (!name) {
        return res
          .status(400)
          .json({
            message:
              "Name is required",
          });
      }

      const existing =
        await AddBalance.findOne({
          name,
        });

      if (existing) {
        return res
          .status(409)
          .json({
            message:
              "Type already exists",
          });
      }

      const data =
        await AddBalance.create({
          name,
        });

      return res
        .status(201)
        .json(data);

    } catch (error) {

      return res
        .status(500)
        .json({
          message:
            "Failed to create balance type",
        });
    }
  };


// Get balance types
export const getBalanceTypes =
  async (req, res) => {

    try {

      const data =
        await AddBalance.find()
          .sort({
            name: 1,
          });

      return res
        .status(200)
        .json(data);

    } catch (error) {

      return res
        .status(500)
        .json({
          message:
            "Failed to fetch balance types",
        });
    }
  };