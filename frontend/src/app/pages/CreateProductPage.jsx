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
    batchNumber: '',
    lotSize: 1,
    unit: 'kg',
    description: '',
    productionPlace: '',
    productionDate: '',
    expiryDate: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdBatch, setCreatedBatch] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) return;

    setIsSubmitting(true);

    try {
      const batchData = {
        name: formData.name,
        batchNumber: formData.batchNumber || undefined,
        lotSize: Number(formData.lotSize) || 1,
        unit: formData.unit || 'kg',
        description: formData.description || `Sản xuất tại ${formData.productionPlace}`,
        category: 'FOOD',
        origin: formData.productionPlace,
        status: 'Produced',
        expiryDate: formData.expiryDate,
      };

      const response = await productAPI.createBatch(batchData);

      if (response.success) {
        const batch = {
          ...response.data,
          productionDate: formData.productionDate,
          expiryDate: formData.expiryDate,
        };

        setCreatedBatch(batch);
        setShowSuccess(true);
        toast.success('Tạo lô sản xuất thành công và đã ghi lên Blockchain!');

        setFormData({
          name: '',
          batchNumber: '',
          lotSize: 1,
          unit: 'kg',
          description: '',
          productionPlace: '',
          productionDate: '',
          expiryDate: '',
        });
      } else {
        toast.error(response.message || 'Có lỗi xảy ra khi tạo lô sản xuất');
      }
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra khi tạo lô sản xuất');
      console.error('Error creating batch:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess && createdBatch) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl mb-2">Tạo lô sản xuất thành công!</h2>
            <p className="text-gray-600">Lô đã được ghi nhận lên Blockchain</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Tên lô:</span>
              <span className="font-medium">{createdBatch.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mã lô:</span>
              <span className="font-mono text-sm bg-white px-3 py-1 rounded">
                {createdBatch.batchNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Quy mô:</span>
              <span className="font-medium">{createdBatch.lotSize} {createdBatch.unit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mã QR:</span>
              <span className="font-mono text-sm bg-white px-3 py-1 rounded">
                {createdBatch.qrCode}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mã định danh:</span>
              <span className="font-mono text-sm bg-white px-3 py-1 rounded">
                {createdBatch.productId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Blockchain TxHash:</span>
              <span className="font-mono text-xs bg-white px-3 py-1 rounded truncate max-w-xs">
                {createdBatch.blockchainTxHash || 'Đang xử lý...'}
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setShowSuccess(false);
                setCreatedBatch(null);
                setFormData({
                  name: '',
                  batchNumber: '',
                  lotSize: 1,
                  unit: 'kg',
                  description: '',
                  productionPlace: '',
                  productionDate: '',
                  expiryDate: ''
                });
              }}
              className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Tạo lô khác
            </button>
            <button
              onClick={() => navigate('/my-products')}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Xem lô của tôi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl mb-2">Tạo lô sản xuất mới</h1>
        <p className="text-gray-600">Nhập thông tin lô để quản lý tập trung theo từng đợt sản xuất</p>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm mb-2">Mã lô (tùy chọn)</label>
              <input
                type="text"
                value={formData.batchNumber}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="VD: LOT-20260404-A1"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Số lượng lô</label>
              <input
                type="number"
                min="1"
                value={formData.lotSize}
                onChange={(e) => setFormData({ ...formData, lotSize: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Đơn vị</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="kg/thùng/hộp"
              />
            </div>
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
              <strong>Lưu ý:</strong> Sau khi tạo lô, hệ thống sẽ tự động:
            </p>
            <ul className="text-sm text-blue-700 mt-2 ml-4 list-disc space-y-1">
              <li>Tạo mã QR Code cho lô</li>
              <li>Ghi nhận thông tin lên Blockchain</li>
              <li>Tạo bước đầu tiên trong chuỗi cung ứng theo lô</li>
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
                  Tạo lô sản xuất
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
