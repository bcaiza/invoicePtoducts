import AuditLog from '../../models/AuditLog.js';
import { Op } from 'sequelize';

export const getAuditLogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50,
      entity_type,
      entity_id,
      action,
      user_id,
      start_date,
      end_date
    } = req.query;
    
    const offset = (page - 1) * limit;
    let whereClause = {};
    
    if (entity_type) whereClause.entity_type = entity_type;
    if (entity_id) whereClause.entity_id = entity_id;
    if (action) whereClause.action = action;
    if (user_id) whereClause.user_id = user_id;
    
    if (start_date || end_date) {
      whereClause.createdAt = {};
      if (start_date) whereClause.createdAt[Op.gte] = new Date(start_date);
      if (end_date) whereClause.createdAt[Op.lte] = new Date(end_date);
    }

    const { count, rows } = await AuditLog.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      data: rows,
      pagination: {
        total: count,
        per_page: parseInt(limit),
        current_page: parseInt(page),
        total_pages: totalPages
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching audit logs', 
      error: error.message 
    });
  }
};

export const getAuditStats = async (req, res) => {
  try {
    const total = await AuditLog.count();
    
    const byAction = await AuditLog.findAll({
      attributes: [
        'action',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['action']
    });

    const byEntity = await AuditLog.findAll({
      attributes: [
        'entity_type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['entity_type']
    });

    res.json({
      total,
      by_action: byAction,
      by_entity: byEntity
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching audit statistics', 
      error: error.message 
    });
  }
};