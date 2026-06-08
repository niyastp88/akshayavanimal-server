import Service from "../models/Service.js";

// Create service
export const createService = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Service name required",
      });
    }

    const existing = await Service.findOne({
      name,
    });

    if (existing) {
      return res.status(409).json({
        message: "Service already exists",
      });
    }

    const service = await Service.create(req.body);

    return res.status(201).json(service);
  } catch {
    return res.status(500).json({
      message: "Failed to create service",
    });
  }
};

// 🟢 തിരുത്തിയ പുതിയ getServices കൺട്രോളർ
export const getServices = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10; // ഫോം പേജിൽ നിന്ന് 1000 എന്ന് വരും
    const skip = (page - 1) * limit;

    const total = await Service.countDocuments();

    // ലിമിറ്റ് 50-ൽ കൂടുതൽ ആണെങ്കിൽ A to Z ഓർഡർ, അല്ലെങ്കിൽ പുതിയത് ആദ്യം
    const sortOrder = limit > 50 ? { name: 1 } : { createdAt: -1 };

    const data = await Service.find()
      

    // എപ്പോഴും ഒരേ ഫോർമാറ്റിൽ (data, page, total) തന്നെ റിട്ടേൺ ചെയ്യുന്നു. 
    // ഇത് നിങ്ങളുടെ ഫ്രണ്ട്-എൻഡ് റെഡക്സ് ക്രാഷ് ആകാതിരിക്കാൻ സഹായിക്കും.
    return res.status(200).json({
      data,
      page,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch services",
      error: err.message
    });
  }
};

// Update service
export const updateService = async (req, res) => {
  try {
    const item = await Service.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    const existing = await Service.findOne({
      name: req.body.name,
      _id: {
        $ne: req.params.id,
      },
    });

    if (existing) {
      return res.status(409).json({
        message: "Service already exists",
      });
    }

    Object.assign(item, req.body);

    await item.save();

    return res.status(200).json(item);
  } catch {
    return res.status(500).json({
      message: "Failed to update service",
    });
  }
};

// Delete service
export const deleteService = async (req, res) => {
  try {
    const item = await Service.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    await item.deleteOne();

    return res.status(200).json({
      message: "Service deleted",
    });
  } catch {
    return res.status(500).json({
      message: "Delete failed",
    });
  }
};
