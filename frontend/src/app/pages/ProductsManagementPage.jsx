import { useState, useEffect } from 'react';
import { productAPI } from '../services/apiService';
import { Package, Search, Eye, Trash2, Edit, Plus, X, Calendar, MapPin, User, Loader, Download, Printer } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'react-qr-code';
import { useAuth } from '../contexts/AuthContext';

export default function ProductsManagementPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    origin: '',
    description: '',
    status: 'Produced',
    expiryDate: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAllProducts();
      if (response.success) {
        setProducts(response.data);
      } else {
        toast.error('Không thể tải danh sách sản phẩm');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Lỗi khi tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.qrCode && p.qrCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.producer?.username && p.producer.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        producer: {
          name: user?.username || user?.email || 'Admin',
          address: user?.walletAddress || user?._id || 'unknown-address',
          userId: user?._id,
        },
      };
      
      const response = await productAPI.createProduct(productData);
      if (response.success) {
        toast.success('Tạo sản phẩm thành công!');
        setShowCreateModal(false);
        setFormData({ name: '', origin: '', description: '', status: 'Produced', expiryDate: '' });
        fetchProducts();
      } else {
        toast.error(response.message || 'Không thể tạo sản phẩm');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Lỗi khi tạo sản phẩm');
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await productAPI.updateProduct(editingProduct, formData);
      if (response.success) {
        toast.success('Cập nhật sản phẩm thành công!');
        setEditingProduct(null);
        setFormData({ name: '', origin: '', description: '', status: 'Produced', expiryDate: '' });
        fetchProducts();
      } else {
        toast.error(response.message || 'Không thể cập nhật sản phẩm');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Lỗi khi cập nhật sản phẩm');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    
    try {
      const response = await productAPI.deleteProduct(productId);
      if (response.success) {
        toast.success('Đã xóa sản phẩm');
        setSelectedProduct(null);
        fetchProducts();
      } else {
        toast.error(response.message || 'Không thể xóa sản phẩm');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Lỗi khi xóa sản phẩm');
    }
  };

  const handleEditClick = (product) => {
    setEditingProduct(product.productId);
    setFormData({
      name: product.name,
      origin: product.origin || '',
      description: product.description || '',
      status: product.status,
      expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : '',
    });
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setFormData({ name: '', origin: '', description: '', status: 'Produced', expiryDate: '' });
  };

  // Download QR Code as PNG
  const downloadQRCode = (product) => {
    try {
      // Get the SVG element
      const svg = document.getElementById(`qr-${product._id}`);
      if (!svg) {
        toast.error('Không tìm thấy mã QR');
        return;
      }

      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();

      // Set canvas size
      canvas.width = 400;
      canvas.height = 400;

      img.onload = () => {
        // Fill white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw QR code
        ctx.drawImage(img, 0, 0, 400, 400);

        // Convert to blob and download
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `QR-${product.name}-${product._id}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast.success('Đã tải xuống mã QR!');
        });
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast.error('Lỗi khi tải xuống mã QR');
    }
  };

  // Print QR Code
  const printQRCode = (product) => {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Vui lòng cho phép popup để in mã QR');
        return;
      }

      // Get QR code SVG
      const qrElement = document.getElementById(`qr-${product._id}`);
      const qrCodeSVG = qrElement ? qrElement.outerHTML : '';

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>In mã QR - ${product.name}</title>
            <style>
              @media print {
                @page { margin: 0; }
                body { margin: 1.6cm; }
              }
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background: #f5f5f5;
              }
              .qr-container {
                background: white;
                border: 2px solid #333;
                padding: 30px;
                max-width: 400px;
                text-align: center;
              }
              .company {
                font-size: 24px;
                font-weight: bold;
                color: #16a34a;
                margin-bottom: 20px;
              }
              h1 {
                font-size: 28px;
                margin-bottom: 20px;
                color: #333;
              }
              .qr-code {
                margin: 30px 0;
                display: flex;
                justify-content: center;
              }
              .info {
                text-align: left;
                border-top: 2px solid #eee;
                padding-top: 20px;
                margin-top: 20px;
              }
              .info-row {
                margin-bottom: 12px;
                display: flex;
                gap: 10px;
              }
              .info-label {
                font-weight: bold;
                min-width: 120px;
                color: #666;
              }
              .info-value {
                color: #333;
              }
              .instructions {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                font-size: 12px;
                color: #666;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <div class="company">🌾 FoodChain</div>
              <h1>${product.name}</h1>
              <div class="qr-code">
                ${qrCodeSVG}
              </div>
              <div class="info">
                <div class="info-row">
                  <div class="info-label">Mã sản phẩm:</div>
                  <div class="info-value">${product._id}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Xuất xứ:</div>
                  <div class="info-value">${product.origin || 'Không có thông tin'}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Ngày sản xuất:</div>
                  <div class="info-value">${new Date(product.createdAt).toLocaleDateString('vi-VN')}</div>
                </div>
                ${product.expiryDate ? `
                <div class="info-row">
                  <div class="info-label">Hạn sử dụng:</div>
                  <div class="info-value">${new Date(product.expiryDate).toLocaleDateString('vi-VN')}</div>
                </div>
                ` : ''}
              </div>
              <div class="instructions">
                Quét mã QR để xem lịch sử truy xuất nguồn gốc sản phẩm
              </div>
            </div>
            <script>
              window.onload = function() {
                setTimeout(() => {
                  window.print();
                  window.onafterprint = function() {
                    window.close();
                  };
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (error) {
      console.error('Error printing QR code:', error);
      toast.error('Lỗi khi in mã QR');
    }
  };

  const statusLabels = {
    Produced: 'Đã sản xuất',
    InTransit: 'Đang vận chuyển',
    Delivered: 'Đã giao hàng',
  };

  const statusColors = {
    Produced: 'bg-blue-100 text-blue-700',
    InTransit: 'bg-orange-100 text-orange-700',
    Delivered: 'bg-green-100 text-green-700',
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải danh sách sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Quản lý sản phẩm</h1>
          <p className="text-gray-600">Tổng số: {products.length} sản phẩm</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Thêm sản phẩm mới
        </button>
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

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Sản phẩm
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Nhà sản xuất
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Ngày tạo
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                editingProduct === product.productId ? (
                  // Edit Form Row
                  <tr key={product.productId} className="bg-blue-50">
                    <td colSpan="5" className="px-6 py-4">
                      <form onSubmit={handleUpdateProduct} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Tên sản phẩm</label>
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Nơi sản xuất</label>
                            <input
                              type="text"
                              value={formData.origin}
                              onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Ghi chú / Mô tả</label>
                            <textarea
                              value={formData.description}
                              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                              placeholder="Thêm thông tin chi tiết về sản phẩm..."
                              rows="2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Trạng thái</label>
                            <select
                              value={formData.status}
                              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                            >
                              <option value="Produced">Đã sản xuất</option>
                              <option value="InTransit">Đang vận chuyển</option>
                              <option value="Delivered">Đã giao hàng</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Hạn sử dụng</label>
                            <input
                              type="date"
                              value={formData.expiryDate}
                              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            type="submit"
                            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                          >
                            Lưu
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            Hủy
                          </button>
                        </div>
                      </form>
                    </td>
                  </tr>
                ) : (
                  // Normal Row
                  <tr key={product.productId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.origin || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {product.producer?.username || product.producer?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${statusColors[product.status] || 'bg-gray-100 text-gray-700'}`}>
                        {statusLabels[product.status] || product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(product.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedProduct(
                            selectedProduct?.productId === product.productId ? null : product
                          )}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditClick(product)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.productId)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-gray-600">Thử tìm kiếm với từ khóa khác</p>
          </div>
        )}
      </div>

      {/* Create Product Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-semibold">Thêm sản phẩm mới</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({ name: '', origin: '', description: '', status: 'Produced', expiryDate: '' });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="VD: Cà phê Arabica Đà Lạt"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Nơi sản xuất</label>
                <input
                  type="text"
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="VD: Đà Lạt, Lâm Đồng"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ghi chú / Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="VD: Cà phê rang xay thơm ngon, được trồng ở độ cao 1500m..."
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Trạng thái ban đầu</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="Produced">Đã sản xuất</option>
                  <option value="InTransit">Đang vận chuyển</option>
                  <option value="Delivered">Đã giao hàng</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Hạn sử dụng</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💡 <strong>Lưu ý:</strong> Sản phẩm sẽ được gán cho người dùng hiện tại ({user?.username})
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Tạo sản phẩm
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ name: '', origin: '', description: '', status: 'Produced', expiryDate: '' });
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-semibold">Chi tiết sản phẩm</h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Product Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-4">Thông tin sản phẩm</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600">Tên:</span>
                      <p className="font-medium">{selectedProduct.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Nơi sản xuất:</span>
                      <p className="font-medium">{selectedProduct.origin || 'N/A'}</p>
                    </div>
                    {selectedProduct.description && (
                      <div>
                        <span className="text-gray-600">Mô tả:</span>
                        <p className="font-medium text-gray-700">{selectedProduct.description}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">Nhà sản xuất:</span>
                      <p className="font-medium">{selectedProduct.producer?.username || selectedProduct.producer?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Trạng thái:</span>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm ml-2 ${statusColors[selectedProduct.status] || 'bg-gray-100 text-gray-700'}`}>
                        {statusLabels[selectedProduct.status] || selectedProduct.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-4">Thời gian</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600">Ngày tạo:</span>
                      <p className="font-medium">
                        {new Date(selectedProduct.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    {selectedProduct.expiryDate && (
                      <div>
                        <span className="text-gray-600">Hạn sử dụng:</span>
                        <p className="font-medium">
                          {new Date(selectedProduct.expiryDate).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">Cập nhật lần cuối:</span>
                      <p className="font-medium">
                        {new Date(selectedProduct.updatedAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              {selectedProduct.qrCode && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium mb-4">Mã QR Code</h4>
                  <div className="flex flex-col items-center gap-4">
                    <div className="bg-white p-4 rounded-lg">
                      <QRCode 
                        value={selectedProduct.qrCode} 
                        size={200}
                        id={`qr-${selectedProduct._id}`}
                      />
                    </div>
                    <code className="text-sm bg-white px-4 py-2 rounded">
                      {selectedProduct.qrCode}
                    </code>
                    <div className="flex gap-3 mt-2">
                      <button
                        onClick={() => downloadQRCode(selectedProduct)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Tải xuống PNG
                      </button>
                      <button
                        onClick={() => printQRCode(selectedProduct)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <Printer className="w-4 h-4" />
                        In nhãn dán
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Blockchain */}
              {selectedProduct.blockchainTxHash && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Blockchain Transaction Hash</h4>
                  <code className="text-xs break-all block bg-white p-3 rounded">
                    {selectedProduct.blockchainTxHash}
                  </code>
                </div>
              )}

              {/* Supply Chain History */}
              {selectedProduct.history && selectedProduct.history.length > 0 && (
                <div>
                  <h4 className="font-medium mb-4">Lịch sử chuỗi cung ứng</h4>
                  <div className="space-y-3">
                    {selectedProduct.history.map((step, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg p-4 flex items-start gap-3"
                      >
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium">
                            {statusLabels[step.status] || step.status}
                          </h5>
                          {step.location && (
                            <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {step.location}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(step.timestamp).toLocaleString('vi-VN')}
                          </p>
                          {step.performedBy && (
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                              <User className="w-4 h-4" />
                              {step.performedBy}
                            </p>
                          )}
                          {step.notes && (
                            <p className="text-sm text-gray-700 mt-2 italic">"{step.notes}"</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
