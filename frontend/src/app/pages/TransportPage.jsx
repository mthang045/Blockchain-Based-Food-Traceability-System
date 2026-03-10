import { useState } from 'react';
import { storageService } from '../services/storage';
import { useAuth } from '../contexts/AuthContext';
import { Truck, Package, Search, MapPin, Calendar } from 'lucide-react';
import { blockchainService } from '../services/blockchain';
import { toast } from 'sonner';

export default function TransportPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [transportForm, setTransportForm] = useState({
    fromLocation: '',
    toLocation: '',
    notes: '',
  });

  const products = storageService.getProducts();
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.qrCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartTransport = async (productId) => {
    if (!user) return;

    const newStep = {
      id: crypto.randomUUID(),
      productId,
      step: 'transport',
      stepName: 'Vận chuyển',
      timestamp: new Date().toISOString(),
      location: `${transportForm.fromLocation} → ${transportForm.toLocation}`,
      performedBy: user.name,
      performedById: user.id,
      status: 'Đang vận chuyển',
      notes: transportForm.notes,
    };

    try {
      const hash = await blockchainService.writeSupplyChainToBlockchain(newStep);
      newStep.blockchainHash = hash;
      storageService.addSupplyChainStep(newStep);
      storageService.updateProduct(productId, { currentStatus: 'Đang vận chuyển' });

      toast.success('Đã bắt đầu vận chuyển!');
      setSelectedProduct(null);
      setTransportForm({ fromLocation: '', toLocation: '', notes: '' });
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleCompleteTransport = async (productId) => {
    if (!user) return;

    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const newStep = {
      id: crypto.randomUUID(),
      productId,
      step: 'warehouse',
      stepName: 'Nhập kho',
      timestamp: new Date().toISOString(),
      location: transportForm.toLocation,
      performedBy: user.name,
      performedById: user.id,
      status: 'Hoàn thành',
      notes: 'Vận chuyển hoàn tất, đã nhập kho',
    };

    try {
      const hash = await blockchainService.writeSupplyChainToBlockchain(newStep);
      newStep.blockchainHash = hash;
      storageService.addSupplyChainStep(newStep);
      storageService.updateProduct(productId, { currentStatus: 'Đã nhập kho' });

      toast.success('Vận chuyển hoàn tất!');
      setSelectedProduct(null);
      setTransportForm({ fromLocation: '', toLocation: '', notes: '' });
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl mb-2">Quản lý vận chuyển</h1>
        <p className="text-gray-600">Cập nhật trạng thái vận chuyển sản phẩm</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="Tìm kiếm sản phẩm theo tên hoặc mã QR..."
          />
        </div>
      </div>

      {/* Products List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const supplyChain = storageService.getSupplyChainByProduct(product.id);
          const isSelected = selectedProduct === product.id;

          return (
            <div key={product.id} className="bg-white rounded-xl shadow border border-gray-200">
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.producerName}</p>
                    <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                      {product.currentStatus}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{product.productionPlace}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(product.productionDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mb-4">
                  Đã có {supplyChain.length} bước trong chuỗi cung ứng
                </p>

                <button
                  onClick={() => setSelectedProduct(isSelected ? null : product.id)}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {isSelected ? 'Đóng' : 'Vận chuyển'}
                </button>
              </div>

              {isSelected && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <h4 className="font-medium mb-4">Thông tin vận chuyển</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm mb-2">Từ địa điểm</label>
                      <input
                        type="text"
                        value={transportForm.fromLocation}
                        onChange={(e) =>
                          setTransportForm({ ...transportForm, fromLocation: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập địa điểm xuất phát"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2">Đến địa điểm</label>
                      <input
                        type="text"
                        value={transportForm.toLocation}
                        onChange={(e) =>
                          setTransportForm({ ...transportForm, toLocation: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập địa điểm đích"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2">Ghi chú</label>
                      <textarea
                        value={transportForm.notes}
                        onChange={(e) =>
                          setTransportForm({ ...transportForm, notes: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows={2}
                        placeholder="Ghi chú thêm..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStartTransport(product.id)}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        Bắt đầu vận chuyển
                      </button>
                      <button
                        onClick={() => handleCompleteTransport(product.id)}
                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        Hoàn tất
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
          <h3 className="text-xl mb-2">Không tìm thấy sản phẩm</h3>
          <p className="text-gray-600">Thử tìm kiếm với từ khóa khác</p>
        </div>
      )}
    </div>
  );
}
