import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { productAPI } from '../services/apiService';
import { Truck, Package, Search, MapPin, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function TransportPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [transportForm, setTransportForm] = useState({
    fromLocation: '',
    toLocation: '',
    notes: '',
  });

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
      const allowed = ['Produced', 'InTransit'].includes(status);
      const text = `${p.name || ''} ${p.qrCode || ''}`.toLowerCase();
      return allowed && text.includes(q);
    });
  }, [products, searchTerm]);

  const handleUpdateStatus = async (product, nextStatus, notes) => {
    if (!user) return;

    const location = transportForm.toLocation
      ? `${transportForm.fromLocation || ''} -> ${transportForm.toLocation}`.trim()
      : transportForm.fromLocation || 'Unknown location';

    try {
      const response = await productAPI.updateProductStatus(product.productId, nextStatus, {
        location,
        notes,
      });

      if (response.success) {
        toast.success('Cap nhat trang thai van chuyen thanh cong');
        setSelectedProductId(null);
        setTransportForm({ fromLocation: '', toLocation: '', notes: '' });
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
        <h1 className="text-3xl mb-2">Quan ly van chuyen</h1>
        <p className="text-gray-600">Cap nhat trang thai van chuyen san pham</p>
      </div>

      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg"
            placeholder="Tim kiem san pham theo ten hoac ma QR"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const status = product.status || product.currentStatus;
          const isSelected = selectedProductId === product.productId;

          return (
            <div key={product.productId} className="bg-white rounded-xl shadow border border-gray-200">
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.manufacturer || product.producer?.name}</p>
                    <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                      {status}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{product.origin || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(product.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedProductId(isSelected ? null : product.productId)}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {isSelected ? 'Dong' : 'Van chuyen'}
                </button>
              </div>

              {isSelected && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <h4 className="font-medium mb-4">Thong tin van chuyen</h4>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={transportForm.fromLocation}
                      onChange={(e) => setTransportForm({ ...transportForm, fromLocation: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Nhap dia diem xuat phat"
                    />
                    <input
                      type="text"
                      value={transportForm.toLocation}
                      onChange={(e) => setTransportForm({ ...transportForm, toLocation: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Nhap dia diem dich"
                    />
                    <textarea
                      value={transportForm.notes}
                      onChange={(e) => setTransportForm({ ...transportForm, notes: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      rows={2}
                      placeholder="Ghi chu them"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus(product, 'InTransit', transportForm.notes || 'Bat dau van chuyen')}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        Bat dau van chuyen
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(product, 'Delivered', transportForm.notes || 'Van chuyen hoan tat')}
                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        Hoan tat
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <Truck className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl mb-2">Khong tim thay san pham</h3>
          <p className="text-gray-600">Thu tim kiem voi tu khoa khac</p>
        </div>
      )}
    </div>
  );
}
