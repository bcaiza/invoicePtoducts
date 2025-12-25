import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Button,
  Card,
  Row,
  Col,
  message,
  Space,
  Switch,
  Divider,
  Spin
} from 'antd';
import {
  SaveOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import productService from '../../services/productService';

const { TextArea } = Input;

const EditProduct = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoadingData(true);
      const response = await productService.getProductById(id);
      console.log("response",response);
      form.setFieldsValue({
        name: response.name,
        pvp: response.pvp,
        weight: response.weight,
        stock: response.stock,
        active: response.active
      });
    } catch (error) {
      message.error(error.response?.data?.message || 'Error al cargar producto');
      navigate('/products');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const productData = {
        name: values.name,
        pvp: parseFloat(values.pvp),
        weight: values.weight ? parseFloat(values.weight) : null,
        stock: parseInt(values.stock || 0),
        active: values.active !== undefined ? values.active : true
      };

      await productService.updateProduct(id, productData);
      message.success('Producto actualizado exitosamente');
      navigate('/products');
    } catch (error) {
      message.error(error.response?.data?.message || 'Error al actualizar producto');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" tip="Cargando producto..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="Editar Producto"
        extra={
          <Button
            icon={<CloseOutlined />}
            onClick={() => navigate('/products')}
          >
            Cancelar
          </Button>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Nombre del Producto"
                rules={[
                  { required: true, message: 'El nombre es requerido' },
                  { min: 3, message: 'El nombre debe tener al menos 3 caracteres' }
                ]}
              >
                <Input
                  placeholder="Ej: Laptop HP 15"
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="pvp"
                label="Precio de Venta (PVP)"
                rules={[
                  { required: true, message: 'El precio es requerido' },
                  {
                    validator: (_, value) => {
                      if (value && value < 0) {
                        return Promise.reject('El precio debe ser mayor o igual a 0');
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  size="large"
                  min={0}
                  precision={2}
                  prefix="$"
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="weight"
                label="Peso (kg)"
                rules={[
                  {
                    validator: (_, value) => {
                      if (value && value < 0) {
                        return Promise.reject('El peso debe ser mayor o igual a 0');
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  size="large"
                  min={0}
                  precision={2}
                  placeholder="0.00"
                  suffix="kg"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="stock"
                label="Stock Actual"
                rules={[
                  {
                    validator: (_, value) => {
                      if (value && value < 0) {
                        return Promise.reject('El stock debe ser mayor o igual a 0');
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  size="large"
                  min={0}
                  placeholder="0"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Row>
            <Col span={24}>
              <Form.Item
                name="active"
                label="Estado del Producto"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Activo"
                  unCheckedChildren="Inactivo"
                />
              </Form.Item>
            </Col>
          </Row>

          <Card
            size="small"
            style={{ backgroundColor: '#f0f5ff', marginBottom: '24px' }}
          >
            <p style={{ margin: 0, fontSize: '13px' }}>
              <strong>Nota:</strong> El producto estará disponible para ser agregado
              a facturas solo si está marcado como "Activo" y tiene stock disponible.
            </p>
          </Card>

          <Row justify="end">
            <Space>
              <Button
                size="large"
                onClick={() => navigate('/products')}
              >
                Cancelar
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
                size="large"
              >
                Actualizar Producto
              </Button>
            </Space>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default EditProduct;