import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Select,
  InputNumber,
  Input,
  Button,
  message,
  Table,
  Alert,
  Space,
  Statistic,
  Row,
  Col,
  Divider,
} from "antd";
import { useNavigate } from "react-router-dom";
import productionService from "../../services/productionService";
import productService from "../../services/productService";
import recipeService from "../../services/recipeService";

const { TextArea } = Input;

const ProductionCreate = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [recipe, setRecipe] = useState(null);
  const [producedQuantity, setProducedQuantity] = useState(0);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productService.getProducts({ limit: 1000 });
      setProducts(data.data || []);
    } catch (error) {
      message.error("Error al cargar productos");
    }
  };

  const handleProductChange = async (productId) => {
    try {
      const productData = await productService.getProductById(productId);
      setSelectedProduct(productData);

      const recipeData = await recipeService.getProductRecipe(productId);

      if (!recipeData.recipes || recipeData.recipes.length === 0) {
        message.warning("Este producto no tiene una receta definida");
        setRecipe(null);
        return;
      }

      setRecipe(recipeData);
      form.setFieldsValue({
        produced_quantity: recipeData.yield_quantity || 1,
      });
      setProducedQuantity(recipeData.yield_quantity || 1);
    } catch (error) {
      message.error("Error al cargar información del producto");
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      await productionService.createProduction({
        product_id: values.product_id,
        produced_quantity: values.produced_quantity,
        notes: values.notes,
      });
      message.success("Producción registrada correctamente");
      navigate("/productions");
    } catch (error) {
      message.error(
        error.response?.data?.message || "Error al registrar producción"
      );
    } finally {
      setLoading(false);
    }
  };

  const getBatchesNeeded = () => {
    if (!recipe || !producedQuantity) return 0;
    return Math.ceil(producedQuantity / recipe.yield_quantity);
  };

  const getRequiredQuantity = (ingredientQuantity) => {
    return parseFloat(ingredientQuantity) * getBatchesNeeded();
  };

  const checkSufficientStock = (ingredient) => {
    const required = getRequiredQuantity(ingredient.quantity);
    const available = parseFloat(ingredient.rawMaterial.stock);
    return available >= required;
  };

  const columns = [
    {
      title: "Ingrediente",
      key: "ingredient",
      render: (_, record) => <strong>{record.rawMaterial?.name}</strong>,
    },
    {
      title: "Cantidad",
      key: "quantity",
      render: (_, record) =>
        `${parseFloat(record.quantity).toFixed(2)} ${
          record.rawMaterial?.unit_of_measure
        }`,
    },
    {
      title: "Costo",
      key: "cost",
      render: (_, record) => {
        const cost =
          parseFloat(record.quantity) *
          parseFloat(record.rawMaterial?.cost_per_unit || 0);
        return `$${cost.toFixed(2)}`;
      },
    },
  ];

  const allIngredientsAvailable =
    recipe?.recipes?.every(checkSufficientStock) || false;

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <Card
        title="Nueva Producción"
        extra={<Button onClick={() => navigate("/productions")}>Volver</Button>}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="product_id"
            label="Producto a Producir"
            rules={[{ required: true, message: "Seleccione un producto" }]}
          >
            <Select
              showSearch
              placeholder="Seleccione producto"
              onChange={handleProductChange}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {products.map((p) => (
                <Select.Option key={p.id} value={p.id}>
                  {p.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {recipe && (
            <>
              <Row gutter={16} style={{ marginBottom: "24px" }}>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Rendimiento por Lote"
                      value={recipe.yield_quantity}
                      suffix="unidades"
                    />
                  </Card>
                </Col>
                <Row gutter={16} style={{ marginBottom: "24px" }}>
                  <Col span={12}>
                    <Card>
                      <Statistic
                        title="Cantidad Esperada (según receta)"
                        value={recipe.yield_quantity}
                        suffix="unidades"
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card>
                      <Statistic
                        title="Costo de Receta"
                        value={recipe.total_cost?.toFixed(2) || "0.00"}
                        prefix="$"
                      />
                    </Card>
                  </Col>
                </Row>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Costo Total"
                      value={recipe.total_cost?.toFixed(2) || "0.00"}
                      prefix="$"
                    />
                  </Card>
                </Col>
              </Row>

              <Form.Item
                name="produced_quantity"
                label="Cantidad Producida"
                rules={[
                  { required: true, message: "Ingrese la cantidad producida" },
                ]}
              >
                <InputNumber
                  min={1}
                  style={{ width: "100%" }}
                  onChange={(val) => setProducedQuantity(val)}
                  placeholder="Cantidad de productos"
                />
              </Form.Item>

              <Divider>Ingredientes de la Receta</Divider>

              {!allIngredientsAvailable && (
                <Alert
                  message="Stock Insuficiente"
                  description="No hay suficiente stock de algunas materias primas para esta producción"
                  type="error"
                  showIcon
                  style={{ marginBottom: "16px" }}
                />
              )}

              <Table
                columns={columns}
                dataSource={recipe.recipes}
                rowKey="id"
                pagination={false}
                style={{ marginBottom: "24px" }}
              />

              <Form.Item name="notes" label="Notas (Opcional)">
                <TextArea
                  rows={3}
                  placeholder="Observaciones sobre la producción..."
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                  // ELIMINAR: disabled={!allIngredientsAvailable}
                >
                  Registrar Producción
                </Button>
              </Form.Item>
            </>
          )}
        </Form>
      </Card>
    </div>
  );
};

export default ProductionCreate;
