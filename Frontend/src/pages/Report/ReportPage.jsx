import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Card,
  Row,
  Col,
  Statistic,
  DatePicker,
  Select,
  Space,
  Tabs,
  Tag,
  Tooltip,
  message,
  Descriptions
} from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  CalendarOutlined,
  DownloadOutlined,
  ReloadOutlined,
  TrophyOutlined,
  WarningOutlined,
  RiseOutlined,
  FileTextOutlined,
  FileExcelOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import reportsService from '../../services/reportService';

const { RangePicker } = DatePicker;
const { Option } = Select;

const ReportsPage = () => {
  const [dateRange, setDateRange] = useState([
    dayjs().startOf('month'),
    dayjs()
  ]);

  const [salesData, setSalesData] = useState({ sales: [], summary: null, loading: false });
  const [productsData, setProductsData] = useState({ products: [], summary: null, loading: false });
  const [customersData, setCustomersData] = useState({ customers: [], summary: null, loading: false });
  const [dailyData, setDailyData] = useState({ dailySales: [], summary: null, loading: false });
  const [inventoryData, setInventoryData] = useState({ products: [], alerts: [], summary: null, loading: false });
  const [detailData, setDetailData] = useState({ invoices: [], productsSummary: [], summary: null, loading: false });

  const [topProductsLimit, setTopProductsLimit] = useState(10);
  const [inventoryThreshold, setInventoryThreshold] = useState(20);
  const [activeTab, setActiveTab] = useState('sales');

  const [detailFilters, setDetailFilters] = useState({
    customer_id: null,
    product_id: null,
    unit_id: null
  });

  useEffect(() => {
    if (activeTab === 'sales') {
      loadSalesData();
    }
  }, [dateRange, activeTab]);

  useEffect(() => {
    if (activeTab === 'products') {
      loadProductsData();
    }
  }, [topProductsLimit, activeTab]);

  useEffect(() => {
    if (activeTab === 'customers') {
      loadCustomersData();
    }
  }, [dateRange, activeTab]);

  useEffect(() => {
    if (activeTab === 'daily') {
      loadDailyData();
    }
  }, [dateRange, activeTab]);

  useEffect(() => {
    if (activeTab === 'inventory') {
      loadInventoryData();
    }
  }, [inventoryThreshold, activeTab]);

  useEffect(() => {
    if (activeTab === 'detail') {
      loadDetailData();
    }
  }, [dateRange, detailFilters, activeTab]);

  const loadSalesData = async () => {
    try {
      setSalesData(prev => ({ ...prev, loading: true }));
      
      const response = await reportsService.getSalesByPeriod({
        start_date: dateRange[0]?.format('YYYY-MM-DD'),
        end_date: dateRange[1]?.format('YYYY-MM-DD')
      });

      setSalesData({
        sales: response.data.invoices || [],
        summary: response.data.summary || null,
        loading: false
      });
    } catch (error) {
      message.error('Error al cargar ventas');
      console.error(error);
      setSalesData(prev => ({ ...prev, loading: false }));
    }
  };

  const loadProductsData = async () => {
    try {
      setProductsData(prev => ({ ...prev, loading: true }));
      
      const response = await reportsService.getTopSellingProducts({
        limit: topProductsLimit,
        start_date: dateRange[0]?.format('YYYY-MM-DD'),
        end_date: dateRange[1]?.format('YYYY-MM-DD')
      });

      setProductsData({
        products: response.data.products || [],
        summary: response.data.summary || null,
        loading: false
      });
    } catch (error) {
      message.error('Error al cargar productos');
      console.error(error);
      setProductsData(prev => ({ ...prev, loading: false }));
    }
  };

  const loadCustomersData = async () => {
    try {
      setCustomersData(prev => ({ ...prev, loading: true }));
      
      const response = await reportsService.getSalesByCustomer({
        start_date: dateRange[0]?.format('YYYY-MM-DD'),
        end_date: dateRange[1]?.format('YYYY-MM-DD')
      });

      setCustomersData({
        customers: response.data.customers || [],
        summary: response.data.summary || null,
        loading: false
      });
    } catch (error) {
      message.error('Error al cargar clientes');
      console.error(error);
      setCustomersData(prev => ({ ...prev, loading: false }));
    }
  };

  const loadDailyData = async () => {
    try {
      setDailyData(prev => ({ ...prev, loading: true }));
      
      const response = await reportsService.getDailySalesSummary({
        start_date: dateRange[0]?.format('YYYY-MM-DD'),
        end_date: dateRange[1]?.format('YYYY-MM-DD')
      });

      setDailyData({
        dailySales: response.data.daily_sales || [],
        summary: response.data.summary || null,
        loading: false
      });
    } catch (error) {
      message.error('Error al cargar resumen diario');
      console.error(error);
      setDailyData(prev => ({ ...prev, loading: false }));
    }
  };

  const loadInventoryData = async () => {
    try {
      setInventoryData(prev => ({ ...prev, loading: true }));
      
      const response = await reportsService.getProductInventoryReport({
        low_stock_threshold: inventoryThreshold
      });

      setInventoryData({
        products: response.data.products || [],
        alerts: response.data.alerts || [],
        summary: response.data.summary || null,
        loading: false
      });
    } catch (error) {
      message.error('Error al cargar inventario');
      console.error(error);
      setInventoryData(prev => ({ ...prev, loading: false }));
    }
  };

  const loadDetailData = async () => {
    try {
      setDetailData(prev => ({ ...prev, loading: true }));
      
      const params = {
        start_date: dateRange[0]?.format('YYYY-MM-DD'),
        end_date: dateRange[1]?.format('YYYY-MM-DD')
      };

      if (detailFilters.customer_id) params.customer_id = detailFilters.customer_id;
      if (detailFilters.product_id) params.product_id = detailFilters.product_id;
      if (detailFilters.unit_id) params.unit_id = detailFilters.unit_id;

      const response = await reportsService.getInvoiceProductsDetail(params);

      setDetailData({
        invoices: response.data.invoices || [],
        productsSummary: response.data.products_summary || [],
        summary: response.data.summary || null,
        loading: false
      });
    } catch (error) {
      message.error('Error al cargar detalle de productos');
      console.error(error);
      setDetailData(prev => ({ ...prev, loading: false }));
    }
  };

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      message.warning('No hay datos para exportar');
      return;
    }

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(val => `"${val || ''}"`).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${dayjs().format('YYYY-MM-DD')}.csv`);
    link.click();
    
    message.success('Archivo CSV exportado correctamente');
  };

  const exportToExcel = (data, filename) => {
    if (!data || data.length === 0) {
      message.warning('No hay datos para exportar');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
    
    const excelFilename = `${filename}_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    XLSX.writeFile(workbook, excelFilename);
    
    message.success('Archivo Excel exportado correctamente');
  };

  const exportDetailToExcel = () => {
    if (!detailData.invoices || detailData.invoices.length === 0) {
      message.warning('No hay datos para exportar');
      return;
    }

    const flattenedData = [];
    
    detailData.invoices.forEach(invoice => {
      invoice.products.forEach(product => {
        flattenedData.push({
          'Nº Factura': invoice.invoice_number,
          'Fecha': dayjs(invoice.invoice_date).format('DD/MM/YYYY'),
          'Cliente': invoice.customer.name,
          'Teléfono': invoice.customer.phone || '',
          'Email': invoice.customer.email || '',
          'Producto': product.product_name,
          'Cantidad': product.quantity_sold,
          'Unidad': product.unit.name,
          'Abrev. Unidad': product.unit.abbreviation,
          'Tipo Unidad': product.unit.type || '',
          'Cantidad Base': product.quantity_in_base_unit,
          'Factor Conversión': product.unit.conversion_factor,
          'Es Unidad Base': product.unit.is_base_unit ? 'Sí' : 'No',
          'Precio Unitario': product.unit_price,
          'Subtotal': product.subtotal,
          'Total Factura': invoice.invoice_total,
          'Estado': invoice.status === 'paid' ? 'Pagada' : invoice.status === 'pending' ? 'Pendiente' : 'Cancelada',
          'Método Pago': invoice.payment_method || ''
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(flattenedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Detalle Productos');
    
    const excelFilename = `detalle_productos_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    XLSX.writeFile(workbook, excelFilename);
    
    message.success('Archivo Excel exportado correctamente');
  };

  const exportDetailToCSV = () => {
    if (!detailData.invoices || detailData.invoices.length === 0) {
      message.warning('No hay datos para exportar');
      return;
    }

    const flattenedData = [];
    
    detailData.invoices.forEach(invoice => {
      invoice.products.forEach(product => {
        flattenedData.push({
          'Factura': invoice.invoice_number,
          'Fecha': dayjs(invoice.invoice_date).format('DD/MM/YYYY'),
          'Cliente': invoice.customer.name,
          'Producto': product.product_name,
          'Cantidad': product.quantity_sold,
          'Unidad': product.unit.name,
          'Cantidad Base': product.quantity_in_base_unit,
          'Factor': product.unit.conversion_factor,
          'Precio Unit.': product.unit_price,
          'Subtotal': product.subtotal,
          'Total Factura': invoice.invoice_total
        });
      });
    });

    const headers = Object.keys(flattenedData[0]).join(',');
    const rows = flattenedData.map(row => 
      Object.values(row).map(val => `"${val || ''}"`).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `detalle_productos_${dayjs().format('YYYY-MM-DD')}.csv`);
    link.click();
    
    message.success('Archivo CSV exportado correctamente');
  };

  const rangePresets = [
    {
      label: 'Hoy',
      value: [dayjs(), dayjs()]
    },
    {
      label: 'Última Semana',
      value: [dayjs().subtract(7, 'days'), dayjs()]
    },
    {
      label: 'Este Mes',
      value: [dayjs().startOf('month'), dayjs()]
    },
    {
      label: 'Mes Pasado',
      value: [
        dayjs().subtract(1, 'month').startOf('month'), 
        dayjs().subtract(1, 'month').endOf('month')
      ]
    },
    {
      label: 'Este Año',
      value: [dayjs().startOf('year'), dayjs()]
    }
  ];

  const salesColumns = [
    {
      title: 'Factura',
      dataIndex: 'invoice_number',
      key: 'invoice_number',
      fixed: 'left',
      width: 150,
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Fecha',
      dataIndex: 'invoice_date',
      key: 'invoice_date',
      width: 120,
      render: (date) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Cliente',
      dataIndex: ['customer', 'name'],
      key: 'customer',
      width: 200,
      render: (text) => text || 'N/A'
    },
    {
      title: 'Método Pago',
      dataIndex: 'payment_method',
      key: 'payment_method',
      width: 120,
      render: (method) => (
        <Tag color={method === 'cash' ? 'green' : method === 'card' ? 'blue' : method === 'transfer' ? 'purple' : 'orange'}>
          {method || 'N/A'}
        </Tag>
      )
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      width: 120,
      align: 'right',
      render: (val) => `$${parseFloat(val || 0).toFixed(2)}`
    },
    {
      title: 'IVA',
      dataIndex: 'tax',
      key: 'tax',
      width: 100,
      align: 'right',
      render: (val) => `$${parseFloat(val || 0).toFixed(2)}`
    },
    {
      title: 'Descuento',
      dataIndex: 'discount',
      key: 'discount',
      width: 120,
      align: 'right',
      render: (val) => `$${parseFloat(val || 0).toFixed(2)}`
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 120,
      align: 'right',
      fixed: 'right',
      render: (val) => <strong style={{ color: '#52c41a' }}>${parseFloat(val || 0).toFixed(2)}</strong>
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      fixed: 'right',
      render: (status) => (
        <Tag color={status === 'paid' ? 'green' : status === 'pending' ? 'orange' : 'red'}>
          {status === 'paid' ? 'Pagada' : status === 'pending' ? 'Pendiente' : 'Cancelada'}
        </Tag>
      )
    }
  ];

  const productsColumns = [
    {
      title: '#',
      key: 'rank',
      width: 60,
      align: 'center',
      render: (_, __, index) => (
        <Tag color={index < 3 ? 'gold' : 'default'}>
          {index + 1}
        </Tag>
      )
    },
    {
      title: 'Producto',
      dataIndex: 'product_name',
      key: 'product_name',
      width: 250,
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Stock Actual',
      dataIndex: 'current_stock',
      key: 'current_stock',
      width: 120,
      align: 'center',
      render: (stock) => (
        <Tag color={stock === 0 ? 'red' : stock < 10 ? 'orange' : 'green'}>
          {stock}
        </Tag>
      )
    },
    {
      title: 'Unidades Vendidas',
      dataIndex: 'total_quantity_sold',
      key: 'total_quantity_sold',
      width: 150,
      align: 'right',
      sorter: (a, b) => a.total_quantity_sold - b.total_quantity_sold
    },
    {
      title: 'Veces Vendido',
      dataIndex: 'times_sold',
      key: 'times_sold',
      width: 120,
      align: 'center'
    },
    {
      title: 'Precio Promedio',
      dataIndex: 'average_price',
      key: 'average_price',
      width: 140,
      align: 'right',
      render: (val) => `$${val}`
    },
    {
      title: 'Ingresos Totales',
      dataIndex: 'total_revenue',
      key: 'total_revenue',
      width: 150,
      align: 'right',
      render: (val) => <strong style={{ color: '#52c41a' }}>${val}</strong>
    },
    {
      title: '% del Total',
      dataIndex: 'percentage_of_total',
      key: 'percentage_of_total',
      width: 120,
      align: 'center',
      render: (val) => (
        <Tooltip title="Porcentaje del total de ingresos">
          <Tag color="blue">{val}</Tag>
        </Tooltip>
      )
    }
  ];

  const customersColumns = [
    {
      title: 'Pos.',
      key: 'position',
      width: 60,
      align: 'center',
      render: (_, __, index) => (
        <Tag color={index < 3 ? 'gold' : 'default'}>
          {index < 3 && <TrophyOutlined />} {index + 1}
        </Tag>
      )
    },
    {
      title: 'Cliente',
      dataIndex: 'customer_name',
      key: 'customer_name',
      width: 200,
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Teléfono',
      dataIndex: 'phone',
      key: 'phone',
      width: 120
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200
    },
    {
      title: 'Total Compras',
      dataIndex: 'total_spent',
      key: 'total_spent',
      width: 150,
      align: 'right',
      sorter: (a, b) => parseFloat(a.total_spent) - parseFloat(b.total_spent),
      render: (val) => <strong style={{ color: '#52c41a' }}>${val}</strong>
    },
    {
      title: 'N° Facturas',
      dataIndex: 'total_invoices',
      key: 'total_invoices',
      width: 110,
      align: 'center'
    },
    {
      title: 'Ticket Promedio',
      dataIndex: 'average_ticket',
      key: 'average_ticket',
      width: 140,
      align: 'right',
      render: (val) => `$${val}`
    },
    {
      title: 'Primera Compra',
      dataIndex: 'first_purchase_date',
      key: 'first_purchase_date',
      width: 130,
      render: (date) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Última Compra',
      dataIndex: 'last_purchase_date',
      key: 'last_purchase_date',
      width: 130,
      render: (date) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: '% del Total',
      dataIndex: 'percentage_of_total',
      key: 'percentage_of_total',
      width: 110,
      align: 'center',
      render: (val) => <Tag color="blue">{val}</Tag>
    }
  ];

  const dailyColumns = [
    {
      title: 'Fecha',
      dataIndex: 'date',
      key: 'date',
      width: 130,
      render: (date) => {
        const d = dayjs(date);
        return (
          <div>
            <div><strong>{d.format('DD/MM/YYYY')}</strong></div>
            <small style={{ color: '#8c8c8c' }}>{d.format('dddd')}</small>
          </div>
        );
      }
    },
    {
      title: 'Facturas',
      dataIndex: 'total_invoices',
      key: 'total_invoices',
      width: 100,
      align: 'center',
      render: (val) => <Tag color="blue">{val}</Tag>
    },
    {
      title: 'Ventas',
      dataIndex: 'total_sales',
      key: 'total_sales',
      width: 130,
      align: 'right',
      sorter: (a, b) => parseFloat(a.total_sales) - parseFloat(b.total_sales),
      render: (val) => <strong style={{ color: '#52c41a' }}>${val}</strong>
    },
    {
      title: 'IVA',
      dataIndex: 'total_tax',
      key: 'total_tax',
      width: 110,
      align: 'right',
      render: (val) => `$${val}`
    },
    {
      title: 'Descuentos',
      dataIndex: 'total_discount',
      key: 'total_discount',
      width: 120,
      align: 'right',
      render: (val) => `$${val}`
    },
    {
      title: 'Ticket Promedio',
      dataIndex: 'average_ticket',
      key: 'average_ticket',
      width: 140,
      align: 'right',
      render: (val) => `$${val}`
    }
  ];

  const inventoryColumns = [
    {
      title: 'Producto',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      fixed: 'left',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Peso (kg)',
      dataIndex: 'weight',
      key: 'weight',
      width: 120,
      align: 'center',
      render: (weight) => weight ? `${parseFloat(weight).toFixed(2)} kg` : 'N/A'
    },
    {
      title: 'Stock Actual',
      dataIndex: 'current_stock',
      key: 'current_stock',
      width: 120,
      align: 'center',
      sorter: (a, b) => a.current_stock - b.current_stock,
      render: (stock, record) => (
        <Tag color={
          record.stock_status === 'CRÍTICO' ? 'red' :
          record.stock_status === 'BAJO' ? 'orange' : 'green'
        }>
          {stock}
        </Tag>
      )
    },
    {
      title: 'Total Vendido',
      dataIndex: 'total_sold',
      key: 'total_sold',
      width: 120,
      align: 'right'
    },
    {
      title: 'PVP',
      dataIndex: 'pvp',
      key: 'pvp',
      width: 100,
      align: 'right',
      render: (val) => `$${parseFloat(val || 0).toFixed(2)}`
    },
    {
      title: 'Valor Stock',
      dataIndex: 'stock_value',
      key: 'stock_value',
      width: 130,
      align: 'right',
      render: (val) => <strong>${val}</strong>
    },
    {
      title: 'Ingresos',
      dataIndex: 'total_revenue',
      key: 'total_revenue',
      width: 130,
      align: 'right',
      render: (val) => <strong style={{ color: '#52c41a' }}>${val}</strong>
    },
    {
      title: 'Estado',
      dataIndex: 'stock_status',
      key: 'stock_status',
      width: 120,
      fixed: 'right',
      render: (status) => (
        <Tag 
          icon={status === 'CRÍTICO' ? <WarningOutlined /> : null}
          color={status === 'CRÍTICO' ? 'red' : status === 'BAJO' ? 'orange' : 'green'}
        >
          {status}
        </Tag>
      )
    }
  ];

  const detailColumns = [
    {
      title: 'Factura',
      dataIndex: 'invoice_number',
      key: 'invoice_number',
      width: 120,
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Fecha',
      dataIndex: 'invoice_date',
      key: 'invoice_date',
      width: 110,
      render: (date) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Cliente',
      dataIndex: ['customer', 'name'],
      key: 'customer',
      width: 180
    },
    {
      title: 'Total Productos',
      key: 'total_products',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Tag color="blue">{record.products.length}</Tag>
      )
    },
    {
      title: 'Total Factura',
      dataIndex: 'invoice_total',
      key: 'invoice_total',
      width: 120,
      align: 'right',
      render: (val) => <strong style={{ color: '#52c41a' }}>${val}</strong>
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'paid' ? 'green' : status === 'pending' ? 'orange' : 'red'}>
          {status === 'paid' ? 'Pagada' : status === 'pending' ? 'Pendiente' : 'Cancelada'}
        </Tag>
      )
    }
  ];

  const expandedRowRender = (record) => {
    const productColumns = [
      {
        title: 'Producto',
        dataIndex: 'product_name',
        key: 'product_name',
        width: 200
      },
      {
        title: 'Cantidad',
        dataIndex: 'quantity_sold',
        key: 'quantity_sold',
        width: 100,
        align: 'center'
      },
      {
        title: 'Unidad',
        key: 'unit',
        width: 150,
        render: (_, product) => (
          <Tooltip title={`Tipo: ${product.unit.type || 'N/A'}`}>
            <Tag color="purple">
              {product.unit.name} ({product.unit.abbreviation})
            </Tag>
          </Tooltip>
        )
      },
      {
        title: 'Cantidad Base',
        dataIndex: 'quantity_in_base_unit',
        key: 'quantity_in_base_unit',
        width: 120,
        align: 'center',
        render: (val) => (
          <Tooltip title="Cantidad convertida a unidad base">
            <Tag color="cyan">{parseFloat(val).toFixed(2)}</Tag>
          </Tooltip>
        )
      },
      {
        title: 'Factor Conv.',
        key: 'conversion_factor',
        width: 110,
        align: 'center',
        render: (_, product) => (
          <Tooltip title="Factor de conversión a unidad base">
            x{product.unit.conversion_factor}
          </Tooltip>
        )
      },
      {
        title: 'Precio Unit.',
        dataIndex: 'unit_price',
        key: 'unit_price',
        width: 100,
        align: 'right',
        render: (val) => `$${val}`
      },
      {
        title: 'Subtotal',
        dataIndex: 'subtotal',
        key: 'subtotal',
        width: 100,
        align: 'right',
        render: (val) => <strong>${val}</strong>
      }
    ];

    return (
      <Table
        columns={productColumns}
        dataSource={record.products}
        pagination={false}
        rowKey={(item) => `${record.invoice_id}-${item.product_id}-${item.unit.id}`}
        size="small"
      />
    );
  };

  const tabItems = [
    {
      key: 'sales',
      label: (
        <span>
          <ShoppingCartOutlined />
          Ventas
        </span>
      ),
      children: (
        <div>
          <Row gutter={16} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Ventas"
                  value={salesData.summary?.total_sales || 0}
                  precision={2}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Facturas"
                  value={salesData.summary?.total_invoices || 0}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Ticket Promedio"
                  value={
                    salesData.summary?.total_invoices > 0
                      ? (salesData.summary.total_sales / salesData.summary.total_invoices)
                      : 0
                  }
                  precision={2}
                  prefix="$"
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Neto"
                  value={salesData.summary?.net_total || 0}
                  precision={2}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>

          <Space style={{ marginBottom: '16px' }}>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => exportToCSV(salesData.sales, 'ventas')}
            >
              Exportar CSV
            </Button>
            <Button
              type="primary"
              icon={<FileExcelOutlined />}
              onClick={() => exportToExcel(salesData.sales, 'ventas')}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              Exportar Excel
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadSalesData}
            >
              Actualizar
            </Button>
          </Space>

          <Table
            columns={salesColumns}
            dataSource={salesData.sales}
            rowKey="id"
            loading={salesData.loading}
            scroll={{ x: 1500 }}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Total ${total} facturas`
            }}
          />
        </div>
      )
    },
    {
      key: 'products',
      label: (
        <span>
          <RiseOutlined />
          Top Productos
        </span>
      ),
      children: (
        <div>
          <Card style={{ marginBottom: '16px' }}>
            <Space>
              <span>Mostrar top:</span>
              <Select
                value={topProductsLimit}
                onChange={setTopProductsLimit}
                style={{ width: 120 }}
              >
                <Option value={5}>5 productos</Option>
                <Option value={10}>10 productos</Option>
                <Option value={20}>20 productos</Option>
                <Option value={50}>50 productos</Option>
              </Select>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadProductsData}
              >
                Actualizar
              </Button>
            </Space>
          </Card>

          <Row gutter={16} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12}>
              <Card>
                <Statistic
                  title="Productos Vendidos"
                  value={productsData.summary?.total_products || 0}
                  prefix="📦"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card>
                <Statistic
                  title="Ingresos Totales"
                  value={productsData.summary?.total_revenue || 0}
                  precision={2}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>

          <Space style={{ marginBottom: '16px' }}>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => exportToCSV(productsData.products, 'top_productos')}
            >
              Exportar CSV
            </Button>
            <Button
              type="primary"
              icon={<FileExcelOutlined />}
              onClick={() => exportToExcel(productsData.products, 'top_productos')}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              Exportar Excel
            </Button>
          </Space>

          <Table
            columns={productsColumns}
            dataSource={productsData.products}
            rowKey="id"
            loading={productsData.loading}
            pagination={false}
          />
        </div>
      )
    },
    {
      key: 'customers',
      label: (
        <span>
          <UserOutlined />
          Clientes
        </span>
      ),
      children: (
        <div>
          <Row gutter={16} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12}>
              <Card>
                <Statistic
                  title="Total Clientes"
                  value={customersData.summary?.total_customers || 0}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card>
                <Statistic
                  title="Ingresos Totales"
                  value={customersData.summary?.total_revenue || 0}
                  precision={2}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>

          <Space style={{ marginBottom: '16px' }}>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => exportToCSV(customersData.customers, 'clientes')}
            >
              Exportar CSV
            </Button>
            <Button
              type="primary"
              icon={<FileExcelOutlined />}
              onClick={() => exportToExcel(customersData.customers, 'clientes')}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              Exportar Excel
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadCustomersData}
            >
              Actualizar
            </Button>
          </Space>

          <Table
            columns={customersColumns}
            dataSource={customersData.customers}
            rowKey="id"
            loading={customersData.loading}
            scroll={{ x: 1600 }}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Total ${total} clientes`
            }}
          />
        </div>
      )
    },
    {
      key: 'daily',
      label: (
        <span>
          <CalendarOutlined />
          Resumen Diario
        </span>
      ),
      children: (
        <div>
          <Row gutter={16} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Días Analizados"
                  value={dailyData.summary?.total_days || 0}
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Total General"
                  value={dailyData.summary?.grand_total || 0}
                  precision={2}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Promedio Diario"
                  value={dailyData.summary?.average_daily_sales || 0}
                  precision={2}
                  prefix="$"
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>

          <Space style={{ marginBottom: '16px' }}>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => exportToCSV(dailyData.dailySales, 'ventas_diarias')}
            >
              Exportar CSV
            </Button>
            <Button
              type="primary"
              icon={<FileExcelOutlined />}
              onClick={() => exportToExcel(dailyData.dailySales, 'ventas_diarias')}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              Exportar Excel
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadDailyData}
            >
              Actualizar
            </Button>
          </Space>

          <Table
            columns={dailyColumns}
            dataSource={dailyData.dailySales}
            rowKey="date"
            loading={dailyData.loading}
            pagination={{
              pageSize: 15,
              showTotal: (total) => `Total ${total} días`
            }}
          />
        </div>
      )
    },
    {
      key: 'inventory',
      label: (
        <span>
          <WarningOutlined />
          Inventario
        </span>
      ),
      children: (
        <div>
          <Card style={{ marginBottom: '16px' }}>
            <Space>
              <span>Umbral de Stock Bajo:</span>
              <Select
                value={inventoryThreshold}
                onChange={setInventoryThreshold}
                style={{ width: 140 }}
              >
                <Option value={5}>5 unidades</Option>
                <Option value={10}>10 unidades</Option>
                <Option value={20}>20 unidades</Option>
                <Option value={50}>50 unidades</Option>
              </Select>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadInventoryData}
              >
                Actualizar
              </Button>
            </Space>
          </Card>

          <Row gutter={16} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Total Productos"
                  value={inventoryData.summary?.total_products || 0}
                  prefix="📦"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Stock Bajo"
                  value={inventoryData.summary?.low_stock_products || 0}
                  prefix={<WarningOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Stock Crítico"
                  value={inventoryData.summary?.critical_stock_products || 0}
                  prefix="🚨"
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </Col>
          </Row>

          {inventoryData.alerts?.length > 0 && (
            <Card 
              title={
                <span>
                  <WarningOutlined style={{ color: '#faad14' }} /> 
                  {' '}Productos que Requieren Atención
                </span>
              }
              style={{ marginBottom: '16px' }}
            >
              <Row gutter={[16, 16]}>
                {inventoryData.alerts.map((alert) => (
                  <Col xs={24} sm={12} lg={6} key={alert.id}>
                    <Card 
                      size="small"
                      style={{ 
                        borderLeft: `4px solid ${
                          alert.stock_status === 'CRÍTICO' ? '#ff4d4f' : '#faad14'
                        }`
                      }}
                    >
                      <div style={{ marginBottom: '8px' }}>
                        <Tag color={alert.stock_status === 'CRÍTICO' ? 'red' : 'orange'}>
                          {alert.stock_status}
                        </Tag>
                      </div>
                      <div><strong>{alert.name}</strong></div>
                      <div style={{ color: '#8c8c8c', marginTop: '4px' }}>
                        Stock: {alert.current_stock} unidades
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          )}

          <Space style={{ marginBottom: '16px' }}>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => exportToCSV(inventoryData.products, 'inventario')}
            >
              Exportar CSV
            </Button>
            <Button
              type="primary"
              icon={<FileExcelOutlined />}
              onClick={() => exportToExcel(inventoryData.products, 'inventario')}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              Exportar Excel
            </Button>
          </Space>

          <Table
            columns={inventoryColumns}
            dataSource={inventoryData.products}
            rowKey="id"
            loading={inventoryData.loading}
            scroll={{ x: 1400 }}
            pagination={{
              pageSize: 15,
              showTotal: (total) => `Total ${total} productos`
            }}
          />
        </div>
      )
    },
    {
      key: 'detail',
      label: (
        <span>
          <InfoCircleOutlined />
          Detalle Productos
        </span>
      ),
      children: (
        <div>
          <Card style={{ marginBottom: '16px' }}>
            <Row gutter={16}>
              <Col xs={24} md={6}>
                <div style={{ marginBottom: '8px' }}>Cliente:</div>
                <Select
                  allowClear
                  placeholder="Todos los clientes"
                  style={{ width: '100%' }}
                  value={detailFilters.customer_id}
                  onChange={(val) => setDetailFilters(prev => ({ ...prev, customer_id: val }))}
                >
                  <Option value={null}>Todos</Option>
                </Select>
              </Col>
              <Col xs={24} md={6}>
                <div style={{ marginBottom: '8px' }}>Producto:</div>
                <Select
                  allowClear
                  placeholder="Todos los productos"
                  style={{ width: '100%' }}
                  value={detailFilters.product_id}
                  onChange={(val) => setDetailFilters(prev => ({ ...prev, product_id: val }))}
                >
                  <Option value={null}>Todos</Option>
                </Select>
              </Col>
              <Col xs={24} md={6}>
                <div style={{ marginBottom: '8px' }}>Unidad:</div>
                <Select
                  allowClear
                  placeholder="Todas las unidades"
                  style={{ width: '100%' }}
                  value={detailFilters.unit_id}
                  onChange={(val) => setDetailFilters(prev => ({ ...prev, unit_id: val }))}
                >
                  <Option value={null}>Todas</Option>
                </Select>
              </Col>
              <Col xs={24} md={6}>
                <div style={{ marginBottom: '8px' }}>&nbsp;</div>
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={loadDetailData}
                  block
                >
                  Aplicar Filtros
                </Button>
              </Col>
            </Row>
          </Card>

          <Row gutter={16} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={8} lg={6}>
              <Card>
                <Statistic
                  title="Total Facturas"
                  value={detailData.summary?.total_invoices || 0}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8} lg={6}>
              <Card>
                <Statistic
                  title="Líneas de Productos"
                  value={detailData.summary?.total_products || 0}
                  prefix="📦"
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8} lg={6}>
              <Card>
                <Statistic
                  title="Cantidad Total"
                  value={detailData.summary?.total_quantity || 0}
                  precision={2}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8} lg={6}>
              <Card>
                <Statistic
                  title="Ingresos Totales"
                  value={detailData.summary?.total_revenue || 0}
                  precision={2}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>

          {detailData.productsSummary && detailData.productsSummary.length > 0 && (
            <Card 
              title={
                <span>
                  <RiseOutlined /> Resumen por Producto
                </span>
              }
              style={{ marginBottom: '16px' }}
            >
              <Row gutter={[16, 16]}>
                {detailData.productsSummary.map((item, index) => (
                  <Col xs={24} sm={12} lg={8} key={index}>
                    <Card size="small">
                      <div><strong>{item.product_name}</strong></div>
                      <div style={{ marginTop: '8px', color: '#8c8c8c' }}>
                        Cantidad: {item.total_quantity} | Ingresos: ${item.total_revenue}
                      </div>
                      <div style={{ marginTop: '4px' }}>
                        <Tag color="purple">Vendido {item.times_sold} veces</Tag>
                      </div>
                      <div style={{ marginTop: '4px' }}>
                        Unidades: {item.units_used.join(', ')}
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          )}

          <Space style={{ marginBottom: '16px' }}>
            <Button
              icon={<DownloadOutlined />}
              onClick={exportDetailToCSV}
            >
              Exportar CSV
            </Button>
            <Button
              type="primary"
              icon={<FileExcelOutlined />}
              onClick={exportDetailToExcel}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              Exportar Excel
            </Button>
          </Space>

          <Table
            columns={detailColumns}
            dataSource={detailData.invoices}
            rowKey="invoice_id"
            loading={detailData.loading}
            expandable={{
              expandedRowRender,
              expandRowByClick: true
            }}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Total ${total} facturas`
            }}
          />
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1>📊 Reportes y Análisis</h1>

      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={16} align="middle">
          <Col>
            <span style={{ marginRight: '8px' }}>Período:</span>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="DD/MM/YYYY"
              presets={rangePresets}
              style={{ width: 300 }}
            />
          </Col>
        </Row>
      </Card>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="large"
      />
    </div>
  );
};

export default ReportsPage;