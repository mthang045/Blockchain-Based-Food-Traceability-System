import { useState } from 'react';
import { storageService } from '../services/storage';
import { Package, Search, Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'react-qr-code';

export default function ProductsManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const products = storageService.getProducts();
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.qrCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.producerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteProduct = (productId) => {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      storageService.deleteProduct(productId);
      toast.success('Đã xóa sản phẩm');
      setSelectedProduct(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl mb-2">Quản lý sản phẩm</h1>
        <p className="text-gray-600">Tổng số: {products.length} sản phẩm</p>
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
                  Mã QR
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Ngày SX
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.productionPlace}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {product.producerName}
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {product.qrCode}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      {product.currentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(product.productionDate).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedProduct(
                          selectedProduct?.id === product.id ? null : product
                        )}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
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

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl">Chi tiết sản phẩm</h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
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
                      <p className="font-medium">{selectedProduct.productionPlace}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Nhà sản xuất:</span>
                      <p className="font-medium">{selectedProduct.producerName}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Trạng thái:</span>
                      <p className="font-medium">{selectedProduct.currentStatus}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-4">Thời gian</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600">Ngày sản xuất:</span>
                      <p className="font-medium">
                        {new Date(selectedProduct.productionDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Hạn sử dụng:</span>
                      <p className="font-medium">
                        {new Date(selectedProduct.expiryDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Ngày tạo:</span>
                      <p className="font-medium">
                        {new Date(selectedProduct.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-medium mb-4">Mã QR Code</h4>
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-white p-4 rounded-lg">
                    <QRCode value={selectedProduct.qrCode} size={200} />
                  </div>
                  <code className="text-sm bg-white px-4 py-2 rounded">
                    {selectedProduct.qrCode}
                  </code>
                </div>
              </div>

              {/* Blockchain */}
              {selectedProduct.blockchainHash && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Blockchain Hash</h4>
                  <code className="text-xs break-all">
                    {selectedProduct.blockchainHash}
                  </code>
                </div>
              )}

              {/* Supply Chain */}
              <div>
                <h4 className="font-medium mb-4">Chuỗi cung ứng</h4>
                <div className="space-y-3">
                  {storageService
                    .getSupplyChainByProduct(selectedProduct.id)
                    .map((step, index) => (
                      <div
                        key={step.id}
                        className="bg-gray-50 rounded-lg p-4 flex items-start gap-3"
                      >
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
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
