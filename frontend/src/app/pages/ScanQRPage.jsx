import { useState } from 'react';
import { storageService } from '../services/storage';
import { Scan, Search, Package, MapPin, Calendar, User, CheckCircle2, ArrowRight } from 'lucide-react';
import QRCode from 'react-qr-code';

export default function ScanQRPage() {
  const [qrInput, setQrInput] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = () => {
    setNotFound(false);
    setSearchResult(null);

    const products = storageService.getProducts();
    const product = products.find((p) => p.qrCode === qrInput.trim());

    if (product) {
      const supplyChain = storageService.getSupplyChainByProduct(product.id);
      const producer = storageService.getUserById(product.producerId);
      
      setSearchResult({
        product,
        supplyChain,
        producer,
      });
    } else {
      setNotFound(true);
    }
  };

  const stepIcons = {
    harvest: '🌾',
    packaging: '📦',
    transport: '🚚',
    warehouse: '🏭',
    retail: '🏪',
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl mb-2">Truy xuất nguồn gốc</h1>
        <p className="text-gray-600">Quét mã QR hoặc nhập mã để xem thông tin sản phẩm</p>
      </div>

      {/* Search Box */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Scan className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
              placeholder="Nhập mã QR (VD: FOODCHAIN-XXXXXXXX)"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-8 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <Search className="w-5 h-5" />
            Tra cứu
          </button>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Hướng dẫn:</strong> Nhập mã QR trên bao bì sản phẩm để xem đầy đủ thông tin về nguồn gốc và hành trình của sản phẩm
          </p>
        </div>
      </div>

      {/* Not Found */}
      {notFound && (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl mb-2">Không tìm thấy sản phẩm</h3>
          <p className="text-gray-600">Mã QR không tồn tại trong hệ thống. Vui lòng kiểm tra lại.</p>
        </div>
      )}

      {/* Search Result */}
      {searchResult && (
        <div className="space-y-6">
          {/* Product Info */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl mb-2">{searchResult.product.name}</h2>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Sản phẩm đã được xác thực trên Blockchain</span>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <QRCode value={searchResult.product.qrCode} size={100} />
                </div>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Mã sản phẩm</p>
                    <p className="font-medium font-mono">{searchResult.product.qrCode}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Nơi sản xuất</p>
                    <p className="font-medium">{searchResult.product.productionPlace}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Nhà sản xuất</p>
                    <p className="font-medium">{searchResult.product.producerName}</p>
                    {searchResult.producer && (
                      <p className="text-sm text-gray-500">{searchResult.producer.email}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Ngày sản xuất</p>
                    <p className="font-medium">
                      {new Date(searchResult.product.productionDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-orange-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Hạn sử dụng</p>
                    <p className="font-medium">
                      {new Date(searchResult.product.expiryDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Trạng thái hiện tại</p>
                    <p className="font-medium">{searchResult.product.currentStatus}</p>
                  </div>
                </div>
              </div>
            </div>

            {searchResult.product.blockchainHash && (
              <div className="px-6 pb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Blockchain Transaction Hash</p>
                  <p className="font-mono text-xs break-all text-gray-700">
                    {searchResult.product.blockchainHash}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Supply Chain Journey */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl mb-6">Hành trình chuỗi cung ứng</h3>
            
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

              <div className="space-y-8">
                {searchResult.supplyChain.map((step, index) => (
                  <div key={step.id} className="relative flex gap-6">
                    {/* Step Icon */}
                    <div className="relative z-10 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 border-4 border-white shadow">
                      <span className="text-2xl">{stepIcons[step.step]}</span>
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 pb-8">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-lg">{step.stepName}</h4>
                          <span className="text-sm text-gray-500">Bước {index + 1}</span>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">{step.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">
                              {new Date(step.timestamp).toLocaleString('vi-VN')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">{step.performedBy}</span>
                          </div>
                          {step.notes && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-gray-600 italic">"{step.notes}"</p>
                            </div>
                          )}
                          {step.blockchainHash && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <p className="text-xs text-gray-500">TX Hash:</p>
                              <p className="font-mono text-xs text-gray-600 truncate">
                                {step.blockchainHash}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
