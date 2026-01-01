import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme as antdTheme } from 'antd';
import esES from 'antd/locale/es_ES';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { lightTheme, darkTheme } from './theme/antd-theme';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Invoices from './pages/Invoices/Invoices';
import Products from './pages/Products/Products';
import {  Users, Roles } from './pages';
import NewInvoice from './pages/Invoices/NewInvoice';
import NewProduct from './pages/Products/NewProduct';
import EditProduct from './pages/Products/EditProduct';
import Customer from './pages/Customer/Customer';
import NewCustomer from './pages/Customer/NewCustomer';
import EditCustomer from './pages/Customer/EditCustomer';
import RoleList from './pages/Role/RoleList';
import EditRole from './pages/Role/EditRole';
import CreateRole from './pages/Role/CreateRole';
import UserList from './pages/User/UserList';
import CreateUser from './pages/User/CreateUser';
import EditUser from './pages/User/EditUser';
import UnitList from './pages/Units/UnitList';
import ProductUnits from './pages/ProductUnit/ProductUnits';
import Promotions from './pages/Promotion/Promotions';
import AuditLogList from './pages/AuditLog/AuditLogList';
import RawMaterialList from './pages/RawMaterial/RawMaterialList';
import RawMaterialForm from './pages/RawMaterial/RawMaterialForm';
import ProductionList from './pages/Production/ProductionList';
import ProductionCreate from './pages/Production/ProductionCreate';
import ReportsPage from './pages/Report/ReportPage';
import RecipeList from './pages/Recipe/RecipeList';
import RecipeForm from './pages/Recipe/ReceipeForm';

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();

  return (
    <ConfigProvider
      locale={esES}
      theme={isDark ? darkTheme : lightTheme}
      algorithm={isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm}
    >
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/invoices"
          element={
            <ProtectedRoute>
              <Layout>
                <Invoices />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/newInvoice"
          element={
            <ProtectedRoute>
              <Layout>
                <NewInvoice />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Layout>
                <Products />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/audit-logs"
          element={
            <ProtectedRoute>
              <Layout>
                <AuditLogList />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/newProduct"
          element={
            <ProtectedRoute>
              <Layout>
                <NewProduct />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/editProduct/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <EditProduct />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <Layout>
                <Customer />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/newCustomer"
          element={
            <ProtectedRoute>
              <Layout>
                <NewCustomer />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/editCustomer/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <EditCustomer />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Layout>
                <UserList />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/newUser"
          element={
            <ProtectedRoute>
              <Layout>
                <CreateUser />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/editUser/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <EditUser />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/roles"
          element={
            <ProtectedRoute>
              <Layout>
                <RoleList />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/editRole/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <EditRole />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/newRole"
          element={
            <ProtectedRoute>
              <Layout>
                <CreateRole />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/units"
          element={
            <ProtectedRoute>
              <Layout>
                <UnitList />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/product-units"
          element={
            <ProtectedRoute>
              <Layout>
                <ProductUnits />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/raw-materials"
          element={
            <ProtectedRoute>
              <Layout>
                <RawMaterialList />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/raw-materials/new"
          element={
            <ProtectedRoute>
              <Layout>
                <RawMaterialForm />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/raw-materials/edit/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <RawMaterialForm />
              </Layout>
            </ProtectedRoute>
          }
        />

      

        <Route
          path="/productions"
          element={
            <ProtectedRoute>
              <Layout>
                <ProductionList />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/productions/new"
          element={
            <ProtectedRoute>
              <Layout>
                <ProductionCreate />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/promotions"
          element={
            <ProtectedRoute>
              <Layout>
                <Promotions />
              </Layout>
            </ProtectedRoute>
          }
        />

          <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Layout>
                <ReportsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

   <Route
          path="/recipes"
          element={
            <ProtectedRoute>
              <Layout>
                <RecipeList />
              </Layout>
            </ProtectedRoute>
          }
        />

         <Route
          path="/recipes/edit/:productId"
          element={
            <ProtectedRoute>
              <Layout>
                <RecipeForm />
              </Layout>
            </ProtectedRoute>
          }
        />

                  

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ConfigProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
