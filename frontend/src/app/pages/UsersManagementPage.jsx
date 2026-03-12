import { useState } from 'react';
import { storageService } from '../services/storage';
import { Users, Search, Plus, Edit, Trash2, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';

export default function UsersManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'consumer',
    phone: '',
    address: '',
  });
  const [editFormData, setEditFormData] = useState({
    email: '',
    name: '',
    role: 'consumer',
    phone: '',
    address: '',
  });

  const users = storageService.getUsers();
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = (e) => {
    e.preventDefault();

    const existingUser = storageService.getUserByEmail(formData.email);
    if (existingUser) {
      toast.error('Email đã tồn tại');
      return;
    }

    const newUser = {
      ...formData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    storageService.addUser(newUser);
    toast.success('Thêm người dùng thành công!');
    setShowAddUser(false);
    setFormData({ email: '', name: '', role: 'consumer', phone: '', address: '' });
  };

  const handleDeleteUser = (userId) => {
    if (confirm('Bạn có chắc muốn xóa người dùng này?')) {
      storageService.deleteUser(userId);
      toast.success('Đã xóa người dùng');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user.id);
    setEditFormData({
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone || '',
      address: user.address || '',
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    storageService.updateUser(editingUser, editFormData);
    toast.success('Cập nhật thông tin thành công!');
    setEditingUser(null);
    setEditFormData({ email: '', name: '', role: 'consumer', phone: '', address: '' });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditFormData({ email: '', name: '', role: 'consumer', phone: '', address: '' });
  };

  const roleLabels = {
    admin: 'Quản trị viên',
    producer: 'Nhà sản xuất',
    transporter: 'Nhà vận chuyển',
    store: 'Cửa hàng',
    consumer: 'Người tiêu dùng',
  };

  const roleColors = {
    admin: 'bg-red-100 text-red-700',
    producer: 'bg-green-100 text-green-700',
    transporter: 'bg-blue-100 text-blue-700',
    store: 'bg-purple-100 text-purple-700',
    consumer: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl mb-2">Quản lý người dùng</h1>
          <p className="text-gray-600">Tổng số: {users.length} người dùng</p>
        </div>
        <button
          onClick={() => setShowAddUser(!showAddUser)}
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Thêm người dùng
        </button>
      </div>

      {/* Add User Form */}
      {showAddUser && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h3 className="text-lg mb-4">Thêm người dùng mới</h3>
          <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Tên *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Vai trò *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="consumer">Người tiêu dùng</option>
                <option value="producer">Nhà sản xuất</option>
                <option value="transporter">Nhà vận chuyển</option>
                <option value="store">Cửa hàng</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-2">Số điện thoại</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-2">Địa chỉ</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button
                type="button"
                onClick={() => setShowAddUser(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Thêm người dùng
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="Tìm kiếm theo tên hoặc email..."
          />
        </div>
      </div>

      {/* Edit User Form */}
      {editingUser && (
        <div className="bg-white rounded-xl shadow p-6 mb-6 border-2 border-blue-500">
          <h3 className="text-lg mb-4 flex items-center gap-2">
            <Edit className="w-5 h-5 text-blue-600" />
            Chỉnh sửa người dùng
          </h3>
          <form onSubmit={handleSaveEdit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">Email *</label>
              <input
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Tên *</label>
              <input
                type="text"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Vai trò *</label>
              <select
                value={editFormData.role}
                onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="consumer">Người tiêu dùng</option>
                <option value="producer">Nhà sản xuất</option>
                <option value="transporter">Nhà vận chuyển</option>
                <option value="store">Cửa hàng</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-2">Số điện thoại</label>
              <input
                type="tel"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-2">Địa chỉ</label>
              <input
                type="text"
                value={editFormData.address}
                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Người dùng
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Vai trò
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Liên hệ
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
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${roleColors[user.role]}`}>
                      {roleLabels[user.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      {user.phone && (
                        <div className="flex items-center gap-2 mb-1">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                      {user.address && (
                        <p className="text-gray-600">{user.address}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
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

        {filteredUsers.length === 0 && (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl mb-2">Không tìm thấy người dùng</h3>
            <p className="text-gray-600">Thử tìm kiếm với từ khóa khác</p>
          </div>
        )}
      </div>
    </div>
  );
}
