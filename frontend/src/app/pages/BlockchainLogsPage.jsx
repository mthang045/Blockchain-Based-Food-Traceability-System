import { useEffect, useMemo, useState } from 'react';
import { blockchainAPI } from '../services/apiService';
import { Link2, Search, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function BlockchainLogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await blockchainAPI.getAllLogs();
      if (response.success) {
        setLogs(response.data || []);
      }
    } catch (error) {
      toast.error(error.message || 'Khong the tai blockchain logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return logs.filter((tx) => {
      const hash = (tx.transactionHash || '').toLowerCase();
      const event = (tx.event || '').toLowerCase();
      return hash.includes(q) || event.includes(q);
    });
  }, [logs, searchTerm]);

  if (loading) {
    return <div className="max-w-7xl mx-auto bg-white rounded-xl shadow p-12 text-center">Dang tai blockchain logs...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl mb-2">Blockchain Transaction Logs</h1>
        <p className="text-gray-600">Tong: {logs.length} su kien</p>
      </div>

      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg"
            placeholder="Tim theo tx hash hoac ten su kien"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Block</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Event</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Transaction Hash</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Trang thai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLogs.map((tx, index) => (
                <tr key={`${tx.transactionHash}-${index}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{tx.blockNumber}</td>
                  <td className="px-6 py-4 text-sm">{tx.event}</td>
                  <td className="px-6 py-4">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded block truncate max-w-xs">
                      {tx.transactionHash}
                    </code>
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

        {filteredLogs.length === 0 && (
          <div className="p-12 text-center">
            <Link2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl mb-2">Khong tim thay transaction</h3>
            <p className="text-gray-600">Thu tim kiem voi tu khoa khac</p>
          </div>
        )}
      </div>
    </div>
  );
}
