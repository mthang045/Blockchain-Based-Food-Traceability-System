import { useEffect, useMemo, useState } from 'react';
import { authAPI } from '../services/apiService';
import { Users, Search, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_FORM = {
  username: '',
  email: '',
  password: '',
  role: 'CONSUMER',
  company: '',
  walletAddress: '',
};

const roleLabels = {
  ADMIN: 'Quan tri vien',
  MANUFACTURER: 'Nha san xuat',
  TRANSPORTER: 'Nha van chuyen',
  STORE: 'Cua hang',
  CONSUMER: 'Nguoi tieu dung',
};

const roleColors = {
  ADMIN: 'bg-red-100 text-red-700',
  MANUFACTURER: 'bg-green-100 text-green-700',
  TRANSPORTER: 'bg-blue-100 text-blue-700',
  STORE: 'bg-purple-100 text-purple-700',
  CONSUMER: 'bg-gray-100 text-gray-700',
};

export default function UsersManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [editFormData, setEditFormData] = useState(DEFAULT_FORM);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getAllUsers();
      if (response.success) {
        setUsers(response.data || []);
      }
    } catch (error) {
      toast.error(error.message || 'Khong the tai danh sach nguoi dung');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return users.filter((u) => {
      const username = (u.username || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      return username.includes(q) || email.includes(q);
    });
  }, [users, searchTerm]);

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        company: formData.company || undefined,
        walletAddress: formData.walletAddress || undefined,
      };

      const response = await authAPI.createUser(payload);
      if (response.success) {
        toast.success('Them nguoi dung thanh cong');
        setShowAddUser(false);
        setFormData(DEFAULT_FORM);
        await fetchUsers();
      } else {
        toast.error(response.message || 'Khong the them nguoi dung');
      }
    } catch (error) {
      toast.error(error.message || 'Khong the them nguoi dung');
    }
  };

  const handleEditUser = (user) => {
    setEditingUserId(user._id);
    setEditFormData({
      username: user.username || '',
      email: user.email || '',
      password: '',
      role: user.role || 'CONSUMER',
      company: user.company || '',
      walletAddress: user.walletAddress || '',
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        username: editFormData.username,
        email: editFormData.email,
        role: editFormData.role,
        company: editFormData.company || undefined,
        walletAddress: editFormData.walletAddress || undefined,
      };

      const response = await authAPI.updateUser(editingUserId, payload);
      if (response.success) {
        toast.success('Cap nhat nguoi dung thanh cong');
        setEditingUserId(null);
        setEditFormData(DEFAULT_FORM);
        await fetchUsers();
      } else {
        toast.error(response.message || 'Khong the cap nhat nguoi dung');
      }
    } catch (error) {
      toast.error(error.message || 'Khong the cap nhat nguoi dung');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Ban co chac muon xoa nguoi dung nay?')) return;

    try {
      const response = await authAPI.deleteUser(userId);
      if (response.success) {
        toast.success('Da xoa nguoi dung');
        await fetchUsers();
      } else {
        toast.error(response.message || 'Khong the xoa nguoi dung');
      }
    } catch (error) {
      toast.error(error.message || 'Khong the xoa nguoi dung');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow p-12 text-center">Dang tai...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl mb-2">Quan ly nguoi dung</h1>
          <p className="text-gray-600">Tong so: {users.length} nguoi dung</p>
        </div>
        <button
          onClick={() => setShowAddUser(!showAddUser)}
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Them nguoi dung
        </button>
      </div>

      {showAddUser && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h3 className="text-lg mb-4">Them nguoi dung moi</h3>
          <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Ten dang nhap"
              required
            />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Email"
              required
            />
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Mat khau"
              required
            />
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="CONSUMER">Nguoi tieu dung</option>
              <option value="MANUFACTURER">Nha san xuat</option>
              <option value="TRANSPORTER">Nha van chuyen</option>
              <option value="STORE">Cua hang</option>
              <option value="ADMIN">Quan tri vien</option>
            </select>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Cong ty"
            />
            <input
              type="text"
              value={formData.walletAddress}
              onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Wallet address"
            />
            <div className="md:col-span-2 flex gap-3">
              <button
                type="button"
                onClick={() => setShowAddUser(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Huy
              </button>
              <button type="submit" className="flex-1 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                Them nguoi dung
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg"
            placeholder="Tim kiem theo ten hoac email"
          />
        </div>
      </div>

      {editingUserId && (
        <div className="bg-white rounded-xl shadow p-6 mb-6 border-2 border-blue-500">
          <h3 className="text-lg mb-4 flex items-center gap-2">
            <Edit className="w-5 h-5 text-blue-600" />
            Chinh sua nguoi dung
          </h3>
          <form onSubmit={handleSaveEdit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={editFormData.username}
              onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
            <input
              type="email"
              value={editFormData.email}
              onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
            <select
              value={editFormData.role}
              onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="CONSUMER">Nguoi tieu dung</option>
              <option value="MANUFACTURER">Nha san xuat</option>
              <option value="TRANSPORTER">Nha van chuyen</option>
              <option value="STORE">Cua hang</option>
              <option value="ADMIN">Quan tri vien</option>
            </select>
            <input
              type="text"
              value={editFormData.company}
              onChange={(e) => setEditFormData({ ...editFormData, company: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Cong ty"
            />
            <input
              type="text"
              value={editFormData.walletAddress}
              onChange={(e) => setEditFormData({ ...editFormData, walletAddress: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Wallet address"
            />
            <div className="md:col-span-2 flex gap-3">
              <button
                type="button"
                onClick={() => setEditingUserId(null)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Huy
              </button>
              <button type="submit" className="flex-1 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                Luu thay doi
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Nguoi dung</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Vai tro</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Cong ty</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Ngay tao</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Hanh dong</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium">{user.username}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${roleColors[user.role] || 'bg-gray-100 text-gray-700'}`}>
                      {roleLabels[user.role] || user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.company || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEditUser(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Chinh sua">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteUser(user._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Xoa">
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
            <h3 className="text-xl mb-2">Khong tim thay nguoi dung</h3>
            <p className="text-gray-600">Thu tim kiem voi tu khoa khac</p>
          </div>
        )}
      </div>
    </div>
  );
}
