import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Phone, MapPin, Save, Edit } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(formData);
    setIsEditing(false);
    toast.success('Cập nhật thông tin thành công!');
  };

  const roleLabels = {
    admin: 'Quản trị viên',
    producer: 'Nhà sản xuất',
    transporter: 'Nhà vận chuyển',
    store: 'Cửa hàng',
    consumer: 'Người tiêu dùng',
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl mb-2">Thông tin cá nhân</h1>
        <p className="text-gray-600">Quản lý thông tin tài khoản của bạn</p>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <User className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl mb-1">{user.name}</h2>
              <p className="opacity-90">{roleLabels[user.role]}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm mb-2">Họ và tên</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Số điện thoại</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0901234567"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Địa chỉ</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  placeholder="Địa chỉ của bạn"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user.name,
                      phone: user.phone || '',
                      address: user.address || '',
                    });
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Lưu thay đổi
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Họ và tên</p>
                  <p className="font-medium">{user.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Số điện thoại</p>
                  <p className="font-medium">{user.phone || 'Chưa cập nhật'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Địa chỉ</p>
                  <p className="font-medium">{user.address || 'Chưa cập nhật'}</p>
                </div>
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
              >
                <Edit className="w-5 h-5" />
                Chỉnh sửa thông tin
              </button>
            </div>
          )}
        </div>

        {/* Account Info */}
        <div className="border-t border-gray-200 p-8 bg-gray-50">
          <h3 className="font-medium mb-4">Thông tin tài khoản</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">ID tài khoản:</span>
              <span className="font-mono">{user.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Vai trò:</span>
              <span>{roleLabels[user.role]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ngày tạo:</span>
              <span>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
