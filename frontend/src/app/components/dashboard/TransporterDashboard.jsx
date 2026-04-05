import { Package, Truck, CheckCircle } from 'lucide-react';
import { StatCard, ProductItem, EmptyProducts } from './DashboardShared';

export default function TransporterDashboard({ products, onOpenTransport }) {
  const waiting = products.filter((p) => (p.status || p.currentStatus) === 'Produced').length;
  const moving = products.filter((p) => (p.status || p.currentStatus) === 'InTransit').length;
  const done = products.filter((p) => (p.status || p.currentStatus) === 'Delivered').length;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={Package} label="Chờ vận chuyển" value={waiting} color="bg-blue-500" />
        <StatCard icon={Truck} label="Đang vận chuyển" value={moving} color="bg-orange-500" />
        <StatCard icon={CheckCircle} label="Đã hoàn tất" value={done} color="bg-green-500" />
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow p-6 text-white">
        <h3 className="text-xl mb-2">Khu vực vận chuyển</h3>
        <p className="mb-4 opacity-90">Cập nhật trạng thái theo từng chặng ngay tại màn hình vận chuyển.</p>
        <button onClick={onOpenTransport} className="px-6 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium">
          Mở quản lý vận chuyển
        </button>
      </div>

      <div className="bg-white rounded-xl shadow">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg">Lô ưu tiên xử lý</h3>
          <button onClick={onOpenTransport} className="text-sm text-green-700 hover:text-green-800">Đi đến vận chuyển</button>
        </div>
        <div className="p-6 space-y-3">
          {products.length === 0
            ? <EmptyProducts message="Hiện chưa có lô nào cần vận chuyển" />
            : products.slice(0, 6).map((p) => (
              <ProductItem key={p._id || p.productId} product={p} onClick={onOpenTransport} ctaLabel="Cập nhật" />
            ))}
        </div>
      </div>
    </>
  );
}
