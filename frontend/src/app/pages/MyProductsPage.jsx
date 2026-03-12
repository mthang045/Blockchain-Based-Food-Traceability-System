import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { productAPI } from '../services/apiService';
import { Package, Plus, Eye, QrCode, Loader2, Download, Printer } from 'lucide-react';
import { useNavigate } from 'react-router';
import QRCode from 'react-qr-code';
import { toast } from 'sonner';

export default function MyProductsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showQR, setShowQR] = useState(null);
  const [showAddStep, setShowAddStep] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [stepForm, setStepForm] = useState({
    step: 'packaging',
    location: '',
    notes: '',
  });

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productAPI.getAllProducts();
        
        if (response.success) {
          // Filter products by current user (manufacturer)
          const userProducts = response.data.filter(
            p => p.manufacturerAddress === user?._id || p.manufacturerAddress === user?.walletAddress
          );
          setProducts(userProducts);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Không thể tải danh sách sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProducts();
    }
  }, [user]);

  // Download QR Code as PNG
  const downloadQRCode = (product) => {
    try {
      const svg = document.getElementById(`qr-${product._id || product.id}`);
      if (!svg) {
        toast.error('Không tìm thấy mã QR');
        return;
      }

      // Create canvas from SVG
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      
      img.onload = () => {
        canvas.width = 400;
        canvas.height = 400;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, 400, 400);
        
        // Download
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `QR-${product.name}-${product._id || product.id}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast.success('Đã tải xuống mã QR!');
        });
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (error) {
      console.error('Error downloading QR:', error);
      toast.error('Lỗi khi tải xuống mã QR');
    }
  };

  // Print QR Code with product info
  const printQRCode = (product) => {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Vui lòng cho phép popup để in');
        return;
      }

      const qrCodeSVG = document.getElementById(`qr-${product._id || product.id}`)?.outerHTML || '';
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>In mã QR - ${product.name}</title>
            <style>
              @media print {
                @page { margin: 0; }
                body { margin: 1cm; }
              }
              body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                padding: 20px;
              }
              .qr-container {
                text-align: center;
                border: 2px solid #333;
                padding: 30px;
                border-radius: 10px;
                background: white;
                max-width: 400px;
              }
              .qr-code {
                margin: 20px 0;
                display: flex;
                justify-content: center;
              }
              h1 {
                font-size: 24px;
                margin: 0 0 10px 0;
                color: #333;
              }
              .product-id {
                font-size: 14px;
                color: #666;
                font-family: 'Courier New', monospace;
                margin: 10px 0;
              }
              .info {
                margin: 10px 0;
                font-size: 14px;
                color: #555;
              }
              .company {
                font-size: 18px;
                color: #22c55e;
                font-weight: bold;
                margin-bottom: 20px;
              }
              .instructions {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px dashed #ccc;
                font-size: 12px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <div class="company">🌾 FoodChain</div>
              <h1>${product.name}</h1>
              <div class="product-id">Mã SP: ${product._id || product.id}</div>
              <div class="qr-code">
                ${qrCodeSVG}
              </div>
              <div class="info">
                <strong>Nơi sản xuất:</strong> ${product.origin || 'N/A'}<br>
                <strong>Ngày sản xuất:</strong> ${new Date(product.createdAt).toLocaleDateString('vi-VN')}<br>
                ${product.expiryDate ? `<strong>Hạn sử dụng:</strong> ${new Date(product.expiryDate).toLocaleDateString('vi-VN')}<br>` : ''}
              </div>
              <div class="instructions">
                📱 Quét mã QR để xem lịch sử truy xuất nguồn gốc sản phẩm
              </div>
            </div>
            <script>
              window.onload = () => {
                setTimeout(() => {
                  window.print();
                  window.onafterprint = () => window.close();
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
      toast.success('Đang mở cửa sổ in...');
    } catch (error) {
      console.error('Error printing QR:', error);
      toast.error('Lỗi khi in mã QR');
    }
  };

  const stepOptions = [
    { value: 'packaging', label: 'Đóng gói' },
    { value: 'transport', label: 'Vận chuyển' },
    { value: 'warehouse', label: 'Nhập kho' },
    { value: 'retail', label: 'Bán lẻ' },
  ];

  const handleAddStep = async (productId) => {
    if (!user) return;

    const stepLabels = {
      packaging: 'IN_TRANSIT',
      transport: 'IN_TRANSIT',
      warehouse: 'IN_STORE',
      retail: 'SOLD',
    };

    try {
      const newStatus = stepLabels[stepForm.step];
      
      // Update product status via API
      const response = await productAPI.updateProductStatus(productId, newStatus);

      if (response.success) {
        toast.success('Đã cập nhật trạng thái sản phẩm!');
        
        // Update local state
        setProducts(products.map(p => 
          p.productId === productId 
            ? { ...p, currentStatus: newStatus }
            : p
        ));
        
        setShowAddStep(null);
        setStepForm({ step: 'packaging', location: '', notes: '' });
      } else {
        toast.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error updating product status:', error);
      toast.error(error.message || 'Có lỗi xảy ra');
    }
  };

  const ProductCard = ({ product }) => {
    const supplyChain = storageService.getSupplyChainByProduct(product.id);
    
    const statusLabels = {
      'MANUFACTURED': 'Đã sản xuất',
      'IN_TRANSIT': 'Đang vận chuyển',
      'IN_STORE': 'Tại cửa hàng',
      'SOLD': 'Đã bán'
    };

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg mb-1">{product.name}</h3>
              <p className="text-sm text-gray-600">{product.origin}</p>
              {product.description && (
                <p className="text-sm text-gray-700 mt-1 italic">{product.description}</p>
              )}
              <div className="flex gap-2 mt-2">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                  {statusLabels[product.currentStatus] || product.currentStatus}
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
              <span className="text-gray-600">Mã sản phẩm:</span>
              <p className="font-medium font-mono text-xs">{product.productId}</p>
            </div>
            <div>
              <span className="text-gray-600">Ngày tạo:</span>
              <p className="font-medium">{new Date(product.createdAt).toLocaleDateString('vi-VN')}</p>
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
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                <QRCode 
                  id={`qr-${product._id || product.id}`}
                  value={product.qrCode || `FOOD-${product._id || product.id}`} 
                  size={200} 
                />
              </div>
              <p className="text-sm text-gray-600 mb-4 text-center">
                Quét mã QR này để xem lịch sử sản phẩm
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => downloadQRCode(product)}
                  className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Tải xuống PNG
                </button>
                <button
                  onClick={() => printQRCode(product)}
                  className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  In nhãn dán
                </button>
              </div>
            </div>
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
