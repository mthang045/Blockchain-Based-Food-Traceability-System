import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, productAPI } from '../services/apiService';
import { Truck, Package, Search, MapPin, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const statusLabels = {
  Pending: 'Chờ xử lý',
  Produced: 'Đã sản xuất',
  InTransit: 'Đang vận chuyển',
  Delivered: 'Đã giao',
  InStore: 'Tại cửa hàng',
  Sold: 'Đã bán',
};

const progressSteps = ['Produced', 'InTransit', 'Delivered', 'InStore', 'Sold'];

const normalizeHistoryStatus = (entry) => {
  if (entry?.status) {
    return entry.status;
  }

  const action = String(entry?.action || '');
  const match = action.match(/Status changed to (.+)$/);
  return match?.[1] || '';
};

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
  const [locationOptions, setLocationOptions] = useState([]);

  const getProgressState = (status, step) => {
    const currentIndex = progressSteps.indexOf(status);
    const targetIndex = progressSteps.indexOf(step);

    if (targetIndex === -1) {
      return 'future';
    }

    if (targetIndex < currentIndex) {
      return 'done';
    }

    if (targetIndex === currentIndex) {
      return 'current';
    }

    return 'future';
  };

  const mergeLocationOptions = (fromUsers = [], fromProducts = []) => {
    const merged = new Map();

    for (const item of [...fromUsers, ...fromProducts]) {
      const label = String(item || '').trim();
      if (!label) continue;
      if (!merged.has(label.toLowerCase())) {
        merged.set(label.toLowerCase(), {
          value: label,
          label,
        });
      }
    }

    return Array.from(merged.values()).sort((a, b) => a.label.localeCompare(b.label, 'vi'));
  };

  const deriveLocationOptionsFromProducts = (items = []) => {
    const locationSet = new Set();

    for (const product of items) {
      const origin = String(product?.origin || '').trim();
      if (origin) locationSet.add(origin);

      const manufacturer = String(product?.manufacturer || '').trim();
      if (manufacturer) locationSet.add(manufacturer);

      const store = product?.relatedParties?.store;
      const storeLocation =
        String(store?.company || '').trim() ||
        String(store?.name || '').trim() ||
        String(store?.walletAddress || '').trim();
      if (storeLocation) locationSet.add(storeLocation);
    }

    return Array.from(locationSet);
  };

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAllProducts();
      if (response.success) {
        const items = response.data || [];
        setProducts(items);

        const productLocations = deriveLocationOptionsFromProducts(items);
        let userLocations = [];

        try {
          const usersResponse = await authAPI.getAllUsers();
          if (usersResponse?.success) {
            userLocations = (usersResponse.data || [])
              .filter((u) => ['STORE', 'MANUFACTURER', 'TRANSPORTER'].includes(String(u?.role || '').toUpperCase()) && u?.isActive !== false)
              .map((u) => String(u.company || u.username || u.email || '').trim())
              .filter(Boolean);
          }
        } catch (error) {
          // Non-admin roles might not access users endpoint; fallback to product-derived options.
        }

        setLocationOptions(mergeLocationOptions(userLocations, productLocations));
      }
    } catch (error) {
      toast.error(error.message || 'Không thể tải danh sách sản phẩm');
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

    if (!transportForm.fromLocation) {
      toast.error('Vui lòng chọn địa điểm xuất phát');
      return;
    }

    if (!transportForm.toLocation) {
      toast.error('Vui lòng chọn địa điểm đích');
      return;
    }

    const location = transportForm.toLocation
      ? `${transportForm.fromLocation || ''} -> ${transportForm.toLocation}`.trim()
      : transportForm.fromLocation || 'Unknown location';

    try {
      const response = await productAPI.updateProductStatus(product.productId, nextStatus, {
        location,
        notes,
      });

      if (response.success) {
        toast.success('Cập nhật trạng thái vận chuyển thành công');
        setSelectedProductId(null);
        setTransportForm({ fromLocation: '', toLocation: '', notes: '' });
        await fetchProducts();
      } else {
        toast.error(response.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      toast.error(error.message || 'Cập nhật thất bại');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl mb-2">Quản lý vận chuyển</h1>
        <p className="text-gray-600">Cập nhật trạng thái vận chuyển sản phẩm</p>
      </div>

      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg"
            placeholder="Tìm kiếm sản phẩm theo tên hoặc mã QR"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const status = product.status || product.currentStatus;
          const isSelected = selectedProductId === product.productId;
          const history = Array.isArray(product.history) ? product.history : [];

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
                  <div>
                    <span className="text-xs text-gray-500">Đã cập nhật {history.length} bước</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (isSelected) {
                      setSelectedProductId(null);
                      return;
                    }

                    setSelectedProductId(product.productId);
                    setTransportForm((prev) => ({
                      ...prev,
                      fromLocation: prev.fromLocation || product.origin || '',
                    }));
                  }}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {isSelected ? 'Đóng' : 'Vận chuyển'}
                </button>
              </div>

              {isSelected && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <h4 className="font-medium mb-4">Thông tin vận chuyển</h4>

                  <div className="mb-5">
                    <p className="text-sm text-gray-600 mb-3">Tiến độ hiện tại</p>
                    <div className="flex flex-wrap gap-2">
                      {progressSteps.map((step) => {
                        const state = getProgressState(status, step);
                        const className =
                          state === 'done'
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : state === 'current'
                              ? 'bg-blue-100 text-blue-700 border-blue-200'
                              : 'bg-gray-100 text-gray-500 border-gray-200';

                        return (
                          <span
                            key={`${product.productId}-${step}`}
                            className={`px-2.5 py-1 text-xs rounded-full border ${className}`}
                          >
                            {statusLabels[step] || step}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <select
                      value={transportForm.fromLocation}
                      onChange={(e) => setTransportForm({ ...transportForm, fromLocation: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Chọn địa điểm xuất phát</option>
                      {locationOptions.map((loc) => (
                        <option key={`from-${loc.value}`} value={loc.value}>{loc.label}</option>
                      ))}
                    </select>
                    <select
                      value={transportForm.toLocation}
                      onChange={(e) => setTransportForm({ ...transportForm, toLocation: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Chọn địa điểm đích</option>
                      {locationOptions.map((loc) => (
                        <option key={`to-${loc.value}`} value={loc.value}>{loc.label}</option>
                      ))}
                    </select>
                    <textarea
                      value={transportForm.notes}
                      onChange={(e) => setTransportForm({ ...transportForm, notes: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      rows={2}
                      placeholder="Ghi chú thêm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus(product, 'InTransit', transportForm.notes || 'Bat dau van chuyen')}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        Bắt đầu vận chuyển
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(product, 'Delivered', transportForm.notes || 'Vận chuyển hoàn tất')}
                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        Hoàn tất
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-gray-200">
                    <h5 className="font-medium mb-3">Lịch sử hành trình</h5>
                    {history.length === 0 ? (
                      <p className="text-sm text-gray-500">Chưa có lịch sử cập nhật cho lô này.</p>
                    ) : (
                      <div className="space-y-3 max-h-72 overflow-auto pr-1">
                        {history
                          .slice()
                          .reverse()
                          .map((entry, index) => {
                            const entryStatus = normalizeHistoryStatus(entry);
                            const entryLabel = statusLabels[entryStatus] || entry.stepName || entryStatus || 'Đã cập nhật';
                            const entryTime = entry.timestamp ? new Date(entry.timestamp) : null;

                            return (
                              <div key={`${product.productId}-history-${index}`} className="bg-white border border-gray-200 rounded-lg p-3">
                                <p className="font-medium text-sm">{entryLabel}</p>
                                <p className="text-sm text-gray-600">{entry.location || 'Không có địa điểm'}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {entryTime ? entryTime.toLocaleString('vi-VN') : 'Không có thời gian'}
                                  {entry.performedBy ? ` • ${entry.performedBy}` : ''}
                                </p>
                                {entry.notes ? <p className="text-sm text-gray-700 mt-2">{entry.notes}</p> : null}
                              </div>
                            );
                          })}
                      </div>
                    )}
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
