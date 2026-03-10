import { useState } from 'react';
import { storageService } from '../services/storage';
import { Link2, Search, Package, TrendingUp, CheckCircle } from 'lucide-react';

export default function BlockchainLogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const transactions = storageService.getBlockchainTransactions();
  
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.txHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.productId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || tx.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const typeLabels = {
    product_created: 'Tạo sản phẩm',
    supply_chain_updated: 'Cập nhật chuỗi cung ứng',
    status_changed: 'Thay đổi trạng thái',
  };

  const typeColors = {
    product_created: 'bg-green-100 text-green-700',
    supply_chain_updated: 'bg-blue-100 text-blue-700',
    status_changed: 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl mb-2">Blockchain Transaction Logs</h1>
        <p className="text-gray-600">
          Xem lịch sử giao dịch trên blockchain - Tổng: {transactions.length} transactions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Tổng Transactions</p>
              <p className="text-3xl">{transactions.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Link2 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Sản phẩm trên Blockchain</p>
              <p className="text-3xl">
                {transactions.filter((tx) => tx.type === 'product_created').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Cập nhật chuỗi cung ứng</p>
              <p className="text-3xl">
                {transactions.filter((tx) => tx.type === 'supply_chain_updated').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Tìm kiếm theo TX Hash hoặc Product ID..."
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Tất cả loại</option>
            <option value="product_created">Tạo sản phẩm</option>
            <option value="supply_chain_updated">Cập nhật chuỗi cung ứng</option>
            <option value="status_changed">Thay đổi trạng thái</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Transaction Hash
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Loại
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Product ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Thời gian
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded block truncate max-w-xs">
                        {tx.txHash}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${typeColors[tx.type]}`}>
                        {typeLabels[tx.type]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs text-gray-600">
                        {tx.productId.substring(0, 8)}...
                      </code>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(tx.timestamp).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">Confirmed</span>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="p-12 text-center">
            <Link2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl mb-2">Không tìm thấy transaction</h3>
            <p className="text-gray-600">Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc</p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-medium text-blue-900 mb-2">ℹ️ Thông tin Blockchain</h3>
        <p className="text-sm text-blue-800">
          Hệ thống sử dụng mock blockchain để mô phỏng việc lưu trữ dữ liệu. 
          Mỗi transaction được hash và lưu trữ với timestamp để đảm bảo tính bất biến của dữ liệu.
          Trong môi trường thực tế, dữ liệu sẽ được ghi lên blockchain thực như Ethereum, Hyperledger, v.v.
        </p>
      </div>
    </div>
  );
}
