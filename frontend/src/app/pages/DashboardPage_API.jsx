import { useState, useEffect } from 'react';
import { productAPI, blockchainAPI } from '../services/apiService';
import { Package, Activity, TrendingUp, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    recentProducts: [],
    blockchainInfo: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch products
        const productsResponse = await productAPI.getAllProducts();
        
        // Fetch blockchain info
        const blockchainResponse = await blockchainAPI.getNetworkInfo();

        if (productsResponse.success) {
          const products = productsResponse.data;
          
          setStats({
            totalProducts: products.length,
            recentProducts: products.slice(0, 5),
            blockchainInfo: blockchainResponse.success ? blockchainResponse.data : null,
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Không thể tải dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">Tổng quan hệ thống Food Traceability</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Tổng sản phẩm</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalProducts}</div>
          <p className="text-sm text-gray-600 mt-2">Đã đăng ký trên blockchain</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Blockchain</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.blockchainInfo ? `#${stats.blockchainInfo.blockNumber}` : 'N/A'}
          </div>
          <p className="text-sm text-gray-600 mt-2">Block hiện tại</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Giao dịch</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalProducts}</div>
          <p className="text-sm text-gray-600 mt-2">Transactions</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-sm text-gray-500">Network</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.blockchainInfo?.name || 'Local'}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            ChainID: {stats.blockchainInfo?.chainId || 'N/A'}
          </p>
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-4">Sản phẩm gần đây</h2>
        <div className="space-y-4">
          {stats.recentProducts.length > 0 ? (
            stats.recentProducts.map((product) => (
              <div 
                key={product._id} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.origin}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                    {product.currentStatus}
                  </span>
                  <p className="text-xs text-gray-500 mt-1 font-mono">
                    {product.productId}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">Chưa có sản phẩm nào</p>
          )}
        </div>
      </div>

      {/* Blockchain Info */}
      {stats.blockchainInfo && (
        <div className="rounded-xl shadow-lg p-6 text-white bg-gradient-to-r from-green-500 to-blue-500">  
          <h2 className="text-xl font-bold mb-4">Thông tin Blockchain</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-green-100 text-sm">Network</p>
              <p className="text-xl font-bold">{stats.blockchainInfo.name}</p>
            </div>
            <div>
              <p className="text-green-100 text-sm">Chain ID</p>
              <p className="text-xl font-bold">{stats.blockchainInfo.chainId}</p>
            </div>
            <div>
              <p className="text-green-100 text-sm">Block Number</p>
              <p className="text-xl font-bold">#{stats.blockchainInfo.blockNumber}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
