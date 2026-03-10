import { useState } from 'react';
import { storageService } from '../services/storage';
import { useAuth } from '../contexts/AuthContext';
import { Store, Package, Search, Plus } from 'lucide-react';
import { blockchainService } from '../services/blockchain';
import { toast } from 'sonner';
import QRCode from 'react-qr-code';

export default function StoreProductsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showQR, setShowQR] = useState(null);

  const products = storageService.getProducts();
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.qrCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReceiveProduct = async (productId) => {
    if (!user) return;

    const newStep = {
      id: crypto.randomUUID(),
      productId,
      step: 'retail',
      stepName: 'Bán lẻ',
      timestamp: new Date().toISOString(),
      location: user.address || 'Cửa hàng',
      performedBy: user.name,
      performedById: user.id,
      status: 'Sẵn sàng bán',
      notes: 'Sản phẩm đã được nhập vào cửa hàng',
    };

    try {
      const hash = await blockchainService.writeSupplyChainToBlockchain(newStep);
      newStep.blockchainHash = hash;
      storageService.addSupplyChainStep(newStep);
      storageService.updateProduct(productId, { currentStatus: 'Sẵn sàng bán' });

      toast.success('Đã nhận sản phẩm vào cửa hàng!');
      setSelectedProduct(null);
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl mb-2">Quản lý sản phẩm</h1>
        <p className="text-gray-600">Cập nhật trạng thái sản phẩm tại cửa hàng</p>
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
            placeholder="Tìm kiếm sản phẩm..."
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const supplyChain = storageService.getSupplyChainByProduct(product.id);

          return (
            <div key={product.id} className="bg-white rounded-xl shadow border border-gray-200">
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.producerName}</p>
                    <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                      {product.currentStatus}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div>
                    <span className="text-gray-600">Mã QR:</span>
                    <p className="font-mono text-xs">{product.qrCode}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Ngày SX:</span>
                    <p>{new Date(product.productionDate).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Hạn SD:</span>
                    <p>{new Date(product.expiryDate).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mb-4">
                  {supplyChain.length} bước trong chuỗi cung ứng
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowQR(showQR === product.id ? null : product.id)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    QR Code
                  </button>
                  <button
                    onClick={() => handleReceiveProduct(product.id)}
                    className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                  >
                    <Plus className="w-4 h-4 inline-block mr-1" />
                    Nhận hàng
                  </button>
                </div>
              </div>

              {showQR === product.id && (
                <div className="border-t border-gray-200 p-6 bg-gray-50 text-center">
                  <div className="bg-white p-4 rounded-lg inline-block">
                    <QRCode value={product.qrCode} size={150} />
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    Mã QR: {product.qrCode}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <Store className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl mb-2">Không tìm thấy sản phẩm</h3>
          <p className="text-gray-600">Thử tìm kiếm với từ khóa khác</p>
        </div>
      )}
    </div>
  );
}
