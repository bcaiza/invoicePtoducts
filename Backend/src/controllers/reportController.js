import Invoice from '../../models/Invoice.js';
import InvoiceDetail from '../../models/InvoiceDetail.js';
import Product from '../../models/Product.js';
import Customer from '../../models/Customer.js';
import Unit from '../../models/Unit.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

export const getSalesByPeriod = async (req, res) => {
  try {
    const { start_date, end_date, customer_id } = req.query;

    const whereClause = {};
    
    if (start_date && end_date) {
      whereClause.invoice_date = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    } else if (start_date) {
      whereClause.invoice_date = {
        [Op.gte]: new Date(start_date)
      };
    } else if (end_date) {
      whereClause.invoice_date = {
        [Op.lte]: new Date(end_date)
      };
    }

    if (customer_id) {
      whereClause.customer_id = customer_id;
    }

    const invoices = await Invoice.findAll({
      where: whereClause,
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'phone', 'email', 'address']
        },
        {
          model: InvoiceDetail,
          as: 'details',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'pvp', 'weight', 'stock']
            },
            {
              model: Unit,
              as: 'unit',
              attributes: ['id', 'name', 'abbreviation']
            }
          ]
        }
      ],
      order: [['invoice_date', 'DESC']]
    });

    const totalSales = invoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
    const totalTax = invoices.reduce((sum, inv) => sum + parseFloat(inv.tax || 0), 0);
    const totalDiscount = invoices.reduce((sum, inv) => sum + parseFloat(inv.discount || 0), 0);

    res.json({
      success: true,
      data: {
        period: {
          start_date: start_date || 'Desde el inicio',
          end_date: end_date || 'Hasta hoy'
        },
        summary: {
          total_invoices: invoices.length,
          total_sales: parseFloat(totalSales.toFixed(2)),
          total_tax: parseFloat(totalTax.toFixed(2)),
          total_discount: parseFloat(totalDiscount.toFixed(2)),
          net_total: parseFloat((totalSales - totalDiscount).toFixed(2))
        },
        invoices
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching sales report',
      error: error.message
    });
  }
};

export const getTopSellingProducts = async (req, res) => {
  try {
    const { start_date, end_date, limit = 10 } = req.query;

    let whereClause = '';
    if (start_date && end_date) {
      whereClause = `WHERE i.invoice_date BETWEEN '${start_date}' AND '${end_date}'`;
    } else if (start_date) {
      whereClause = `WHERE i.invoice_date >= '${start_date}'`;
    } else if (end_date) {
      whereClause = `WHERE i.invoice_date <= '${end_date}'`;
    }

    const query = `
      SELECT 
        p.id,
        p.name as product_name,
        p.pvp,
        p.weight,
        p.stock as current_stock,
        u.name as unit_name,
        u.abbreviation as unit_abbr,
        COUNT(DISTINCT i.id) as times_sold,
        SUM(id.quantity) as total_quantity_sold,
        SUM(id.subtotal) as total_revenue,
        AVG(id.unit_price) as average_price
      FROM invoice_details id
      INNER JOIN products p ON id.product_id = p.id
      INNER JOIN invoices i ON id.invoice_id = i.id
      LEFT JOIN units u ON id.unit_id = u.id
      ${whereClause}
      GROUP BY p.id, p.name, p.pvp, p.weight, p.stock, u.name, u.abbreviation
      ORDER BY total_revenue DESC
      LIMIT ${limit}
    `;

    const [results] = await sequelize.query(query);

    const totalRevenue = results.reduce((sum, item) => 
      sum + parseFloat(item.total_revenue || 0), 0
    );

    res.json({
      success: true,
      data: {
        period: {
          start_date: start_date || 'Desde el inicio',
          end_date: end_date || 'Hasta hoy'
        },
        summary: {
          total_products: results.length,
          total_revenue: parseFloat(totalRevenue.toFixed(2))
        },
        products: results.map(item => ({
          ...item,
          total_revenue: parseFloat(item.total_revenue || 0).toFixed(2),
          average_price: parseFloat(item.average_price || 0).toFixed(2),
          percentage_of_total: totalRevenue > 0 
            ? ((parseFloat(item.total_revenue || 0) / totalRevenue) * 100).toFixed(2) + '%'
            : '0.00%'
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching top selling products',
      error: error.message
    });
  }
};

export const getInvoiceDetails = async (req, res) => {
  try {
    const { invoice_id } = req.params;

    const invoice = await Invoice.findByPk(invoice_id, {
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'phone', 'email', 'address', 'identification']
        },
        {
          model: InvoiceDetail,
          as: 'details',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'pvp', 'weight', 'stock']
            },
            {
              model: Unit,
              as: 'unit',
              attributes: ['id', 'name', 'abbreviation']
            }
          ]
        }
      ]
    });

    if (!invoice) {
      return res.status(404).json({ 
        message: 'Invoice not found' 
      });
    }

    const totalItems = invoice.details.reduce((sum, detail) => 
      sum + parseFloat(detail.quantity || 0), 0
    );

    res.json({
      success: true,
      data: {
        invoice: {
          id: invoice.id,
          invoice_number: invoice.invoice_number,
          invoice_date: invoice.invoice_date,
          status: invoice.status,
          payment_method: invoice.payment_method,
          notes: invoice.notes
        },
        customer: invoice.customer,
        items: invoice.details.map(detail => ({
          product_id: detail.product.id,
          product_name: detail.product_name || detail.product.name,
          pvp: parseFloat(detail.product.pvp || 0),
          weight: parseFloat(detail.product.weight || 0),
          stock: detail.product.stock,
          quantity: parseFloat(detail.quantity || 0),
          unit: detail.unit ? detail.unit.name : detail.unit_name || 'Unidad',
          unit_abbr: detail.unit ? detail.unit.abbreviation : 'un',
          unit_price: parseFloat(detail.unit_price || 0),
          subtotal: parseFloat(detail.subtotal || 0)
        })),
        summary: {
          total_items: invoice.details.length,
          total_quantity: totalItems,
          subtotal: parseFloat(invoice.subtotal || 0),
          discount: parseFloat(invoice.discount || 0),
          tax: parseFloat(invoice.tax || 0),
          total: parseFloat(invoice.total || 0)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching invoice details',
      error: error.message
    });
  }
};

