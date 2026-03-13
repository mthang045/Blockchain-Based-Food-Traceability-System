import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { productAPI } from '../services/apiService';
import { Package, Plus, Eye, QrCode, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import QRCode from 'react-qr-code';
import { toast } from 'sonner';

const stepOptions = [
  { value: 'InTransit', label: 'Dang van chuyen' },
  { value: 'InStore', label: 'Tai cua hang' },
  { value: 'Sold', label: 'Da ban' },
];

const statusLabels = {
  Pending: 'Cho xu ly',
  Produced: 'Da san xuat',
  InTransit: 'Dang van chuyen',
  Delivered: 'Da giao hang',
  InStore: 'Tai cua hang',
  Sold: 'Da ban',
};

export default function MyProductsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQRId, setShowQRId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [stepForm, setStepForm] = useState({ status: 'InTransit', location: '', notes: '' });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAllProducts();
      if (response.success) {
        setProducts(response.data || []);
      }
    } catch (error) {
      toast.error(error.message || 'Khong the tai danh sach san pham');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const myProducts = useMemo(() => {
    return products.filter((p) => {
      const producer = p.producer || {};
      return (
        producer.userId === user?._id ||
        producer.address === user?.walletAddress ||
        p.manufacturerAddress === user?.walletAddress
      );
    });
  }, [products, user]);

  const handleUpdateStatus = async (product) => {
    try {
      const response = await productAPI.updateProductStatus(product.productId, stepForm.status, {
        location: stepForm.location || product.origin || 'Unknown location',
        notes: stepForm.notes,
      });

      if (response.success) {
        toast.success('Cap nhat trang thai thanh cong');
        setEditId(null);
        setStepForm({ status: 'InTransit', location: '', notes: '' });
        await fetchProducts();
      } else {
        toast.error(response.message || 'Cap nhat that bai');
      }
    } catch (error) {
      toast.error(error.message || 'Cap nhat that bai');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow text-center py-12">
          <Loader2 className="w-10 h-10 mx-auto animate-spin text-green-500 mb-3" />
          Dang tai san pham...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl mb-2">San pham cua toi</h1>
          <p className="text-gray-600">Quan ly san pham va chuoi cung ung</p>
        </div>
        <button
          onClick={() => navigate('/create-product')}
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Tao san pham moi
        </button>
      </div>

      {myProducts.length === 0 ? (
        <div className="bg-white rounded-xl shadow text-center py-12">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl mb-2">Chua co san pham nao</h3>
          <button
            onClick={() => navigate('/create-product')}
            className="mt-4 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Tao san pham moi
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {myProducts.map((product) => {
            const history = product.history || [];
            const status = product.status || product.currentStatus;

            return (
              <div key={product.productId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg mb-1">{product.name}</h3>
                      <p className="text-sm text-gray-600">{product.origin}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                          {statusLabels[status] || status}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-mono">
                          {product.qrCode}
                        </span>
                      </div>
                    </div>
                    <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center">
                      <Package className="w-7 h-7 text-green-600" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-600">Ma san pham:</span>
                      <p className="font-medium font-mono text-xs">{product.productId}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Ngay tao:</span>
                      <p className="font-medium">{new Date(product.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowQRId(showQRId === product.productId ? null : product.productId)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                    >
                      <QrCode className="w-4 h-4" /> QR
                    </button>
                    <button
                      onClick={() => setSelectedId(selectedId === product.productId ? null : product.productId)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" /> Chi tiet
                    </button>
                    <button
                      onClick={() => setEditId(editId === product.productId ? null : product.productId)}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      Them buoc
                    </button>
                  </div>
                </div>

                {showQRId === product.productId && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50">
                    <div className="bg-white p-4 rounded-lg shadow-sm inline-block">
                      <QRCode value={product.qrCode || product.productId} size={180} />
                    </div>
                  </div>
                )}

                {selectedId === product.productId && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50">
                    <h4 className="font-medium mb-4">Lich su cap nhat ({history.length})</h4>
                    <div className="space-y-3">
                      {history.length === 0 ? (
                        <p className="text-sm text-gray-500">Chua co lich su cap nhat.</p>
                      ) : (
                        history.map((step, index) => (
                          <div key={`${product.productId}-${index}`} className="bg-white rounded-lg p-4 border border-gray-200">
                            <p className="font-medium">{statusLabels[step.status] || step.status}</p>
                            <p className="text-sm text-gray-600">{step.location}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(step.timestamp).toLocaleString('vi-VN')} - {step.performedBy}
                            </p>
                            {step.notes && <p className="text-sm text-gray-700 mt-2">{step.notes}</p>}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {editId === product.productId && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50">
                    <div className="space-y-3">
                      <select
                        value={stepForm.status}
                        onChange={(e) => setStepForm({ ...stepForm, status: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        {stepOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={stepForm.location}
                        onChange={(e) => setStepForm({ ...stepForm, location: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Dia diem"
                      />
                      <textarea
                        value={stepForm.notes}
                        onChange={(e) => setStepForm({ ...stepForm, notes: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Ghi chu"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button onClick={() => setEditId(null)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Huy</button>
                        <button onClick={() => handleUpdateStatus(product)} className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Xac nhan</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
