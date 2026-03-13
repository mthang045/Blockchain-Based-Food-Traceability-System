import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { productAPI } from '../services/apiService';
import { Package, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateProductPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
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
      // Generate product ID and QR code
      const productId = `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
      const qrCode = `FOODCHAIN-${productId}`;

      // Prepare product data for API
      const productData = {
        productId: productId,
        name: formData.name,
        description: formData.description || `Sản xuất tại ${formData.productionPlace}`,
        category: 'FOOD',
        origin: formData.productionPlace,
        qrCode: qrCode,
        status: 'Produced',
        expiryDate: formData.expiryDate,
      };

      // Send to backend API
      const response = await productAPI.createProduct(productData);

      if (response.success) {
        const product = {
          ...response.data,
          productionDate: formData.productionDate,
          expiryDate: formData.expiryDate,
        };

        setCreatedProduct(product);
        setShowSuccess(true);
        toast.success('Tạo sản phẩm thành công và đã ghi lên Blockchain!');

        // Reset form
        setFormData({
          name: '',
          description: '',
          productionPlace: '',
          productionDate: '',
          expiryDate: '',
        });
      } else {
        toast.error(response.message || 'Có lỗi xảy ra khi tạo sản phẩm');
      }
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra khi tạo sản phẩm');
      console.error('Error creating product:', error);
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
              <span className="text-gray-600">Mã sản phẩm:</span>
              <span className="font-mono text-sm bg-white px-3 py-1 rounded">
                {createdProduct.productId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Blockchain TxHash:</span>
              <span className="font-mono text-xs bg-white px-3 py-1 rounded truncate max-w-xs">
                {createdProduct.blockchainTxHash || 'Đang xử lý...'}
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setShowSuccess(false);
                setCreatedProduct(null);
                setFormData({
                  name: '',
                  description: '',
                  productionPlace: '',
                  productionDate: '',
                  expiryDate: ''
                });
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

          <div>
            <label className="block text-sm mb-2">
              Ghi chú / Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ví dụ: Cà chua được trồng theo phương pháp hữu cơ, không sử dụng hóa chất..."
              rows="3"
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
