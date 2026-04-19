import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Sun, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    // 1. GOLDEN HOUR BACKGROUND
    <div className="min-h-screen flex items-center justify-center bg-stone-50 relative overflow-hidden font-sans selection:bg-orange-200 selection:text-orange-900">
      
      {/* Background Blobs (Same as Dashboard) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-200/40 rounded-full blur-[120px] mix-blend-multiply animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] bg-rose-200/40 rounded-full blur-[120px] mix-blend-multiply"></div>
      <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-orange-100/50 rounded-full blur-[100px] mix-blend-multiply"></div>

      {/* 2. GLASS CARD CONTAINER */}
      <div className="relative z-10 w-full max-w-md px-6">
        
        {/* Glow effect behind the card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-rose-400 rounded-3xl blur opacity-20"></div>
        
        <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-8 md:p-10">
          
          {/* Header */}
          <div className="text-center mb-10">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 transform -rotate-6 mb-6">
               <Sun className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold text-stone-800 tracking-tight mb-2">Welcome Back</h1>
            <p className="text-stone-500 font-medium">Enter your credentials to access BragBoard.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold animate-shake">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Work Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-stone-400 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-11 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition-all font-medium"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-stone-400 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-11 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition-all font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <span>Sign In</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Footer Text */}
          <div className="mt-8 text-center">
            <p className="text-sm text-stone-400 font-medium">
              Don't have an account? <span className="text-orange-500 cursor-pointer hover:underline">Contact Admin</span>
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}