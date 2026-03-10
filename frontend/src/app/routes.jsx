import { createBrowserRouter, Navigate } from 'react-router';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import CreateProductPage from './pages/CreateProductPage.jsx';
import MyProductsPage from './pages/MyProductsPage.jsx';
import ScanQRPage from './pages/ScanQRPage.jsx';
import UsersManagementPage from './pages/UsersManagementPage.jsx';
import ProductsManagementPage from './pages/ProductsManagementPage.jsx';
import BlockchainLogsPage from './pages/BlockchainLogsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import TransportPage from './pages/TransportPage.jsx';
import StoreProductsPage from './pages/StoreProductsPage.jsx';
import DashboardLayout from './components/layout/DashboardLayout.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

// Root component with AuthProvider
function Root({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Root>
        <LoginPage />
      </Root>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <Root>
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      </Root>
    ),
  },
  {
    path: '/create-product',
    element: (
      <Root>
        <ProtectedRoute>
          <CreateProductPage />
        </ProtectedRoute>
      </Root>
    ),
  },
  {
    path: '/my-products',
    element: (
      <Root>
        <ProtectedRoute>
          <MyProductsPage />
        </ProtectedRoute>
      </Root>
    ),
  },
  {
    path: '/scan',
    element: (
      <Root>
        <ProtectedRoute>
          <ScanQRPage />
        </ProtectedRoute>
      </Root>
    ),
  },
  {
    path: '/users',
    element: (
      <Root>
        <ProtectedRoute>
          <UsersManagementPage />
        </ProtectedRoute>
      </Root>
    ),
  },
  {
    path: '/products',
    element: (
      <Root>
        <ProtectedRoute>
          <ProductsManagementPage />
        </ProtectedRoute>
      </Root>
    ),
  },
  {
    path: '/blockchain',
    element: (
      <Root>
        <ProtectedRoute>
          <BlockchainLogsPage />
        </ProtectedRoute>
      </Root>
    ),
  },
  {
    path: '/transport',
    element: (
      <Root>
        <ProtectedRoute>
          <TransportPage />
        </ProtectedRoute>
      </Root>
    ),
  },
  {
    path: '/store-products',
    element: (
      <Root>
        <ProtectedRoute>
          <StoreProductsPage />
        </ProtectedRoute>
      </Root>
    ),
  },
  {
    path: '/profile',
    element: (
      <Root>
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      </Root>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);