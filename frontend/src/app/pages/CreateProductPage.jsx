import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { storageService } from '../services/storage';
import { blockchainService } from '../services/blockchain';
import { Package, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateProductPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    productionPlace: '',
    productionDate: '',
    expiryDate: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdProduct, setCreatedProduct] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) return;

    setIsSubmitting(true);

    try {
      // Create product
      const productId = crypto.randomUUID();
      const qrCode = `FOODCHAIN-${productId.substring(0, 8).toUpperCase()}`;

      const product = {
        id: productId,
        ...formData,
        producerId: user.id,
        producerName: user.name,
        currentStatus: 'Đã tạo',
        qrCode,
        createdAt: new Date().toISOString(),
      };

      // Write to blockchain
      const blockchainHash = await blockchainService.writeProductToBlockchain(product);
      product.blockchainHash = blockchainHash;

      // Save to storage
      storageService.addProduct(product);

      // Create initial supply chain step
      const initialStep = {
        id: crypto.randomUUID(),
        productId: product.id,
        step: 'harvest',
        stepName: 'Thu hoạch',
        timestamp: new Date().toISOString(),
        location: formData.productionPlace,
        performedBy: user.name,
        performedById: user.id,
        status: 'Hoàn thành',
        notes: 'Sản phẩm được tạo và thu hoạch',
      };

      const stepHash = await blockchainService.writeSupplyChainToBlockchain(initialStep);
      initialStep.blockchainHash = stepHash;

      storageService.addSupplyChainStep(initialStep);

      setCreatedProduct(product);
      setShowSuccess(true);
      toast.success('Tạo sản phẩm thành công!');

      // Reset form
      setFormData({
        name: '',
        productionPlace: '',
        productionDate: '',
        expiryDate: '',
      });
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tạo sản phẩm');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess && createdProduct) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl mb-2">Tạo sản phẩm thành công!</h2>
            <p className="text-gray-600">Sản phẩm đã được ghi nhận lên Blockchain</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Tên sản phẩm:</span>
              <span className="font-medium">{createdProduct.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mã QR:</span>
              <span className="font-mono text-sm bg-white px-3 py-1 rounded">
                {createdProduct.qrCode}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Blockchain Hash:</span>
              <span className="font-mono text-xs bg-white px-3 py-1 rounded truncate max-w-xs">
                {createdProduct.blockchainHash}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowSuccess(false);
                setCreatedProduct(null);
              }}
              className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Tạo sản phẩm khác
            </button>
            <button
              onClick={() => navigate('/my-products')}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Xem sản phẩm của tôi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl mb-2">Tạo sản phẩm mới</h1>
        <p className="text-gray-600">Nhập thông tin sản phẩm và ghi nhận lên Blockchain</p>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm mb-2">
              Tên sản phẩm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ví dụ: Cà chua hữu cơ Đà Lạt"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-2">
              Nơi sản xuất <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.productionPlace}
              onChange={(e) => setFormData({ ...formData, productionPlace: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ví dụ: Nông trại Xanh, Đà Lạt, Lâm Đồng"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm mb-2">
                Ngày sản xuất <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.productionDate}
                onChange={(e) => setFormData({ ...formData, productionDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-2">
                Hạn sử dụng <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Lưu ý:</strong> Sau khi tạo sản phẩm, hệ thống sẽ tự động:
            </p>
            <ul className="text-sm text-blue-700 mt-2 ml-4 list-disc space-y-1">
              <li>Tạo mã QR Code duy nhất cho sản phẩm</li>
              <li>Ghi nhận thông tin lên Blockchain</li>
              <li>Tạo bước đầu tiên trong chuỗi cung ứng (Thu hoạch)</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Package className="w-5 h-5" />
                  Tạo sản phẩm
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
