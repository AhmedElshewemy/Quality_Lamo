import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Fish, Lock, Mail, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(email, password);
    if (!success) {
      setError('البريد الإلكتروني غير صحيح');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700 flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full mb-4">
              <Fish className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">نظام إدارة الجودة</h1>
            <p className="text-gray-500 mt-2">مطعم سي فود - نظام مراقبة الجودة</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="أدخل البريد الإلكتروني"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="أدخل كلمة المرور"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl"
            >
              تسجيل الدخول
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 font-medium mb-2">حسابات تجريبية:</p>
            <div className="space-y-1 text-xs text-gray-600">
              <p><span className="font-medium">مهندس جودة:</span> ahmed@seafood.com</p>
              <p><span className="font-medium">مدير جودة:</span> sara@seafood.com</p>
              <p className="text-gray-400">(كلمة المرور: أي نص)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
