import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { productAPI } from '../services/apiService';
import { Store, Package, Search, Plus } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'react-qr-code';

export default function StoreProductsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showQR, setShowQR] = useState(null);
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAllProducts();
      if (response.success) {
        setProducts(response.data || []);
      }
    } catch (error) {
      toast.error(error.message || 'Khong the tai danh sach san pham');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return products.filter((p) => {
      const status = p.status || p.currentStatus;
      const allowed = ['Delivered', 'InStore'].includes(status);
      const text = `${p.name || ''} ${p.qrCode || ''}`.toLowerCase();
      return allowed && text.includes(q);
    });
  }, [products, searchTerm]);

  const handleReceiveProduct = async (product) => {
    const location = user?.company || user?.username || 'Store';

    try {
      const response = await productAPI.updateProductStatus(product.productId, 'InStore', {
        location,
        notes: 'San pham da duoc nhap vao cua hang',
      });

      if (response.success) {
        toast.success('Da nhan san pham vao cua hang');
        await fetchProducts();
      } else {
        toast.error(response.message || 'Cap nhat that bai');
      }
    } catch (error) {
      toast.error(error.message || 'Cap nhat that bai');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl mb-2">Quan ly san pham</h1>
        <p className="text-gray-600">Cap nhat trang thai san pham tai cua hang</p>
      </div>

      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg"
            placeholder="Tim kiem san pham"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const status = product.status || product.currentStatus;
          return (
            <div key={product.productId} className="bg-white rounded-xl shadow border border-gray-200">
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.manufacturer || product.producer?.name}</p>
                    <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">{status}</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div>
                    <span className="text-gray-600">Ma QR:</span>
                    <p className="font-mono text-xs">{product.qrCode}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Ngay tao:</span>
                    <p>{new Date(product.createdAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                  {product.expiryDate && (
                    <div>
                      <span className="text-gray-600">Han SD:</span>
                      <p>{new Date(product.expiryDate).toLocaleDateString('vi-VN')}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowQR(showQR === product.productId ? null : product.productId)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    QR Code
                  </button>
                  <button
                    onClick={() => handleReceiveProduct(product)}
                    className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                  >
                    <Plus className="w-4 h-4 inline-block mr-1" />
                    Nhan hang
                  </button>
                </div>
              </div>

              {showQR === product.productId && (
                <div className="border-t border-gray-200 p-6 bg-gray-50 text-center">
                  <div className="bg-white p-4 rounded-lg inline-block">
                    <QRCode value={product.qrCode || product.productId} size={150} />
                  </div>
                  <p className="text-sm text-gray-600 mt-3">Ma QR: {product.qrCode}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <Store className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl mb-2">Khong tim thay san pham</h3>
          <p className="text-gray-600">Thu tim kiem voi tu khoa khac</p>
        </div>
      )}
    </div>
  );
}
