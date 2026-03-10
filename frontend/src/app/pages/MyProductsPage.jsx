import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { storageService } from '../services/storage';
import { blockchainService } from '../services/blockchain';
import { Package, Plus, Eye, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router';
import QRCode from 'react-qr-code';
import { toast } from 'sonner';

export default function MyProductsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showQR, setShowQR] = useState(null);
  const [showAddStep, setShowAddStep] = useState(null);

  const [stepForm, setStepForm] = useState({
    step: 'packaging',
    location: '',
    notes: '',
  });

  const products = user ? storageService.getProductsByProducer(user.id) : [];

  const stepOptions = [
    { value: 'packaging', label: 'Đóng gói' },
    { value: 'transport', label: 'Vận chuyển' },
    { value: 'warehouse', label: 'Nhập kho' },
    { value: 'retail', label: 'Bán lẻ' },
  ];

  const handleAddStep = async (productId) => {
    if (!user) return;

    const stepLabels = {
      packaging: 'Đóng gói',
      transport: 'Vận chuyển',
      warehouse: 'Nhập kho',
      retail: 'Bán lẻ',
    };

    const newStep = {
      id: crypto.randomUUID(),
      productId,
      step: stepForm.step,
      stepName: stepLabels[stepForm.step],
      timestamp: new Date().toISOString(),
      location: stepForm.location,
      performedBy: user.name,
      performedById: user.id,
      status: 'Hoàn thành',
      notes: stepForm.notes,
    };

    try {
      const hash = await blockchainService.writeSupplyChainToBlockchain(newStep);
      newStep.blockchainHash = hash;
      storageService.addSupplyChainStep(newStep);

      // Update product status
      storageService.updateProduct(productId, { 
        currentStatus: stepLabels[stepForm.step] 
      });

      toast.success('Đã thêm bước chuỗi cung ứng mới!');
      setShowAddStep(null);
      setStepForm({ step: 'packaging', location: '', notes: '' });
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const ProductCard = ({ product }) => {
    const supplyChain = storageService.getSupplyChainByProduct(product.id);

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg mb-1">{product.name}</h3>
              <p className="text-sm text-gray-600">{product.productionPlace}</p>
              <div className="flex gap-2 mt-2">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                  {product.currentStatus}
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-mono">
                  {product.qrCode}
                </span>
              </div>
            </div>
            <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <span className="text-gray-600">Ngày SX:</span>
              <p className="font-medium">
                {new Date(product.productionDate).toLocaleDateString('vi-VN')}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Hạn SD:</span>
              <p className="font-medium">
                {new Date(product.expiryDate).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowQR(showQR === product.id ? null : product.id)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              QR Code
            </button>
            <button
              onClick={() => setSelectedProduct(selectedProduct === product.id ? null : product.id)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Chi tiết
            </button>
            <button
              onClick={() => setShowAddStep(showAddStep === product.id ? null : product.id)}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Thêm bước
            </button>
          </div>
        </div>

        {showQR === product.id && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="bg-white p-4 rounded-lg inline-block">
              <QRCode value={product.qrCode} size={200} />
            </div>
            <p className="text-sm text-gray-600 mt-3">
              Quét mã QR này để xem lịch sử sản phẩm
            </p>
          </div>
        )}

        {selectedProduct === product.id && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <h4 className="font-medium mb-4">Chuỗi cung ứng ({supplyChain.length} bước)</h4>
            <div className="space-y-3">
              {supplyChain.map((step, index) => (
                <div key={step.id} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium">{step.stepName}</h5>
                      <p className="text-sm text-gray-600 mt-1">{step.location}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(step.timestamp).toLocaleString('vi-VN')} • {step.performedBy}
                      </p>
                      {step.notes && (
                        <p className="text-sm text-gray-700 mt-2 italic">"{step.notes}"</p>
                      )}
                      {step.blockchainHash && (
                        <p className="text-xs font-mono text-gray-500 mt-2 truncate">
                          TX: {step.blockchainHash}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showAddStep === product.id && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <h4 className="font-medium mb-4">Thêm bước chuỗi cung ứng</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Loại bước</label>
                <select
                  value={stepForm.step}
                  onChange={(e) => setStepForm({ ...stepForm, step: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  {stepOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2">Địa điểm</label>
                <input
                  type="text"
                  value={stepForm.location}
                  onChange={(e) => setStepForm({ ...stepForm, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Nhập địa điểm"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Ghi chú</label>
                <textarea
                  value={stepForm.notes}
                  onChange={(e) => setStepForm({ ...stepForm, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  rows={3}
                  placeholder="Thông tin bổ sung..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddStep(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleAddStep(product.id)}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Xác nhận thêm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl mb-2">Sản phẩm của tôi</h1>
          <p className="text-gray-600">Quản lý sản phẩm và chuỗi cung ứng</p>
        </div>
        <button
          onClick={() => navigate('/create-product')}
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Tạo sản phẩm mới
        </button>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-xl shadow text-center py-12">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl mb-2">Chưa có sản phẩm nào</h3>
          <p className="text-gray-600 mb-6">Bắt đầu bằng cách tạo sản phẩm đầu tiên của bạn</p>
          <button
            onClick={() => navigate('/create-product')}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Tạo sản phẩm mới
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
