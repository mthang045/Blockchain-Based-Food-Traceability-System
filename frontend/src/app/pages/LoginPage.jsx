import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, UserPlus } from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('consumer');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(email, password, remember);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Email hoặc mật khẩu không chính xác');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !name) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const result = await register({
      username: name,
      email,
      password,
      role: role.toUpperCase(),
      company: address || undefined,
    });

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Email đã tồn tại trong hệ thống');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
            <span className="text-3xl">🌾</span>
          </div>
          <h1 className="text-3xl mb-2">FoodChain</h1>
          <p className="text-gray-600">Hệ thống truy xuất nguồn gốc thực phẩm</p>
        </div>

        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 rounded-md transition-all ${
              isLogin
                ? 'bg-white shadow text-green-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <LogIn className="inline-block w-4 h-4 mr-2" />
            Đăng nhập
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-4 rounded-md transition-all ${
              !isLogin
                ? 'bg-white shadow text-green-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <UserPlus className="inline-block w-4 h-4 mr-2" />
            Đăng ký
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm mb-2 text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-2 text-gray-700">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg transition-colors"
            >
              Đăng nhập
            </button>

            <div className="flex items-center justify-between mt-2">
              <label className="inline-flex items-center text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="mr-2 h-4 w-4"
                />
                Ghi nhớ đăng nhập
              </label>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm mb-2 text-gray-700">Họ tên *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Nguyễn Văn A"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-2 text-gray-700">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-2 text-gray-700">Mật khẩu *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-2 text-gray-700">Số điện thoại</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0901234567"
              />
            </div>
            <div>
              <label className="block text-sm mb-2 text-gray-700">Địa chỉ</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Địa chỉ của bạn"
              />
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                ℹ️ Tài khoản mới sẽ có vai trò <strong>Người tiêu dùng</strong> mặc định. 
                Liên hệ quản trị viên để thay đổi vai trò.
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg transition-colors"
            >
              Đăng ký tài khoản
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