export const getSalesByCustomer = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let whereClause = '';
    if (start_date && end_date) {
      whereClause = `WHERE i.invoice_date BETWEEN '${start_date}' AND '${end_date}'`;
    } else if (start_date) {
      whereClause = `WHERE i.invoice_date >= '${start_date}'`;
    } else if (end_date) {
      whereClause = `WHERE i.invoice_date <= '${end_date}'`;
    }

    const query = `
      SELECT 
        c.id,
        c.name as customer_name,
        c.phone,
        c.email,
        COUNT(DISTINCT i.id) as total_invoices,
        SUM(i.total) as total_spent,
        AVG(i.total) as average_ticket,
        MAX(i.invoice_date) as last_purchase_date,
        MIN(i.invoice_date) as first_purchase_date
      FROM customers c
      INNER JOIN invoices i ON c.id = i.customer_id
      ${whereClause}
      GROUP BY c.id, c.name, c.phone, c.email
      ORDER BY total_spent DESC
    `;

    const [results] = await sequelize.query(query);

    const totalRevenue = results.reduce((sum, item) => 
      sum + parseFloat(item.total_spent || 0), 0
    );

    res.json({
      success: true,
      data: {
        period: {
          start_date: start_date || 'Desde el inicio',
          end_date: end_date || 'Hasta hoy'
        },
        summary: {
          total_customers: results.length,
          total_revenue: parseFloat(totalRevenue.toFixed(2))
        },
        customers: results.map(item => ({
          ...item,
          total_spent: parseFloat(item.total_spent || 0).toFixed(2),
          average_ticket: parseFloat(item.average_ticket || 0).toFixed(2),
          percentage_of_total: totalRevenue > 0
            ? ((parseFloat(item.total_spent || 0) / totalRevenue) * 100).toFixed(2) + '%'
            : '0.00%'
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching sales by customer',
      error: error.message
    });
  }
};

export const getDailySalesSummary = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let whereClause = '';
    if (start_date && end_date) {
      whereClause = `WHERE invoice_date BETWEEN '${start_date}' AND '${end_date}'`;
    } else if (start_date) {
      whereClause = `WHERE invoice_date >= '${start_date}'`;
    } else if (end_date) {
      whereClause = `WHERE invoice_date <= '${end_date}'`;
    }

    const query = `
      SELECT 
        DATE(invoice_date) as sale_date,
        COUNT(id) as total_invoices,
        SUM(total) as total_sales,
        SUM(tax) as total_tax,
        SUM(discount) as total_discount,
        AVG(total) as average_ticket
      FROM invoices
      ${whereClause}
      GROUP BY DATE(invoice_date)
      ORDER BY sale_date DESC
    `;

    const [results] = await sequelize.query(query);

    const grandTotal = results.reduce((sum, item) => 
      sum + parseFloat(item.total_sales || 0), 0
    );

    res.json({
      success: true,
      data: {
        period: {
          start_date: start_date || 'Desde el inicio',
          end_date: end_date || 'Hasta hoy'
        },
        summary: {
          total_days: results.length,
          grand_total: parseFloat(grandTotal.toFixed(2)),
          average_daily_sales: results.length > 0 
            ? parseFloat((grandTotal / results.length).toFixed(2))
            : 0
        },
        daily_sales: results.map(item => ({
          date: item.sale_date,
          total_invoices: item.total_invoices,
          total_sales: parseFloat(item.total_sales || 0).toFixed(2),
          total_tax: parseFloat(item.total_tax || 0).toFixed(2),
          total_discount: parseFloat(item.total_discount || 0).toFixed(2),
          average_ticket: parseFloat(item.average_ticket || 0).toFixed(2)
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching daily sales summary',
      error: error.message
    });
  }
};

export const getSalesByPaymentMethod = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let whereClause = '';
    if (start_date && end_date) {
      whereClause = `WHERE invoice_date BETWEEN '${start_date}' AND '${end_date}'`;
    } else if (start_date) {
      whereClause = `WHERE invoice_date >= '${start_date}'`;
    } else if (end_date) {
      whereClause = `WHERE invoice_date <= '${end_date}'`;
    }

    const query = `
      SELECT 
        payment_method,
        COUNT(id) as total_transactions,
        SUM(total) as total_amount,
        AVG(total) as average_amount
      FROM invoices
      ${whereClause}
      GROUP BY payment_method
      ORDER BY total_amount DESC
    `;

    const [results] = await sequelize.query(query);

    const grandTotal = results.reduce((sum, item) => 
      sum + parseFloat(item.total_amount || 0), 0
    );

    res.json({
      success: true,
      data: {
        period: {
          start_date: start_date || 'Desde el inicio',
          end_date: end_date || 'Hasta hoy'
        },
        summary: {
          total_methods: results.length,
          grand_total: parseFloat(grandTotal.toFixed(2))
        },
        payment_methods: results.map(item => ({
          method: item.payment_method || 'No especificado',
          transactions: item.total_transactions,
          total_amount: parseFloat(item.total_amount || 0).toFixed(2),
          average_amount: parseFloat(item.average_amount || 0).toFixed(2),
          percentage: grandTotal > 0
            ? ((parseFloat(item.total_amount || 0) / grandTotal) * 100).toFixed(2) + '%'
            : '0.00%'
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching sales by payment method',
      error: error.message
    });
  }
};

export const getProductInventoryReport = async (req, res) => {
  try {
    const { low_stock_threshold = 10 } = req.query;

    const query = `
      SELECT 
        p.id,
        p.name,
        p.pvp,
        p.weight,
        p.stock as current_stock,
        COALESCE(SUM(id.quantity), 0) as total_sold,
        COALESCE(COUNT(DISTINCT i.id), 0) as times_sold,
        COALESCE(SUM(id.subtotal), 0) as total_revenue,
        CASE 
          WHEN p.stock <= 5 THEN 'CRÍTICO'
          WHEN p.stock <= ${low_stock_threshold} THEN 'BAJO'
          ELSE 'NORMAL'
        END as stock_status
      FROM products p
      LEFT JOIN invoice_details id ON p.id = id.product_id
      LEFT JOIN invoices i ON id.invoice_id = i.id
      GROUP BY p.id, p.name, p.pvp, p.weight, p.stock
      ORDER BY p.name
    `;

    const [results] = await sequelize.query(query);

    const lowStockProducts = results.filter(p => p.stock_status !== 'NORMAL');

    res.json({
      success: true,
      data: {
        summary: {
          total_products: results.length,
          low_stock_products: lowStockProducts.length,
          critical_stock_products: results.filter(p => p.stock_status === 'CRÍTICO').length
        },
        products: results.map(item => ({
          ...item,
          current_stock: parseFloat(item.current_stock || 0),
          total_sold: parseFloat(item.total_sold || 0),
          total_revenue: parseFloat(item.total_revenue || 0).toFixed(2),
          stock_value: (parseFloat(item.current_stock || 0) * parseFloat(item.pvp || 0)).toFixed(2)
        })),
        alerts: lowStockProducts
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching inventory report',
      error: error.message
    });
  }
};

export const getInvoiceProductsDetail = async (req, res) => {
  try {
    const { start_date, end_date, customer_id, product_id, unit_id } = req.query;

    let whereClause = 'WHERE 1=1';
    
    if (start_date && end_date) {
      whereClause += ` AND i.invoice_date BETWEEN '${start_date}' AND '${end_date}'`;
    } else if (start_date) {
      whereClause += ` AND i.invoice_date >= '${start_date}'`;
    } else if (end_date) {
      whereClause += ` AND i.invoice_date <= '${end_date}'`;
    }

    if (customer_id) {
      whereClause += ` AND c.id = '${customer_id}'`;
    }

    if (product_id) {
      whereClause += ` AND p.id = '${product_id}'`;
    }

    if (unit_id) {
      whereClause += ` AND u.id = '${unit_id}'`;
    }

    const query = `
      SELECT 
        i.id as invoice_id,
        i.invoice_number,
        i.invoice_date,
        i.status,
        i.payment_method,
        i.total as invoice_total,
        c.id as customer_id,
        c.name as customer_name,
        c.phone as customer_phone,
        c.email as customer_email,
        p.id as product_id,
        p.name as product_name,
        p.pvp as product_pvp,
        p.stock as product_stock,
        id.product_name as detail_product_name,
        id.quantity,
        id.quantity_base_unit,
        id.unit_price,
        id.subtotal,
        u.id as unit_id,
        u.name as unit_name,
        u.abbreviation as unit_abbr,
        u.type as unit_type,
        pu.quantity as unit_conversion_factor,
        pu.is_base_unit,
        pu.is_sales_unit
      FROM invoice_details id
      INNER JOIN invoices i ON id.invoice_id = i.id
      INNER JOIN products p ON id.product_id = p.id
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN units u ON id.unit_id = u.id
      LEFT JOIN product_units pu ON pu.product_id = p.id AND pu.unit_id = u.id
      ${whereClause}
      ORDER BY i.invoice_date DESC, i.invoice_number, p.name
    `;

    const [results] = await sequelize.query(query);

    const groupedByInvoice = results.reduce((acc, row) => {
      const invoiceId = row.invoice_id;
      
      if (!acc[invoiceId]) {
        acc[invoiceId] = {
          invoice_id: row.invoice_id,
          invoice_number: row.invoice_number,
          invoice_date: row.invoice_date,
          status: row.status,
          payment_method: row.payment_method,
          invoice_total: parseFloat(row.invoice_total || 0).toFixed(2),
          customer: {
            id: row.customer_id,
            name: row.customer_name,
            phone: row.customer_phone,
            email: row.customer_email
          },
          products: []
        };
      }

      acc[invoiceId].products.push({
        product_id: row.product_id,
        product_name: row.detail_product_name || row.product_name,
        product_pvp: parseFloat(row.product_pvp || 0).toFixed(2),
        product_stock: row.product_stock,
        quantity_sold: parseFloat(row.quantity || 0),
        quantity_in_base_unit: parseFloat(row.quantity_base_unit || 0),
        unit: {
          id: row.unit_id,
          name: row.unit_name || 'N/A',
          abbreviation: row.unit_abbr || 'N/A',
          type: row.unit_type,
          is_base_unit: row.is_base_unit,
          is_sales_unit: row.is_sales_unit,
          conversion_factor: parseFloat(row.unit_conversion_factor || 1)
        },
        unit_price: parseFloat(row.unit_price || 0).toFixed(2),
        subtotal: parseFloat(row.subtotal || 0).toFixed(2)
      });

      return acc;
    }, {});

    const invoices = Object.values(groupedByInvoice);

    const totalProducts = results.length;
    const totalRevenue = results.reduce((sum, row) => sum + parseFloat(row.subtotal || 0), 0);
    const totalQuantity = results.reduce((sum, row) => sum + parseFloat(row.quantity || 0), 0);

    const productsSummary = results.reduce((acc, row) => {
      const productName = row.detail_product_name || row.product_name;
      if (!acc[productName]) {
        acc[productName] = {
          product_name: productName,
          total_quantity: 0,
          total_revenue: 0,
          times_sold: 0,
          units_used: new Set()
        };
      }
      
      acc[productName].total_quantity += parseFloat(row.quantity || 0);
      acc[productName].total_revenue += parseFloat(row.subtotal || 0);
      acc[productName].times_sold += 1;
      if (row.unit_name) {
        acc[productName].units_used.add(row.unit_name);
      }
      
      return acc;
    }, {});

    const productsSummaryArray = Object.values(productsSummary).map(item => ({
      ...item,
      units_used: Array.from(item.units_used),
      total_revenue: parseFloat(item.total_revenue).toFixed(2),
      average_price: item.total_quantity > 0 ? (item.total_revenue / item.total_quantity).toFixed(2) : '0.00'
    })).sort((a, b) => b.total_revenue - a.total_revenue);

    res.json({
      success: true,
      data: {
        filters: {
          start_date: start_date || 'Desde el inicio',
          end_date: end_date || 'Hasta hoy',
          customer_id: customer_id || 'Todos',
          product_id: product_id || 'Todos',
          unit_id: unit_id || 'Todas'
        },
        summary: {
          total_invoices: invoices.length,
          total_products: totalProducts,
          total_quantity: parseFloat(totalQuantity).toFixed(2),
          total_revenue: parseFloat(totalRevenue).toFixed(2)
        },
        products_summary: productsSummaryArray,
        invoices: invoices
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching invoice products detail',
      error: error.message
    });
  }
};