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
import rawMaterialService from "../../services/rawMaterialService";

const { TextArea } = Input;

const ProductionCreate = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [recipe, setRecipe] = useState(null);
  const [producedQuantity, setProducedQuantity] = useState(0);

  console.log("ProductionCreate component rendered");

  useEffect(() => {
    loadProducts();
    loadRawMaterials();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productService.getProducts({ limit: 1000 });
      setProducts(data.data || []);
    } catch (error) {
      message.error("Error al cargar productos");
    }
  };

  const loadRawMaterials = async () => {
    try {
      const data = await rawMaterialService.getRawMaterials({ limit: 1000 });
      const materials = data.data || [];
      setRawMaterials(materials);
      return materials; // ✅ RETORNAR los datos
    } catch (error) {
      message.error("Error al cargar materias primas");
      return []; // ✅ RETORNAR array vacío en caso de error
    }
  };

  const enrichRecipe = (recipeData, materialsData) => {
    // Enriquecer los ingredientes con la información completa de rawMaterials
    console.log("Enriching recipe, materials:", materialsData);
    const enrichedRecipes = recipeData.recipes.map((r) => {
      console.log("Processing recipe item:", r);
      const rawMat = materialsData.find((rm) => rm.id === r.raw_material_id);
      console.log("Found rawMat:", rawMat);
      return {
        ...r,
        rawMaterial: rawMat || r.rawMaterial
      };
    });

    const enrichedRecipeData = {
      ...recipeData,
      recipes: enrichedRecipes
    };

    setRecipe(enrichedRecipeData);
  };

  const handleProductChange = async (productId) => {
    console.log("handleProductChange called with productId:", productId);
    try {
      console.log("Fetching product data...");
      const productData = await productService.getProductById(productId);
      setSelectedProduct(productData);
      console.log("Selected product data:", productData);

      console.log("Fetching recipe data...");
      const recipeData = await recipeService.getProductRecipe(productId);

      if (!recipeData.recipes || recipeData.recipes.length === 0) {
        message.warning("Este producto no tiene una receta definida");
        setRecipe(null);
        return;
      }

      console.log("Recipe data fetched:", recipeData);
      
      // ✅ Obtener los materiales (del estado o cargarlos)
      let materialsData = rawMaterials;
      if (rawMaterials.length === 0) {
        console.log("Loading raw materials...");
        materialsData = await loadRawMaterials(); // ✅ Usar el valor retornado
      }
      
      console.log("Materials available:", materialsData.length);
      enrichRecipe(recipeData, materialsData); // ✅ Pasar los materiales
      
      // Usar expected_quantity si existe, sino usar 1
      const expectedQty = parseFloat(recipeData.expected_quantity) || 1;
      form.setFieldsValue({
        produced_quantity: expectedQty,
      });
      setProducedQuantity(expectedQty);
    } catch (error) {
      console.error("Error in handleProductChange:", error);
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
    const expectedQty = parseFloat(recipe.expected_quantity) || 1;
    return Math.ceil(producedQuantity / expectedQty);
  };

  const columns = [
    {
      title: "Ingrediente",
      key: "ingredient",
      render: (_, record) => (
        <div>
          <div className="font-semibold text-slate-800 dark:text-slate-100">
            {record.rawMaterial?.name || 'Cargando...'}
          </div>
          {record.rawMaterial?.description && (
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {record.rawMaterial.description}
            </div>
          )}
          {record.notes && (
            <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
              📝 {record.notes}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Unidad de Medida",
      key: "unit",
      render: (_, record) => (
        <span className="text-slate-700 dark:text-slate-300">
          {record.rawMaterial?.unit_of_measure || "N/A"}
        </span>
      ),
    },
    {
      title: "Stock Disponible",
      key: "stock",
      render: (_, record) => {
        const stock = parseFloat(record.rawMaterial?.stock || 0);
        const isLowStock = stock < 10; // Ajusta este umbral según necesites
        
        return (
          <span className={isLowStock ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>
            {stock.toFixed(2)} {record.rawMaterial?.unit_of_measure || ""}
            {isLowStock && " ⚠️"}
          </span>
        );
      },
    },
    {
      title: "Costo por Unidad",
      key: "cost_per_unit",
      render: (_, record) => (
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          ${parseFloat(record.rawMaterial?.cost_per_unit || 0).toFixed(2)}
        </span>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <Card
        title={
          <span className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Nueva Producción
          </span>
        }
        extra={
          <Button onClick={() => navigate("/productions")} size="large">
            Volver
          </Button>
        }
        className="rounded-xl"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="product_id"
            label={
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Producto a Producir
              </span>
            }
            rules={[{ required: true, message: "Seleccione un producto" }]}
          >
            <Select
              showSearch
              placeholder="Seleccione producto"
              onChange={handleProductChange}
              optionFilterProp="children"
              size="large"
              className="rounded-lg"
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
                <Col xs={24} sm={12} md={8}>
                  <Card className="rounded-xl border-slate-200 dark:border-dark-700 dark:bg-dark-800">
                    <Statistic
                      title={
                        <span className="text-slate-600 dark:text-slate-400">
                          Cantidad Esperada por Lote
                        </span>
                      }
                      value={parseFloat(recipe.expected_quantity || 1)}
                      suffix="unidades"
                      valueStyle={{ color: "#722ed1" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card className="rounded-xl border-slate-200 dark:border-dark-700 dark:bg-dark-800">
                    <Statistic
                      title={
                        <span className="text-slate-600 dark:text-slate-400">
                          Lotes Necesarios
                        </span>
                      }
                      value={getBatchesNeeded()}
                      suffix="lotes"
                      valueStyle={{ color: "#1890ff" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Card className="rounded-xl border-slate-200 dark:border-dark-700 dark:bg-dark-800">
                    <Statistic
                      title={
                        <span className="text-slate-600 dark:text-slate-400">
                          Total Ingredientes
                        </span>
                      }
                      value={recipe.recipes?.length || 0}
                      suffix="items"
                      valueStyle={{ color: "#3f8600" }}
                    />
                  </Card>
                </Col>
              </Row>

              <Form.Item
                name="produced_quantity"
                label={
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Cantidad a Producir
                  </span>
                }
                rules={[
                  { required: true, message: "Ingrese la cantidad a producir" },
                  { type: 'number', min: 1, message: 'La cantidad debe ser mayor a 0' }
                ]}
              >
                <InputNumber
                  min={1}
                  style={{ width: "100%" }}
                  onChange={(val) => setProducedQuantity(val || 0)}
                  placeholder="Cantidad de productos a fabricar"
                  size="large"
                  className="rounded-lg"
                />
              </Form.Item>

              <Divider className="text-slate-600 dark:text-slate-400">
                Ingredientes de la Receta
              </Divider>

              <Alert
                message="Información de Producción"
                description={`Esta receta produce ${parseFloat(recipe.expected_quantity || 1)} unidades por lote. Para producir ${producedQuantity} unidades necesitará ${getBatchesNeeded()} lote(s).`}
                type="info"
                showIcon
                className="mb-4 rounded-lg"
              />

              <Table
                columns={columns}
                dataSource={recipe.recipes}
                rowKey={(record) => record.id || record.raw_material_id}
                pagination={false}
                className="mb-6 overflow-x-auto"
                scroll={{ x: 800 }}
                locale={{ emptyText: 'No hay ingredientes en esta receta' }}
              />

              <Form.Item 
                name="notes" 
                label={
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Notas (Opcional)
                  </span>
                }
              >
                <TextArea
                  rows={3}
                  placeholder="Observaciones sobre la producción..."
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                  className="rounded-lg"
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