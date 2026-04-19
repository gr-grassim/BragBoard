import { useState } from 'react';
import { User, Lock, Mail, Briefcase, Sun, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AuthPage() {
  const { login } = useAuth(); 
  
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '', 
    email: '',
    password: '',
    department: 'Engineering', 
    role: 'employee'
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        // --- Login part ---
        const response = await fetch('http://127.0.0.1:8000/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
             email: formData.email,
             password: formData.password
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || 'Login failed. Check your credentials.');
        }

        const data = await response.json();
        login(data.access_token);

      } else {
        // --- Registration part ---
        const response = await fetch('http://127.0.0.1:8000/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.username,
            email: formData.email,
            password: formData.password,
            department: formData.department,
            role: 'employee'
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || 'Registration failed');
        }

        alert('Registration successful! Please log in.');
        setIsLogin(true);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    // 1. GOLDEN HOUR BACKGROUND
    <div className="min-h-screen flex items-center justify-center bg-stone-50 relative overflow-hidden font-sans selection:bg-orange-200 selection:text-orange-900">
      
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-200/40 rounded-full blur-[120px] mix-blend-multiply animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] bg-rose-200/40 rounded-full blur-[120px] mix-blend-multiply"></div>
      <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-orange-100/50 rounded-full blur-[100px] mix-blend-multiply"></div>

      {/* 2. GLASS CARD CONTAINER */}
      <div className="relative z-10 w-full max-w-md px-6">
        
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-rose-400 rounded-3xl blur opacity-20"></div>
        
        <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-8 md:p-10">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 transform -rotate-6 mb-6">
               <Sun className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold text-stone-800 tracking-tight mb-2">BragBoard</h1>
            <p className="text-stone-500 font-medium">
              {isLogin ? 'Welcome back! Sign in to continue.' : 'Join the team and celebrate success.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold animate-shake">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            {/* Registration: Full Name */}
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-3.5 h-5 w-5 text-stone-400 group-focus-within:text-orange-500 transition-colors" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition-all font-medium"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1"> Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-stone-400 group-focus-within:text-orange-500 transition-colors" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition-all font-medium"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-stone-400 group-focus-within:text-orange-500 transition-colors" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition-all font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Registration: Department */}
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Department</label>
                <div className="relative group">
                  <Briefcase className="absolute left-4 top-3.5 h-5 w-5 text-stone-400 group-focus-within:text-orange-500 transition-colors" />
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition-all font-medium appearance-none"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Sales">Sales</option>
                    <option value="HR">HR</option>
                  </select>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transform hover:-translate-y-0.5 transition-all duration-200 mt-2"
            >
              <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
              }}
              className="text-sm text-stone-500 font-medium hover:text-orange-600 transition-colors"
            >
              {isLogin ? (
                  <>Don't have an account? <span className="font-bold text-orange-500 underline decoration-orange-300 underline-offset-4">Sign Up</span></>
              ) : (
                  <>Already have an account? <span className="font-bold text-orange-500 underline decoration-orange-300 underline-offset-4">Sign In</span></>
              )}
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}