import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Card, message, Switch } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import rawMaterialService from '../../services/rawMaterialService';

const RawMaterialForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      loadRawMaterial();
    }
  }, [id]);

  const loadRawMaterial = async () => {
    try {
      setLoading(true);
      const data = await rawMaterialService.getRawMaterialById(id);
      form.setFieldsValue(data);
    } catch (error) {
      message.error('Error al cargar materia prima');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      if (isEdit) {
        await rawMaterialService.updateRawMaterial(id, values);
        message.success('Materia prima actualizada correctamente');
      } else {
        await rawMaterialService.createRawMaterial(values);
        message.success('Materia prima creada correctamente');
      }
      navigate('/raw-materials');
    } catch (error) {
      message.error(error.response?.data?.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Card
        title={isEdit ? 'Editar Materia Prima' : 'Nueva Materia Prima'}
        extra={
          <Button onClick={() => navigate('/raw-materials')}>
            Volver
          </Button>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ active: true, stock: 0, min_stock: 0, unit_cost: 0 }}
        >
          <Form.Item
            name="name"
            label="Nombre"
            rules={[{ required: true, message: 'Ingrese el nombre' }]}
          >
            <Input placeholder="Ej: Harina de trigo" />
          </Form.Item>

          <Form.Item
            name="unit_of_measure"
            label="Unidad de Medida"
            rules={[{ required: true, message: 'Ingrese la unidad' }]}
          >
            <Input placeholder="Ej: kg, litros, unidades" />
          </Form.Item>

          <Form.Item
            name="stock"
            label="Stock Inicial"
            rules={[{ required: true, message: 'Ingrese el stock' }]}
          >
            <InputNumber
              min={0}
              step={0.01}
              style={{ width: '100%' }}
              placeholder="0.00"
            />
          </Form.Item>

          <Form.Item
            name="min_stock"
            label="Stock Mínimo (Alerta)"
            rules={[{ required: true, message: 'Ingrese el stock mínimo' }]}
          >
            <InputNumber
              min={0}
              step={0.01}
              style={{ width: '100%' }}
              placeholder="0.00"
            />
          </Form.Item>

          <Form.Item
            name="unit_cost"
            label="Costo Unitario"
            rules={[{ required: true, message: 'Ingrese el costo' }]}
          >
            <InputNumber
              min={0}
              step={0.01}
              style={{ width: '100%' }}
              placeholder="0.00"
              prefix="$"
            />
          </Form.Item>

          <Form.Item name="active" label="Estado" valuePropName="checked">
            <Switch checkedChildren="Activo" unCheckedChildren="Inactivo" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              {isEdit ? 'Actualizar' : 'Crear'} Materia Prima
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default RawMaterialForm;