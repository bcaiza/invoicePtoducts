import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Switch, Space } from 'antd';
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
    <Card 
      title={`${isEdit ? 'Editar' : 'Nueva'} Materia Prima`}
      extra={<Button onClick={() => navigate('/raw-materials')}>Volver</Button>}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ active: true }}
      >
        <Form.Item
          label="Nombre"
          name="name"
          rules={[
            { required: true, message: 'Ingrese el nombre' },
            { min: 3, message: 'El nombre debe tener al menos 3 caracteres' }
          ]}
        >
          <Input 
            placeholder="Nombre de la materia prima" 
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="Descripción"
          name="description"
        >
          <Input.TextArea 
            rows={4}
            placeholder="Descripción opcional de la materia prima"
            showCount
            maxLength={500}
          />
        </Form.Item>

        <Form.Item
          label="Activo"
          name="active"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => navigate('/raw-materials')}>
              Cancelar
            </Button>
            <Button type="primary" htmlType="submit" loading={loading} size="large">
              {isEdit ? 'Actualizar' : 'Crear'} Materia Prima
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default RawMaterialForm;