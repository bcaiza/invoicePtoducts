import RawMaterial from "../../models/RawMaterial.js";
import { Op } from "sequelize";
import { createAuditLog } from "../utils/auditHelper.js";

export const getRawMaterials = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, active } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};
    if (search) whereClause.name = { [Op.iLike]: `%${search}%` };
    if (active !== undefined) whereClause.active = active === "true";

    const { count, rows } = await RawMaterial.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["name", "ASC"]],
    });

    res.json({
      data: rows,
      pagination: {
        total: count,
        per_page: parseInt(limit),
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching raw materials", error: error.message });
  }
};

export const getRawMaterialById = async (req, res) => {
  try {
    const { id } = req.params;
    const rawMaterial = await RawMaterial.findByPk(id);

    if (!rawMaterial) {
      return res.status(404).json({ message: "Raw material not found" });
    }

    res.json(rawMaterial);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching raw material", error: error.message });
  }
};

export const createRawMaterial = async (req, res) => {
  try {
    const { name, description, active } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const rawMaterial = await RawMaterial.create({
      name,
      description: description || null,
      active: active !== undefined ? active : true,
    });
    await createAuditLog({
      entityType: "RawMaterial",
      entityId: rawMaterial.id,
      action: "CREATE",
      userId: req.user?.id,
      userEmail: req.user?.email,
      changes: { after: rawMaterial.toJSON() },
      req,
    });
    res.status(201).json(rawMaterial);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res
        .status(400)
        .json({ message: "Ya existe una materia prima con ese nombre" });
    }
    res
      .status(500)
      .json({ message: "Error creating raw material", error: error.message });
  }
};

export const updateRawMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, active } = req.body;

    const rawMaterial = await RawMaterial.findByPk(id);

    if (!rawMaterial) {
      return res.status(404).json({ message: "Raw material not found" });
    }
    const beforeUpdate = rawMaterial.toJSON();

    await rawMaterial.update({
      name,
      description,
      active,
    });
    await createAuditLog({
      entityType: "RawMaterial",
      entityId: id,
      action: "UPDATE",
      userId: req.user?.id,
      userEmail: req.user?.email,
      changes: { before: beforeUpdate, after: rawMaterial.toJSON() },
      req,
    });
    res.json(rawMaterial);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res
        .status(400)
        .json({ message: "Ya existe una materia prima con ese nombre" });
    }
    res
      .status(500)
      .json({ message: "Error updating raw material", error: error.message });
  }
};

export const deleteRawMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const rawMaterial = await RawMaterial.findByPk(id);

    if (!rawMaterial) {
      return res.status(404).json({ message: "Raw material not found" });
    }
    const beforeDelete = rawMaterial.toJSON();

    await rawMaterial.destroy();
    await createAuditLog({
      entityType: "RawMaterial",
      entityId: id,
      action: "DELETE",
      userId: req.user?.id,
      userEmail: req.user?.email,
      changes: { before: beforeDelete },
      req,
    });

    res.json({ message: "Raw material deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting raw material", error: error.message });
  }
};
