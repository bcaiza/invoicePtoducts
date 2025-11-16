import Invoice from '../../models/Invoice.js';
import InvoiceDetail from '../../models/InvoiceDetail.js';
import Customer from '../../models/Customer.js';
import Product from '../../models/Product.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

export const getInvoices = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
      customer_id,
      search
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    let whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }

    if (customer_id) {
      whereClause.customer_id = customer_id;
    }
    
    if (search) {
      whereClause.invoice_number = { [Op.iLike]: `%${search}%` };
    }

    const { count, rows } = await Invoice.findAndCountAll({ 
      where: whereClause,
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'identification', 'identification_type']
        },
        {
          model: InvoiceDetail,
          as: 'details',
          attributes: ['id', 'product_name', 'quantity', 'unit_price', 'subtotal']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['invoice_date', 'DESC']],
      distinct: true
    });

    const totalPages = Math.ceil(count / limit);
    const currentPage = parseInt(page);

    res.json({
      data: rows,
      pagination: {
        total: count,
        per_page: parseInt(limit),
        current_page: currentPage,
        total_pages: totalPages,
        from: offset + 1,
        to: offset + rows.length,
        has_next: currentPage < totalPages,
        has_prev: currentPage > 1
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching invoices', 
      error: error.message 
    });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const invoice = await Invoice.findByPk(id, {
      include: [
        {
          model: Customer,
          as: 'customer'
        },
        {
          model: InvoiceDetail,
          as: 'details',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'stock']
            }
          ]
        }
      ]
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching invoice', 
      error: error.message 
    });
  }
};

export const createInvoice = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { 
      customer_id,
      invoice_number,
      invoice_date,
      tax,
      discount,
      payment_method,
      notes,
      details 
    } = req.body;

    if (!customer_id || !invoice_number || !details || details.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'Customer, invoice number and details are required' 
      });
    }

    const customer = await Customer.findByPk(customer_id);
    if (!customer) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Customer not found' });
    }

    const existingInvoice = await Invoice.findOne({ 
      where: { invoice_number } 
    });
    if (existingInvoice) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'Invoice number already exists' 
      });
    }

    let subtotal = 0;
    const invoiceDetails = [];

    for (const detail of details) {
      const product = await Product.findByPk(detail.product_id);
      
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ 
          message: `Product with id ${detail.product_id} not found` 
        });
      }

      if (product.stock < detail.quantity) {
        await transaction.rollback();
        return res.status(400).json({ 
          message: `Insufficient stock for product ${product.name}. Available: ${product.stock}` 
        });
      }

      const detailSubtotal = parseFloat(product.pvp) * parseInt(detail.quantity);
      subtotal += detailSubtotal;

      invoiceDetails.push({
        product_id: product.id,
        product_name: detail.product_name || product.name,
        quantity: detail.quantity,
        unit_price: product.pvp,
        subtotal: detailSubtotal
      });

      await product.update(
        { stock: product.stock - detail.quantity },
        { transaction }
      );
    }

    const taxAmount = parseFloat(tax || 0);
    const discountAmount = parseFloat(discount || 0);
    const total = subtotal + taxAmount - discountAmount;

    const invoice = await Invoice.create({
      customer_id,
      invoice_number,
      invoice_date: invoice_date || new Date(),
      subtotal,
      tax: taxAmount,
      discount: discountAmount,
      total,
      payment_method,
      notes
    }, { transaction });

    for (const detail of invoiceDetails) {
      await InvoiceDetail.create({
        invoice_id: invoice.id,
        ...detail
      }, { transaction });
    }

    await transaction.commit();

    const completeInvoice = await Invoice.findByPk(invoice.id, {
      include: [
        {
          model: Customer,
          as: 'customer'
        },
        {
          model: InvoiceDetail,
          as: 'details'
        }
      ]
    });

    res.status(201).json(completeInvoice);
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    res.status(500).json({ 
      message: 'Error creating invoice', 
      error: error.message 
    });
  }
};

export const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      payment_method,
      notes,
      tax,
      discount
    } = req.body;

    const invoice = await Invoice.findByPk(id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (invoice.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Only pending invoices can be updated' 
      });
    }

    let total = invoice.total;
    if (tax !== undefined || discount !== undefined) {
      const newTax = parseFloat(tax !== undefined ? tax : invoice.tax);
      const newDiscount = parseFloat(discount !== undefined ? discount : invoice.discount);
      total = parseFloat(invoice.subtotal) + newTax - newDiscount;
    }

    await invoice.update({
      payment_method: payment_method || invoice.payment_method,
      notes: notes !== undefined ? notes : invoice.notes,
      tax: tax !== undefined ? tax : invoice.tax,
      discount: discount !== undefined ? discount : invoice.discount,
      total
    });

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating invoice', 
      error: error.message 
    });
  }
};

export const deleteInvoice = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    const invoice = await Invoice.findByPk(id, {
      include: [{ model: InvoiceDetail, as: 'details' }]
    });

    if (!invoice) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (invoice.status !== 'pending') {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'Only pending invoices can be deleted' 
      });
    }

    for (const detail of invoice.details) {
      const product = await Product.findByPk(detail.product_id);
      if (product) {
        await product.update(
          { stock: product.stock + detail.quantity },
          { transaction }
        );
      }
    }

    await invoice.destroy({ transaction });
    
    await transaction.commit();

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    res.status(500).json({ 
      message: 'Error deleting invoice', 
      error: error.message 
    });
  }
};

export const updateInvoiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'paid', 'cancelled'].includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status. Use: pending, paid, or cancelled' 
      });
    }

    const invoice = await Invoice.findByPk(id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    await invoice.update({ status });

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating invoice status', 
      error: error.message 
    });
  }
};

export const getInvoicesByCustomer = async (req, res) => {
  try {
    const { customer_id } = req.params;

    const customer = await Customer.findByPk(customer_id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const invoices = await Invoice.findAll({
      where: { customer_id },
      include: [
        {
          model: InvoiceDetail,
          as: 'details'
        }
      ],
      order: [['invoice_date', 'DESC']]
    });

    res.json({
      customer: {
        id: customer.id,
        name: customer.name,
        identification: customer.identification
      },
      invoices,
      total_invoices: invoices.length
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching customer invoices', 
      error: error.message 
    });
  }
};

export const getInvoiceStats = async (req, res) => {
  try {
    const total = await Invoice.count();
    const pending = await Invoice.count({ where: { status: 'pending' } });
    const paid = await Invoice.count({ where: { status: 'paid' } });
    const cancelled = await Invoice.count({ where: { status: 'cancelled' } });

    const totalSales = await Invoice.sum('total', {
      where: { status: 'paid' }
    });

    const pendingAmount = await Invoice.sum('total', {
      where: { status: 'pending' }
    });

    res.json({
      total,
      pending,
      paid,
      cancelled,
      total_sales: totalSales || 0,
      pending_amount: pendingAmount || 0
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching invoice statistics', 
      error: error.message 
    });
  }
};