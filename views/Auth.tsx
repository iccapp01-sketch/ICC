
import React, { useState } from 'react';
import { Lock, Mail, User as UserIcon, Calendar, Phone, ChevronDown, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface AuthProps {
  onLogin: (role: any) => void;
}

export const Auth: React.FC<AuthProps> = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    dob: '',
    phone: '',
    gender: 'Female'
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Admin Bypass for specific credentials
      if (isLogin && formData.email === 'admin@icc.com' && formData.password === 'admin123') {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });

          if (signInError) {
             const { data, error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: { data: { firstName: 'Admin', lastName: 'User', role: 'ADMIN' } }
             });
             if (signUpError) throw signUpError;
          }
          return;
      }

      if (isLogin) {
         const { error } = await supabase.auth.signInWithPassword({ email: formData.email, password: formData.password });
         if (error) throw error;
      } else {
         const { data, error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: { 
              data: { 
                firstName: formData.firstName, 
                lastName: formData.lastName, 
                dob: formData.dob, 
                phone: formData.phone, 
                gender: formData.gender 
              } 
            }
         });
         if (error) throw error;

         if (data.user) {
             if (data.session) {
                 await supabase.from('profiles').upsert([{ 
                   id: data.user.id, 
                   email: formData.email, 
                   first_name: formData.firstName, 
                   last_name: formData.lastName, 
                   dob: formData.dob, 
                   phone: formData.phone, 
                   gender: formData.gender, 
                   role: 'MEMBER' 
                 }]);
             } else {
                 setVerificationEmail(formData.email);
                 setNeedsVerification(true);
             }
         }
      }
    } catch (err: any) {
        setError(err.message || 'Authentication failed');
    } finally {
        setIsLoading(false);
    }
  };

  if (needsVerification) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#04152d] p-4 z-50 font-sans">
        <div className="w-full max-w-sm bg-white/10 backdrop-blur-xl border border-white/5 rounded-[40px] p-10 shadow-2xl text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="text-green-400 w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Check your Inbox</h2>
            <p className="text-blue-200 text-sm mb-8 leading-relaxed">We've sent a verification link to <br/><span className="font-bold text-white">{verificationEmail}</span></p>
            <button onClick={() => { setNeedsVerification(false); setIsLogin(true); }} className="w-full bg-[#0c2d58] text-white font-bold py-4 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 active:scale-95">
              <ArrowLeft size={18} /> Back to Login
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col h-full bg-[#04152d] overflow-hidden font-sans">
      <div 
        className="flex-1 overflow-y-auto w-full scroll-smooth"
        style={{ 
            WebkitOverflowScrolling: 'touch',
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)'
        }}
      >
        <div className="min-h-full flex flex-col items-center justify-center p-6 py-12">
            
            {/* Branding Card */}
            <div className="w-full max-w-[380px] bg-[#081d38] rounded-[40px] p-10 text-center shadow-2xl mb-8 border border-white/5">
                <img 
                    src="https://aqgzlavujweornbsnydg.supabase.co/storage/v1/object/public/logos/file_00000000643071f5b44f24278a84a971.png" 
                    alt="ICC Logo" 
                    className="w-[110px] h-auto mx-auto mb-6"
                />
                <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">Isipingo Community Church</h1>
                <p className="text-[#38bdf8] italic font-semibold text-base">Where it's all about Jesus</p>
            </div>

            {/* Auth Form Card */}
            <div className="w-full max-w-[380px] bg-white/10 backdrop-blur-md border border-white/10 rounded-[40px] p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <h2 className="text-[20px] text-white font-bold mb-1">Welcome to ICC</h2>
                    <p className="text-[#38bdf8] text-[13px] font-semibold">Join our community of believers</p>
                </div>

                {/* Login / Sign Up Toggle Pill */}
                <div className="bg-white rounded-full p-1 flex mb-8 shadow-inner relative h-[54px] items-center">
                    <button 
                      type="button" 
                      onClick={() => { setIsLogin(true); setError(''); }} 
                      className={`flex-1 h-full rounded-full text-[14px] font-bold transition-all duration-300 z-10 ${isLogin ? 'text-slate-900 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] ring-1 ring-black/5' : 'text-slate-400'}`}
                    >
                      Login
                    </button>
                    <button 
                      type="button" 
                      onClick={() => { setIsLogin(false); setError(''); }} 
                      className={`flex-1 h-full rounded-full text-[14px] font-bold transition-all duration-300 z-10 ${!isLogin ? 'text-slate-900 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] ring-1 ring-black/5' : 'text-slate-400'}`}
                    >
                      Sign Up
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                      <div className="flex gap-3">
                        <div className="flex-1 space-y-1.5">
                            <label className="text-[11px] text-slate-300 ml-3 font-semibold">First Name</label>
                            <div className="relative">
                              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                              <input 
                                name="firstName" 
                                value={formData.firstName} 
                                onChange={handleChange} 
                                placeholder="John" 
                                required={!isLogin} 
                                className="w-full bg-white text-slate-900 rounded-[20px] py-[15px] pl-11 pr-4 text-[14px] font-bold outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                              />
                            </div>
                        </div>
                        <div className="flex-1 space-y-1.5">
                            <label className="text-[11px] text-slate-300 ml-3 font-semibold">Last Name</label>
                            <input 
                              name="lastName" 
                              value={formData.lastName} 
                              onChange={handleChange} 
                              placeholder="Doe" 
                              required={!isLogin} 
                              className="w-full bg-white text-slate-900 rounded-[20px] py-[15px] px-6 text-[14px] font-bold outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                            />
                        </div>
                      </div>
                  )}

                  <div className="space-y-1.5">
                      <label className="text-[11px] text-slate-300 ml-3 font-semibold">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                        <input 
                          name="email" 
                          type="email" 
                          placeholder="your@email.com" 
                          value={formData.email} 
                          onChange={handleChange} 
                          required 
                          className="w-full bg-white text-slate-900 rounded-[20px] py-[15px] pl-11 pr-4 text-[14px] font-bold outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        />
                      </div>
                  </div>

                  <div className="space-y-1.5">
                      <label className="text-[11px] text-slate-300 ml-3 font-semibold">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                        <input 
                          name="password" 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          value={formData.password} 
                          onChange={handleChange} 
                          required 
                          className="w-full bg-white text-slate-900 rounded-[20px] py-[15px] pl-11 pr-11 text-[14px] font-bold outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                          {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                        </button>
                      </div>
                  </div>

                  {!isLogin && (
                      <>
                        <div className="space-y-1.5">
                          <label className="text-[11px] text-slate-300 ml-3 font-semibold">Date of Birth</label>
                          <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                            <input 
                              name="dob" 
                              type="date" 
                              value={formData.dob} 
                              onChange={handleChange} 
                              required={!isLogin} 
                              className="w-full bg-white text-slate-900 rounded-[20px] py-[15px] pl-11 pr-4 text-[14px] font-bold outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] text-slate-300 ml-3 font-semibold">Phone Number</label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                            <input 
                              name="phone" 
                              type="tel" 
                              placeholder="+27 123 456 789" 
                              value={formData.phone} 
                              onChange={handleChange} 
                              required={!isLogin} 
                              className="w-full bg-white text-slate-900 rounded-[20px] py-[15px] pl-11 pr-4 text-[14px] font-bold outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] text-slate-300 ml-3 font-semibold">Gender</label>
                          <div className="relative">
                            <select 
                              name="gender" 
                              value={formData.gender} 
                              onChange={handleChange} 
                              className="w-full bg-white text-slate-900 rounded-[20px] py-[15px] px-6 text-[14px] font-bold outline-none focus:ring-2 focus:ring-blue-500 shadow-sm appearance-none"
                            >
                              <option>Female</option>
                              <option>Male</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18}/>
                          </div>
                        </div>
                      </>
                  )}

                  {isLogin && (
                    <div className="flex items-center justify-between px-2 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={rememberMe} 
                          onChange={(e) => setRememberMe(e.target.checked)} 
                          className="w-3.5 h-3.5 rounded border-none bg-white/20 text-blue-600 focus:ring-0 focus:ring-offset-0"
                        />
                        <span className="text-[11px] text-slate-200 font-semibold">Remember me</span>
                      </label>
                      <button type="button" className="text-[11px] text-[#38bdf8] font-bold hover:underline">Forgot Password?</button>
                    </div>
                  )}

                  {error && <p className="text-red-300 bg-red-900/40 border border-red-500/20 p-3 rounded-2xl text-[11px] text-center font-bold">{error}</p>}

                  <button 
                    disabled={isLoading} 
                    className="w-full bg-[#0c2d58] hover:bg-[#1a3b63] text-white font-black py-[18px] rounded-[24px] shadow-2xl transition-all transform active:scale-[0.98] mt-6 disabled:opacity-50 text-[14px] tracking-tight"
                  >
                    {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
                  </button>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
};
