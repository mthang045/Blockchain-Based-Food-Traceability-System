import { Package } from 'lucide-react';

export const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-xl shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm mb-1">{label}</p>
        <p className="text-3xl">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

export const ProductItem = ({ product, onClick, ctaLabel = 'Xem chi tiết' }) => {
  const status = product.status || product.currentStatus;

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-11 h-11 bg-green-100 rounded-lg flex items-center justify-center">
          <Package className="w-5 h-5 text-green-600" />
        </div>
        <div className="min-w-0">
          <h4 className="font-medium truncate">{product.name}</h4>
          <p className="text-sm text-gray-600 truncate">{product.batchNumber || product.productId}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">{status}</span>
        <button
          onClick={onClick}
          className="px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50 text-sm"
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
};

export const EmptyProducts = ({ message }) => (
  <div className="text-center py-10 text-gray-500">
    <Package className="w-10 h-10 mx-auto mb-3 opacity-50" />
    <p>{message}</p>
  </div>
);
