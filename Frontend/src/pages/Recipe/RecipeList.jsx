import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  message,
  Tag,
  Space,
  Card,
  Row,
  Col,
  Statistic,
  Empty
} from 'antd';
import {
  EditOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { PackageOpen, ChefHat } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import productService from '../../services/productService';
import recipeService from '../../services/recipeService';

const { Search } = Input;

const RecipeList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchText, setSearchText] = useState('');
  const [stats, setStats] = useState({
    totalProducts: 0,
    withRecipes: 0,
    withoutRecipes: 0
  });

  useEffect(() => {
    loadProducts();
  }, [searchText]);

  const loadProducts = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const data = await productService.getProducts({
        page,
        limit,
        search: searchText
      });

      const productsWithRecipes = await Promise.all(
        (data.data || []).map(async (product) => {
          try {
            const recipeData = await recipeService.getProductRecipe(product.id);
            return {
              ...product,
              recipeCount: recipeData.recipes?.length || 0,
              expectedQuantity: recipeData.expected_quantity || null
            };
          } catch (error) {
            return {
              ...product,
              recipeCount: 0,
              expectedQuantity: null
            };
          }
        })
      );

      setProducts(productsWithRecipes);
      setPagination({
        current: data.pagination.current_page,
        pageSize: data.pagination.per_page,
        total: data.pagination.total
      });

      // Calcular estadísticas
      const withRecipes = productsWithRecipes.filter(p => p.recipeCount > 0).length;
      
      setStats({
        totalProducts: productsWithRecipes.length,
        withRecipes: withRecipes,
        withoutRecipes: productsWithRecipes.length - withRecipes
      });

    } catch (error) {
      message.error('Error al cargar productos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination) => {
    loadProducts(newPagination.current, newPagination.pageSize);
  };

  const columns = [
    {
      title: 'Producto',
      dataIndex: 'name',
      key: 'name',
      width: 300,
      render: (text, record) => (
        <div>
          <div className="font-semibold text-slate-800 dark:text-slate-100">
            {text}
          </div>
          {record.description && (
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {record.description}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Ingredientes',
      dataIndex: 'recipeCount',
      key: 'recipeCount',
      width: 140,
      align: 'center',
      render: (count) => (
        <Space>
          {count > 0 && <ChefHat size={14} className="text-blue-500" />}
          <Tag color={count > 0 ? 'blue' : 'default'} className="font-medium rounded-lg">
            {count} {count === 1 ? 'ingrediente' : 'ingredientes'}
          </Tag>
        </Space>
      )
    },
    {
      title: 'Productos Esperados',
      dataIndex: 'expectedQuantity',
      key: 'expectedQuantity',
      width: 160,
      align: 'center',
      render: (quantity) => (
        quantity ? (
          <Tag color="purple" className="font-medium rounded-lg">
            {quantity} {quantity === 1 ? 'unidad' : 'unidades'}
          </Tag>
        ) : (
          <Tag color="default" className="rounded-lg">
            Sin definir
          </Tag>
        )
      )
    },
    {
      title: 'Estado',
      dataIndex: 'active',
      key: 'active',
      width: 100,
      render: (active) => (
        <Tag color={active ? 'green' : 'red'} className="rounded-lg">
          {active ? 'Activo' : 'Inactivo'}
        </Tag>
      )
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Button
          icon={<EditOutlined />}
          size="small"
          type="primary"
          className="rounded-lg"
          onClick={() => navigate(`/recipes/edit/${record.id}`)}
        >
          {record.recipeCount > 0 ? 'Editar' : 'Crear'}
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Card className="rounded-xl border-slate-200 dark:border-dark-800 dark:bg-dark-900">
            <Statistic
              title={<span className="text-slate-600 dark:text-slate-400">Total Productos</span>}
              value={stats.totalProducts}
              valueStyle={{ color: '#1890ff' }}
              suffix="productos"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="rounded-xl border-slate-200 dark:border-dark-800 dark:bg-dark-900">
            <Statistic
              title={<span className="text-slate-600 dark:text-slate-400">Con Receta</span>}
              value={stats.withRecipes}
              valueStyle={{ color: '#52c41a' }}
              prefix={<ChefHat size={20} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="rounded-xl border-slate-200 dark:border-dark-800 dark:bg-dark-900">
            <Statistic
              title={<span className="text-slate-600 dark:text-slate-400">Sin Receta</span>}
              value={stats.withoutRecipes}
              valueStyle={{ color: '#faad14' }}
              suffix="pendientes"
            />
          </Card>
        </Col>
      </Row>

      {/* Búsqueda y acciones */}
      <Card className="rounded-xl border-slate-200 dark:border-dark-800 dark:bg-dark-900">
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={18}>
            <Search
              placeholder="Buscar producto por nombre"
              allowClear
              size="large"
              prefix={<SearchOutlined />}
              className="rounded-lg"
              onSearch={(value) => setSearchText(value)}
              onChange={(e) => {
                if (!e.target.value) setSearchText('');
              }}
            />
          </Col>
          <Col xs={24} sm={12} md={6} className="mt-4 text-right sm:mt-0">
            <Button
              icon={<PackageOpen size={18} />}
              size="large"
              className="w-full rounded-lg"
              onClick={() => navigate('/products')}
            >
              Gestionar Productos
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Tabla */}
      <Card className="rounded-xl border-slate-200 dark:border-dark-800 dark:bg-dark-900">
        <Table
          columns={columns}
          dataSource={products}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} productos`,
            className: 'px-4'
          }}
          onChange={handleTableChange}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div className="text-slate-500 dark:text-slate-400">
                    <p className="mb-2 text-lg font-medium">No hay productos</p>
                    <p className="text-sm">Primero debes crear productos para poder gestionar sus recetas</p>
                  </div>
                }
              >
                <Button 
                  type="primary" 
                  icon={<PackageOpen size={18} />}
                  size="large"
                  className="mt-4 rounded-lg"
                  onClick={() => navigate('/products')}
                >
                  Ir a Productos
                </Button>
              </Empty>
            )
          }}
          className="overflow-x-auto"
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default RecipeList;