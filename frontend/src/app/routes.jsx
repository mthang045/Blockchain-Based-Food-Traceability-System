import { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import DashboardLayout from './components/layout/DashboardLayout.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';

const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const CreateProductPage = lazy(() => import('./pages/CreateProductPage.jsx'));
const MyProductsPage = lazy(() => import('./pages/MyProductsPage.jsx'));
const ScanQRPage = lazy(() => import('./pages/ScanQRPage.jsx'));
const UsersManagementPage = lazy(() => import('./pages/UsersManagementPage.jsx'));
const ProductsManagementPage = lazy(() => import('./pages/ProductsManagementPage.jsx'));
const BlockchainLogsPage = lazy(() => import('./pages/BlockchainLogsPage.jsx'));
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'));
const TransportPage = lazy(() => import('./pages/TransportPage.jsx'));
const StoreProductsPage = lazy(() => import('./pages/StoreProductsPage.jsx'));

const RouteLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-gray-600">Dang tai trang...</div>
  </div>
);

const withRouteSuspense = (node) => (
  <Suspense fallback={<RouteLoader />}>
    {node}
  </Suspense>
);

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Dang khoi phuc phien dang nhap...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

function OptionalDashboardRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Dang tai...</div>
      </div>
    );
  }

  if (!user) {
    return children;
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
    element: withRouteSuspense((
      <Root>
        <LoginPage />
      </Root>
    )),
  },
  {
    path: '/dashboard',
    element: withRouteSuspense((
      <Root>
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      </Root>
    )),
  },
  {
    path: '/create-product',
    element: withRouteSuspense((
      <Root>
        <ProtectedRoute>
          <CreateProductPage />
        </ProtectedRoute>
      </Root>
    )),
  },
  {
    path: '/my-products',
    element: withRouteSuspense((
      <Root>
        <ProtectedRoute>
          <MyProductsPage />
        </ProtectedRoute>
      </Root>
    )),
  },
  {
    path: '/scan',
    element: withRouteSuspense((
      <Root>
        <OptionalDashboardRoute>
          <ScanQRPage />
        </OptionalDashboardRoute>
      </Root>
    )),
  },
  {
    path: '/users',
    element: withRouteSuspense((
      <Root>
        <ProtectedRoute>
          <UsersManagementPage />
        </ProtectedRoute>
      </Root>
    )),
  },
  {
    path: '/products',
    element: withRouteSuspense((
      <Root>
        <ProtectedRoute>
          <ProductsManagementPage />
        </ProtectedRoute>
      </Root>
    )),
  },
  {
    path: '/blockchain',
    element: withRouteSuspense((
      <Root>
        <ProtectedRoute>
          <BlockchainLogsPage />
        </ProtectedRoute>
      </Root>
    )),
  },
  {
    path: '/transport',
    element: withRouteSuspense((
      <Root>
        <ProtectedRoute>
          <TransportPage />
        </ProtectedRoute>
      </Root>
    )),
  },
  {
    path: '/store-products',
    element: withRouteSuspense((
      <Root>
        <ProtectedRoute>
          <StoreProductsPage />
        </ProtectedRoute>
      </Root>
    )),
  },
  {
    path: '/profile',
    element: withRouteSuspense((
      <Root>
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      </Root>
    )),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);