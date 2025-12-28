import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Table,
  Card,
  Row,
  Col,
  DatePicker,
  message,
  Space,
  Divider,
  Checkbox,
  Tooltip,
  Spin,
  Tag
} from 'antd';
import {
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
  EditOutlined,
  CheckOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import invoiceService from '../../services/invoiceService';
import customerService from '../../services/customerService';
import productService from '../../services/productService';
import unitService from '../../services/unitsService';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const TAX_RATE = 0.15; 

const NewInvoice = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [units, setUnits] = useState([]);
  const [invoiceDetails, setInvoiceDetails] = useState([]);
  const [applyTax, setApplyTax] = useState(true);
  const [calculations, setCalculations] = useState({
    subtotal: 0,
    totalTax: 0,
    totalDiscount: 0,
    total: 0
  });

  useEffect(() => {
    loadCustomers();
    loadProducts();
    loadUnits();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [invoiceDetails, applyTax, form.getFieldValue('discount')]);

  const loadCustomers = async (searchTerm = '') => {
    try {
      setLoadingCustomers(true);
      const data = await customerService.getCustomers({ 
        limit: 100,
        active: true,
        search: searchTerm 
      });
      setCustomers(data.data || []);
    } catch (error) {
      message.error('Error al cargar clientes');
    } finally {
      setLoadingCustomers(false);
    }
  };

  const loadProducts = async (searchTerm = '') => {
    try {
      setLoadingProducts(true);
      const data = await productService.getProducts({ 
        limit: 100,
        active: true,
        search: searchTerm 
      });
      setProducts(data.data || []);
    } catch (error) {
      message.error('Error al cargar productos');
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadUnits = async () => {
    try {
      setLoadingUnits(true);
      const data = await unitService.getAll({ limit: 100, active: true }); 
      setUnits(data.data || []);
    } catch (error) {
      message.error('Error al cargar unidades');
    } finally {
      setLoadingUnits(false);
    }
  };

  const handleCustomerSearch = (value) => {
    if (value) {
      loadCustomers(value);
    } else {
      loadCustomers();
    }
  };

  const handleProductSearch = (value) => {
    if (value) {
      loadProducts(value);
    } else {
      loadProducts();
    }
  };

  const getProductUnits = (product) => {
    if (!product.ProductUnits || product.ProductUnits.length === 0) {
      return product.base_unit_id ? [{ unit_id: product.base_unit_id }] : [];
    }
    return product.ProductUnits;
  };

  const getUnitInfo = (unitId) => {
    return units.find(u => u.id === unitId);
  };

  const handleAddProduct = (productId, quantity = 1) => {
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      message.error('Producto no encontrado');
      return;
    }

    if (product.stock < quantity) {
      message.error(`Stock insuficiente. Disponible: ${product.stock}`);
      return;
    }

    const existingIndex = invoiceDetails.findIndex(d => d.product_id === productId);
    
    if (existingIndex >= 0) {
      const newDetails = [...invoiceDetails];
      const newQuantity = newDetails[existingIndex].quantity + quantity;
      
      const conversionQuantity = newDetails[existingIndex].conversion_quantity || 1;
      const quantityInBaseUnit = newQuantity * conversionQuantity;
      
      if (product.stock < quantityInBaseUnit) {
        message.error(`Stock insuficiente. Disponible: ${product.stock}`);
        return;
      }
      
      newDetails[existingIndex].quantity = newQuantity;
      newDetails[existingIndex].quantity_base_unit = quantityInBaseUnit;
      newDetails[existingIndex] = calculateItemTotals(newDetails[existingIndex]);
      setInvoiceDetails(newDetails);
    } else {
      const productUnits = getProductUnits(product);
      const defaultUnitId = product.base_unit_id || (productUnits[0]?.unit_id);
      const defaultUnit = getUnitInfo(defaultUnitId);

      const unitPrice = parseFloat(product.pvp);
      const taxAmount = applyTax ? unitPrice * TAX_RATE : 0;
      
      const newDetail = {
        key: Date.now(),
        product_id: product.id,
        product_name: product.name,
        original_product_name: product.name,
        unit_id: defaultUnitId,
        unit_name: defaultUnit?.abbreviation || '',
        available_units: productUnits,
        quantity: quantity,
        quantity_base_unit: quantity,
        conversion_quantity: 1,
        unit_price: unitPrice,
        tax_per_unit: taxAmount,
        item_discount: 0,
        subtotal: 0,
        available_stock: product.stock,
        isEditingName: false,
        isEditingPrice: false
      };
      
      const calculatedDetail = calculateItemTotals(newDetail);
      setInvoiceDetails([...invoiceDetails, calculatedDetail]);
    }
  };

  const calculateItemTotals = (detail) => {
    const priceWithTax = detail.unit_price + detail.tax_per_unit;
    const subtotal = (priceWithTax * detail.quantity) - detail.item_discount;
    
    return {
      ...detail,
      subtotal: Math.max(0, subtotal) 
    };
  };

  const handleUpdateQuantity = (key, newQuantity) => {
    const newDetails = invoiceDetails.map(detail => {
      if (detail.key === key) {
        if (newQuantity < 1) {
          return detail;
        }
        
        const conversionQuantity = detail.conversion_quantity || 1;
        const quantityInBaseUnit = newQuantity * conversionQuantity;
        
        if (quantityInBaseUnit > detail.available_stock) {
          message.error(`Stock insuficiente. Disponible: ${detail.available_stock} unidades base`);
          return detail;
        }
        
        const updated = { 
          ...detail, 
          quantity: newQuantity,
          quantity_base_unit: quantityInBaseUnit
        };
        return calculateItemTotals(updated);
      }
      return detail;
    });
    setInvoiceDetails(newDetails);
  };

  const handleUpdateUnit = (key, newUnitId) => {
    const newDetails = invoiceDetails.map(detail => {
      if (detail.key === key) {
        const newUnit = getUnitInfo(newUnitId);
        
        const selectedProductUnit = detail.available_units?.find(
          pu => pu.unit_id === newUnitId
        );
        
        let newUnitPrice = detail.unit_price;
        let conversionQuantity = 1;
        
        if (selectedProductUnit) {
          if (selectedProductUnit.price_modifier) {
            newUnitPrice = parseFloat(selectedProductUnit.price_modifier);
          } else {
            const product = products.find(p => p.id === detail.product_id);
            if (product) {
              const basePrice = parseFloat(product.pvp);
              const quantity = parseFloat(selectedProductUnit.quantity || 1);
              newUnitPrice = basePrice * quantity;
            }
          }
          
          conversionQuantity = parseFloat(selectedProductUnit.quantity || 1);
        }
        
        const newTaxPerUnit = applyTax ? newUnitPrice * TAX_RATE : 0;
        const quantityInBaseUnit = detail.quantity * conversionQuantity;
        
        const updated = {
          ...detail,
          unit_id: newUnitId,
          unit_name: newUnit?.abbreviation || '',
          unit_price: newUnitPrice,
          tax_per_unit: newTaxPerUnit,
          quantity_base_unit: quantityInBaseUnit,
          conversion_quantity: conversionQuantity
        };
        
        return calculateItemTotals(updated);
      }
      return detail;
    });
    setInvoiceDetails(newDetails);
  };

  const handleUpdateItemDiscount = (key, discount) => {
    const newDetails = invoiceDetails.map(detail => {
      if (detail.key === key) {
        const updated = { ...detail, item_discount: parseFloat(discount || 0) };
        return calculateItemTotals(updated);
      }
      return detail;
    });
    setInvoiceDetails(newDetails);
  };

  const handleUpdateProductName = (key, newName) => {
    const newDetails = invoiceDetails.map(detail => {
      if (detail.key === key) {
        return { ...detail, product_name: newName };
      }
      return detail;
    });
    setInvoiceDetails(newDetails);
  };

  const toggleEditName = (key) => {
    const newDetails = invoiceDetails.map(detail => {
      if (detail.key === key) {
        return { ...detail, isEditingName: !detail.isEditingName };
      }
      return detail;
    });
    setInvoiceDetails(newDetails);
  };

  const handleUpdateUnitPrice = (key, newPrice) => {
    const newDetails = invoiceDetails.map(detail => {
      if (detail.key === key) {
        const newTaxPerUnit = applyTax ? newPrice * TAX_RATE : 0;
        const updated = {
          ...detail,
          unit_price: parseFloat(newPrice), 
          tax_per_unit: newTaxPerUnit       
        };
        
        return calculateItemTotals(updated);
      }
      return detail;
    });
    
    setInvoiceDetails(newDetails);
  };

  const toggleEditPrice = (key) => {
    const newDetails = invoiceDetails.map(detail => {
      if (detail.key === key) {
        return { ...detail, isEditingPrice: !detail.isEditingPrice };
      }
      return detail;
    });
    setInvoiceDetails(newDetails);
  };

  const handleRemoveProduct = (key) => {
    setInvoiceDetails(invoiceDetails.filter(detail => detail.key !== key));
  };

  const handleApplyTaxChange = (checked) => {
    setApplyTax(checked);
    
    const newDetails = invoiceDetails.map(detail => {
      const taxAmount = checked ? detail.unit_price * TAX_RATE : 0;
      const updated = { ...detail, tax_per_unit: taxAmount };
      return calculateItemTotals(updated);
    });
    
    setInvoiceDetails(newDetails);
  };

  const calculateTotals = () => {
    const subtotal = invoiceDetails.reduce((sum, detail) => {
      return sum + (detail.unit_price * detail.quantity);
    }, 0);
    
    const totalTax = invoiceDetails.reduce((sum, detail) => {
      return sum + (detail.tax_per_unit * detail.quantity);
    }, 0);
    
    const totalItemDiscounts = invoiceDetails.reduce((sum, detail) => {
      return sum + detail.item_discount;
    }, 0);
    
    const generalDiscount = parseFloat(form.getFieldValue('discount') || 0);
    const totalDiscount = totalItemDiscounts + generalDiscount;
    
    const total = subtotal + totalTax - totalDiscount;

    setCalculations({
      subtotal: subtotal.toFixed(2),
      totalTax: totalTax.toFixed(2),
      totalDiscount: totalDiscount.toFixed(2),
      total: total.toFixed(2)
    });
  };

  const handleSubmit = async (values) => {
    if (invoiceDetails.length === 0) {
      message.error('Debe agregar al menos un producto');
      return;
    }

    setLoading(true);
    try {
      const invoiceData = {
        customer_id: values.customer_id,
        invoice_number: values.invoice_number,
        invoice_date: values.invoice_date ? values.invoice_date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        tax: parseFloat(calculations.totalTax),
        discount: parseFloat(calculations.totalDiscount),
        payment_method: values.payment_method,
        notes: values.notes,
        details: invoiceDetails.map(detail => ({
          product_id: detail.product_id,
          product_name: detail.product_name,
          unit_id: detail.unit_id,
          unit_name: detail.unit_name,
          quantity: detail.quantity,
          quantity_base_unit: detail.quantity_base_unit,
          unit_price: detail.unit_price,
          subtotal: detail.subtotal
        }))
      };

      await invoiceService.createInvoice(invoiceData);
      message.success('Factura creada exitosamente');
      navigate('/invoices');
    } catch (error) {
      message.error(error.response?.data?.message || 'Error al crear factura');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Producto',
      dataIndex: 'product_name',
      key: 'product_name',
      width: '16%',
      render: (name, record) => (
        <Space direction="vertical" style={{ width: '100%' }}>
          {record.isEditingName ? (
            <Space.Compact style={{ width: '100%' }}>
              <Input
                value={name}
                onChange={(e) => handleUpdateProductName(record.key, e.target.value)}
                placeholder="Nombre en factura"
                autoFocus
              />
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => toggleEditName(record.key)}
              />
            </Space.Compact>
          ) : (
            <Space>
              <Tooltip title="Haz clic para editar el nombre que aparecerá en la factura">
                <span style={{ cursor: 'pointer' }} onClick={() => toggleEditName(record.key)}>
                  {name}
                </span>
              </Tooltip>
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => toggleEditName(record.key)}
              />
            </Space>
          )}
          {name !== record.original_product_name && (
            <small style={{ color: '#888', fontStyle: 'italic' }}>
              Original: {record.original_product_name}
            </small>
          )}
        </Space>
      )
    },
    {
      title: 'Unidad',
      dataIndex: 'unit_id',
      key: 'unit_id',
      width: '9%',
      render: (unitId, record) => {
        const availableUnits = record.available_units || [];
        
        if (availableUnits.length <= 1) {
          return <Tag color="blue">{record.unit_name}</Tag>;
        }

        return (
          <Select
            value={unitId}
            onChange={(value) => handleUpdateUnit(record.key, value)}
            style={{ width: '100%' }}
            size="small"
          >
            {availableUnits.map(pu => {
              const unit = getUnitInfo(pu.unit_id);
              return unit ? (
                <Option key={unit.id} value={unit.id}>
                  {unit.abbreviation}
                </Option>
              ) : null;
            })}
          </Select>
        );
      }
    },
    {
      title: 'Precio Unit.',
      dataIndex: 'unit_price',
      key: 'unit_price',
      width: '10%',
      render: (price, record) => (
        <Space direction="vertical" style={{ width: '100%' }}>
          {record.isEditingPrice ? (
            <Space.Compact style={{ width: '100%' }}>
              <InputNumber
                value={price}
                min={0}
                step={0.01}
                style={{ width: '100%' }}
                formatter={(value) => `$ ${value}`}
                parser={(value) => value.replace('$', '')}
                onChange={(value) => handleUpdateUnitPrice(record.key, value)}
                autoFocus
              />
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => toggleEditPrice(record.key)}
              />
            </Space.Compact>
          ) : (
            <Space>
              <Tooltip title="Haz clic para editar el precio unitario">
                <span
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggleEditPrice(record.key)}
                >
                  ${Number(price).toFixed(2)}
                </span>
              </Tooltip>
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => toggleEditPrice(record.key)}
              />
            </Space>
          )}
        </Space>
      )
    },
    {
      title: 'IVA (15%)',
      dataIndex: 'tax_per_unit',
      key: 'tax_per_unit',
      width: '9%',
      render: (tax) => (
        <span style={{ color: applyTax ? '#1890ff' : '#d9d9d9' }}>
          ${parseFloat(tax).toFixed(2)}
        </span>
      )
    },
    {
      title: 'Cantidad',
      dataIndex: 'quantity',
      key: 'quantity',
      width: '9%',
      render: (quantity, record) => (
        <InputNumber
          min={1}
          value={quantity}
          onChange={(value) => handleUpdateQuantity(record.key, value)}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'Stock a Descontar',
      dataIndex: 'quantity_base_unit',
      key: 'quantity_base_unit',
      width: '10%',
      render: (quantityBaseUnit, record) => {
        const conversionQuantity = record.conversion_quantity || 1;
        const willDeduct = quantityBaseUnit || (record.quantity * conversionQuantity);
        
        const isExceeding = willDeduct > record.available_stock;
        
        return (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Tag 
              color={isExceeding ? 'error' : 'processing'}
              style={{ width: '100%', textAlign: 'center' }}
            >
              {willDeduct.toFixed(2)} u
            </Tag>
            {conversionQuantity > 1 && (
              <small style={{ color: '#888', fontSize: '11px' }}>
                ({record.quantity} × {conversionQuantity})
              </small>
            )}
          </Space>
        );
      }
    },
    {
      title: 'Descuento Item',
      dataIndex: 'item_discount',
      key: 'item_discount',
      width: '10%',
      render: (discount, record) => (
        <InputNumber
          min={0}
          value={discount}
          onChange={(value) => handleUpdateItemDiscount(record.key, value)}
          prefix="$"
          precision={2}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'Stock Disp.',
      dataIndex: 'available_stock',
      key: 'available_stock',
      width: '8%',
      render: (stock) => (
        <span style={{ color: stock < 10 ? '#ff4d4f' : '#52c41a' }}>
          {stock}
        </span>
      )
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      width: '10%',
      render: (subtotal) => (
        <strong style={{ color: '#52c41a' }}>
          ${parseFloat(subtotal).toFixed(2)}
        </strong>
      )
    },
    {
      title: 'Acción',
      key: 'action',
      width: '5%',
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveProduct(record.key)}
        />
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="Nueva Factura"
        extra={
          <Button icon={<CloseOutlined />} onClick={() => navigate('/invoices')}>
            Cancelar
          </Button>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            invoice_date: dayjs(),
            discount: 0,
            payment_method: 'cash'
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="customer_id"
                label="Cliente"
                rules={[{ required: true, message: 'Seleccione un cliente' }]}
              >
                <Select
                  showSearch
                  placeholder="🔍 Buscar cliente por nombre o identificación"
                  suffixIcon={<UserOutlined />}
                  size="large"
                  onSearch={handleCustomerSearch}
                  filterOption={false}
                  notFoundContent={loadingCustomers ? <Spin size="small" /> : 'No hay clientes'}
                  loading={loadingCustomers}
                >
                  {customers.map(customer => (
                    <Option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.identification}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="invoice_number"
                label="Número de Factura"
                rules={[{ required: true, message: 'Ingrese el número de factura' }]}
              >
                <Input placeholder="Ej: FAC-001" size="large" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="invoice_date" label="Fecha de Factura">
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" size="large" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="payment_method" label="Método de Pago">
                <Select size="large">
                  <Option value="cash">Efectivo</Option>
                  <Option value="card">Tarjeta</Option>
                  <Option value="transfer">Transferencia</Option>
                  <Option value="credit">Crédito</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider>Productos</Divider>

          <Row style={{ marginBottom: '16px' }}>
            <Col span={24}>
              <Checkbox 
                checked={applyTax}
                onChange={(e) => handleApplyTaxChange(e.target.checked)}
              >
                <strong>Aplicar IVA del 15% a todos los productos</strong>
              </Checkbox>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginBottom: '16px' }}>
            <Col span={24}>
              <Select
                showSearch
                placeholder="🔍 Buscar y agregar producto"
                style={{ width: '100%' }}
                size="large"
                onSearch={handleProductSearch}
                onChange={(value) => handleAddProduct(value)}
                value={null}
                filterOption={false}
                notFoundContent={loadingProducts ? <Spin size="small" /> : 'No hay productos'}
                loading={loadingProducts}
              >
                {products.map(product => {
                  const baseUnit = getUnitInfo(product.base_unit_id);
                  return (
                    <Option 
                      key={product.id} 
                      value={product.id}
                      disabled={product.stock === 0}
                    >
                      {product.name} - ${product.pvp} 
                      {baseUnit && ` (${baseUnit.abbreviation})`} - Stock: {product.stock}
                    </Option>
                  );
                })}
              </Select>
            </Col>
          </Row>

          <Table
            columns={columns}
            dataSource={invoiceDetails}
            pagination={false}
            bordered
            scroll={{ x: 1600 }}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell colSpan={8} align="right">
                    <strong>Subtotal:</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell colSpan={3}>
                    <strong>${calculations.subtotal}</strong>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />

          <Divider>Totales</Divider>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="discount"
                label="Descuento General Adicional"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                  prefix="$"
                  onChange={calculateTotals}
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Card size="small" style={{ marginBottom: '16px', backgroundColor: '#f0f5ff' }}>
            <Row gutter={16}>
              <Col span={8}>
                <strong>Subtotal (sin IVA):</strong>
                <div style={{ fontSize: '16px', color: '#1890ff' }}>
                  ${calculations.subtotal}
                </div>
              </Col>
              <Col span={8}>
                <strong>IVA Total (15%):</strong>
                <div style={{ fontSize: '16px', color: '#1890ff' }}>
                  ${calculations.totalTax}
                </div>
              </Col>
              <Col span={8}>
                <strong>Descuentos Totales:</strong>
                <div style={{ fontSize: '16px', color: '#ff4d4f' }}>
                  -${calculations.totalDiscount}
                </div>
              </Col>
            </Row>
            <Divider style={{ margin: '12px 0' }} />
            <Row>
              <Col span={24} style={{ textAlign: 'right' }}>
                <strong style={{ fontSize: '20px', color: '#52c41a' }}>
                  TOTAL A PAGAR: ${calculations.total}
                </strong>
              </Col>
            </Row>
          </Card>

          <Row>
            <Col span={24}>
              <Form.Item name="notes" label="Notas">
                <TextArea rows={3} placeholder="Notas adicionales..." />
              </Form.Item>
            </Col>
          </Row>

          <Row justify="end">
            <Space>
              <Button size="large" onClick={() => navigate('/invoices')}>
                Cancelar
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
                disabled={invoiceDetails.length === 0}
                size="large"
              >
                Guardar Factura
              </Button>
            </Space>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default NewInvoice;