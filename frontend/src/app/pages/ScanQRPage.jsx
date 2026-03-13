import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { productAPI } from '../services/apiService';
import { Scan, Search, Package, MapPin, Calendar, User, CheckCircle2, Camera, Keyboard, AlertCircle } from 'lucide-react';
import QRCode from 'react-qr-code';
import { toast } from 'sonner';

export default function ScanQRPage() {
  const [scanMode, setScanMode] = useState('camera'); // 'camera' hoặc 'manual'
  const [qrInput, setQrInput] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);
  const qrCodeScannerRef = useRef(null);

  // Initialize QR Scanner
  useEffect(() => {
    if (scanMode === 'camera' && !qrCodeScannerRef.current && scannerRef.current) {
      const html5QrcodeScanner = new Html5QrcodeScanner(
        'qr-reader',
        { 
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          // Yêu cầu camera sau
          videoConstraints: {
            facingMode: { ideal: "environment" }
          }
        },
        false
      );

      html5QrcodeScanner.render(onScanSuccess, onScanFailure);
      qrCodeScannerRef.current = html5QrcodeScanner;
      setIsScanning(true);
    }

    // Cleanup khi unmount hoặc chuyển mode
    return () => {
      if (qrCodeScannerRef.current) {
        qrCodeScannerRef.current.clear().catch(err => console.error('Clear error:', err));
        qrCodeScannerRef.current = null;
      }
    };
  }, [scanMode]);

  const onScanSuccess = async (decodedText) => {
    if (qrCodeScannerRef.current) {
      await qrCodeScannerRef.current.clear();
      qrCodeScannerRef.current = null;
    }
    setIsScanning(false);
    toast.success('Đã quét thành công mã QR!');
    handleSearchByCode(decodedText);
  };

  const onScanFailure = (error) => {
    // Không log error nữa vì nó spam console
  };

  const handleSearchByCode = async (code) => {
    setNotFound(false);
    setSearchResult(null);

    try {
      const response = await productAPI.getProductByQRCode(code);
      
      if (response.success && response.data) {
        setSearchResult(response.data);
        toast.success('Tìm thấy thông tin sản phẩm!');
      } else {
        setNotFound(true);
        toast.error('Không tìm thấy sản phẩm với mã QR này');
      }
    } catch (error) {
      console.error('Search error:', error);
      setNotFound(true);
      toast.error('Lỗi khi tìm kiếm sản phẩm');
    }
  };

  const handleManualSearch = () => {
    if (!qrInput.trim()) {
      toast.error('Vui lòng nhập mã QR');
      return;
    }
    handleSearchByCode(qrInput.trim());
  };

  const handleSwitchMode = () => {
    if (qrCodeScannerRef.current) {
      qrCodeScannerRef.current.clear().catch(err => console.error('Clear error:', err));
      qrCodeScannerRef.current = null;
    }
    setIsScanning(false);
    setScanMode(scanMode === 'camera' ? 'manual' : 'camera');
    setSearchResult(null);
    setNotFound(false);
  };

  const stepIcons = {
    harvest: '🌾',
    packaging: '📦',
    transport: '🚚',
    warehouse: '🏭',
    retail: '🏪',
    Produced: '🌾',
    InTransit: '🚚',
    Delivered: '📦',
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 lg:px-6">
      <div className="mb-6">
        <h1 className="text-3xl mb-2">Truy xuất nguồn gốc</h1>
        <p className="text-gray-600 max-w-2xl">Quét mã QR hoặc nhập mã để xem thông tin sản phẩm</p>
      </div>

      {/* Mode Switcher */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => scanMode !== 'camera' && handleSwitchMode()}
          className={`flex-1 px-6 py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-3 ${
            scanMode === 'camera'
              ? 'bg-green-500 text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Camera className="w-5 h-5" />
          Quét bằng Camera
        </button>
        <button
          onClick={() => scanMode !== 'manual' && handleSwitchMode()}
          className={`flex-1 px-6 py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-3 ${
            scanMode === 'manual'
              ? 'bg-green-500 text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Keyboard className="w-5 h-5" />
          Nhập mã thủ công
        </button>
      </div>

      {/* Camera Scanner Mode */}
      {scanMode === 'camera' && (
        <div className="bg-white rounded-xl shadow p-4 sm:p-6 mb-6">
          <div className="mb-4 p-4 bg-blue-50 rounded-lg flex items-start gap-3">
            <Camera className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-800 font-medium mb-1">
                Hướng camera vào mã QR trên bao bì sản phẩm
              </p>
              <p className="text-xs text-blue-600">
                Hệ thống sẽ tự động quét và hiển thị thông tin khi phát hiện mã QR
              </p>
            </div>
          </div>
          
          <div 
            id="qr-reader" 
            ref={scannerRef}
            className="rounded-lg overflow-hidden max-w-2xl mx-auto"
          ></div>
        </div>
      )}

      {/* Manual Input Mode */}
      {scanMode === 'manual' && (
        <div className="bg-white rounded-xl shadow p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Scan className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                placeholder="Nhập mã QR (VD: FOODCHAIN-XXXXXXXX)"
              />
            </div>
            <button
              onClick={handleManualSearch}
              className="px-8 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 sm:w-auto"
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
      )}

      {/* Not Found */}
      {notFound && (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl mb-2">Không tìm thấy sản phẩm</h3>
          <p className="text-gray-600">Mã QR không tồn tại trong hệ thống. Vui lòng kiểm tra lại.</p>
          <button
            onClick={() => {
              setNotFound(false);
              setQrInput('');
              if (scanMode === 'camera') {
                handleSwitchMode();
                setTimeout(() => handleSwitchMode(), 100);
              }
            }}
            className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Quét lại
          </button>
        </div>
      )}

      {/* Search Result */}
      {searchResult && (
        <div className="space-y-6">
          {/* Product Info */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl mb-2">{searchResult.name}</h2>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Sản phẩm đã được xác thực trên Blockchain</span>
                  </div>
                </div>
                {searchResult.qrCode && (
                  <div className="bg-white p-3 rounded-lg">
                    <QRCode value={searchResult.qrCode} size={100} />
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Mã sản phẩm</p>
                    <p className="font-medium font-mono">{searchResult._id}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Nơi sản xuất</p>
                    <p className="font-medium">{searchResult.origin || 'Đang cập nhật'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Nhà sản xuất</p>
                    <p className="font-medium">{searchResult.producer?.username || searchResult.producer?.name || 'N/A'}</p>
                    {searchResult.producer?.email && (
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
                      {new Date(searchResult.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
                {searchResult.expiryDate && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-orange-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Hạn sử dụng</p>
                      <p className="font-medium">
                        {new Date(searchResult.expiryDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Trạng thái hiện tại</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl">{stepIcons[searchResult.status] || '📦'}</span>
                      <span className="font-medium">
                        {searchResult.status === 'Produced' && 'Đã sản xuất'}
                        {searchResult.status === 'InTransit' && 'Đang vận chuyển'}
                        {searchResult.status === 'Delivered' && 'Đã giao hàng'}
                        {!['Produced', 'InTransit', 'Delivered'].includes(searchResult.status) && searchResult.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {searchResult.blockchainTxHash && (
              <div className="px-6 pb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Blockchain Transaction Hash</p>
                  <p className="font-mono text-xs break-all text-gray-700">
                    {searchResult.blockchainTxHash}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Supply Chain History */}
          {searchResult.history && searchResult.history.length > 0 && (
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-xl mb-6">Hành trình chuỗi cung ứng</h3>
              
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                <div className="space-y-8">
                  {searchResult.history.map((step, index) => (
                    <div key={index} className="relative flex gap-6">
                      {/* Step Icon */}
                      <div className="relative z-10 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 border-4 border-white shadow">
                        <span className="text-2xl">{stepIcons[step.status] || '📦'}</span>
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 pb-8">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-lg font-medium">
                              {step.status === 'Produced' && 'Sản xuất'}
                              {step.status === 'InTransit' && 'Vận chuyển'}
                              {step.status === 'Delivered' && 'Giao hàng'}
                              {!['Produced', 'InTransit', 'Delivered'].includes(step.status) && step.status}
                            </h4>
                            <span className="text-sm text-gray-500">Bước {index + 1}</span>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-700">{step.location || 'Đang cập nhật'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-700">
                                {new Date(step.timestamp).toLocaleString('vi-VN')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-700">{step.performedBy || 'Hệ thống'}</span>
                            </div>
                            {step.notes && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="text-gray-600 italic">"{step.notes}"</p>
                              </div>
                            )}
                            {step.txHash && (
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <p className="text-xs text-gray-500">TX Hash:</p>
                                <p className="font-mono text-xs text-gray-600 truncate">
                                  {step.txHash}
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
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setSearchResult(null);
                setQrInput('');
                setNotFound(false);
                if (scanMode === 'camera') {
                  handleSwitchMode();
                  setTimeout(() => handleSwitchMode(), 100);
                }
              }}
              className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
            >
              <Scan className="w-5 h-5" />
              Quét sản phẩm khác
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
