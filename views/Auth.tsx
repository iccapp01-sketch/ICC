import React, { useState } from 'react';
import { Lock, Mail, User as UserIcon, Calendar, Phone, ChevronDown, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Logo } from '../components/Logo';

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
      if (isLogin && formData.email === 'admin@icc.com' && formData.password === 'admin123') {
          const { error } = await supabase.auth.signInWithPassword({ email: formData.email, password: formData.password });
          if (error) throw error;
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
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#051121] p-4 z-50 font-sans">
        <div className="w-full max-w-sm bg-[#081c37] border border-white/5 rounded-[40px] p-10 shadow-2xl text-center">
            <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="text-blue-400 w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Check your Inbox</h2>
            <p className="text-blue-200 text-sm mb-8 leading-relaxed">We've sent a verification link to <br/><span className="font-bold text-white">{verificationEmail}</span></p>
            <button onClick={() => { setNeedsVerification(false); setIsLogin(true); }} className="w-full bg-[#112a4a] text-white font-bold py-4 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 active:scale-95">
              <ArrowLeft size={18} /> Back to Login
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col h-full bg-[#051121] overflow-hidden font-sans">
      <div className="flex-1 overflow-y-auto w-full no-scrollbar pb-10">
        <div className="min-h-full flex flex-col items-center justify-center p-6 space-y-8 animate-fade-in pt-12">
            
            {/* Branding Card (Screenshot 1) */}
            <div className="w-full max-w-[390px] bg-[#0c2445] rounded-[48px] p-10 py-12 text-center shadow-2xl border border-white/5">
                <div className="mb-6 flex justify-center">
                  <Logo className="w-20 h-auto" />
                </div>
                <h1 className="text-[22px] font-black text-white mb-1 tracking-tight">Isipingo Community Church</h1>
                <p className="text-[#38bdf8] italic font-semibold text-[15px]">Where it's all about Jesus</p>
            </div>

            {/* Auth Form Card (Screenshot 1 & 2) */}
            <div className="w-full max-w-[390px] bg-[#1a304a]/60 backdrop-blur-xl border border-white/10 rounded-[48px] p-10 shadow-2xl">
                <div className="text-center mb-10">
                    <h2 className="text-[18px] text-white font-bold mb-1">Welcome to ICC</h2>
                    <p className="text-[#38bdf8] text-[13px] font-semibold">Join our community of believers</p>
                </div>

                {/* Pill Toggle */}
                <div className="bg-white rounded-full p-1.5 flex mb-8 shadow-inner h-[54px] items-center">
                    <button 
                      type="button" 
                      onClick={() => { setIsLogin(true); setError(''); }} 
                      className={`flex-1 h-full rounded-full text-[14px] font-bold transition-all duration-300 z-10 ${isLogin ? 'text-[#011027] bg-white shadow-lg border border-slate-100' : 'text-slate-400'}`}
                    >
                      Login
                    </button>
                    <button 
                      type="button" 
                      onClick={() => { setIsLogin(false); setError(''); }} 
                      className={`flex-1 h-full rounded-full text-[14px] font-bold transition-all duration-300 z-10 ${!isLogin ? 'text-[#011027] bg-white shadow-lg border border-slate-100' : 'text-slate-400'}`}
                    >
                      Sign Up
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                      <div className="flex gap-4">
                        <div className="flex-1 space-y-1">
                            <label className="text-[11px] text-slate-300 ml-3 font-bold uppercase tracking-widest">First Name</label>
                            <div className="relative">
                              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                              <input 
                                name="firstName" 
                                value={formData.firstName} 
                                onChange={handleChange} 
                                placeholder="John" 
                                required={!isLogin} 
                                className="w-full bg-white text-slate-900 rounded-[18px] h-[50px] pl-11 pr-4 text-[13px] font-bold outline-none shadow-sm"
                              />
                            </div>
                        </div>
                        <div className="flex-1 space-y-1">
                            <label className="text-[11px] text-slate-300 ml-3 font-bold uppercase tracking-widest">Last Name</label>
                            <input 
                              name="lastName" 
                              value={formData.lastName} 
                              onChange={handleChange} 
                              placeholder="Doe" 
                              required={!isLogin} 
                              className="w-full bg-white text-slate-900 rounded-[18px] h-[50px] px-5 text-[13px] font-bold outline-none shadow-sm"
                            />
                        </div>
                      </div>
                  )}

                  <div className="space-y-1">
                      <label className="text-[11px] text-slate-300 ml-3 font-bold uppercase tracking-widest">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                        <input 
                          name="email" 
                          type="email" 
                          placeholder="your@email.com" 
                          value={formData.email} 
                          onChange={handleChange} 
                          required 
                          className="w-full bg-white text-slate-900 rounded-[18px] h-[50px] pl-11 pr-4 text-[13px] font-bold outline-none shadow-sm"
                        />
                      </div>
                  </div>

                  <div className="space-y-1">
                      <label className="text-[11px] text-slate-300 ml-3 font-bold uppercase tracking-widest">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                        <input 
                          name="password" 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          value={formData.password} 
                          onChange={handleChange} 
                          required 
                          className="w-full bg-white text-slate-900 rounded-[18px] h-[50px] pl-11 pr-11 text-[13px] font-bold outline-none shadow-sm"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                          {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                        </button>
                      </div>
                  </div>

                  {!isLogin && (
                      <>
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-300 ml-3 font-bold uppercase tracking-widest">Date of Birth</label>
                          <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                            <input 
                              name="dob" 
                              type="date" 
                              value={formData.dob} 
                              onChange={handleChange} 
                              required={!isLogin} 
                              className="w-full bg-white text-slate-900 rounded-[18px] h-[50px] pl-11 pr-4 text-[13px] font-bold outline-none"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-300 ml-3 font-bold uppercase tracking-widest">Phone Number</label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                            <input 
                              name="phone" 
                              type="tel" 
                              placeholder="+27 123 456 789" 
                              value={formData.phone} 
                              onChange={handleChange} 
                              required={!isLogin} 
                              className="w-full bg-white text-slate-900 rounded-[18px] h-[50px] pl-11 pr-4 text-[13px] font-bold outline-none shadow-sm"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-300 ml-3 font-bold uppercase tracking-widest">Gender</label>
                          <div className="relative">
                            <select 
                              name="gender" 
                              value={formData.gender} 
                              onChange={handleChange} 
                              className="w-full bg-white text-slate-900 rounded-[18px] h-[50px] px-5 text-[13px] font-bold outline-none appearance-none"
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
                          className="w-4 h-4 rounded border-none bg-white/20 text-blue-600 focus:ring-0"
                        />
                        <span className="text-[11px] text-slate-200 font-bold">Remember me</span>
                      </label>
                      <button type="button" className="text-[11px] text-[#38bdf8] font-bold hover:underline">Forgot Password?</button>
                    </div>
                  )}

                  {error && <p className="text-red-300 bg-red-900/40 border border-red-500/20 p-3 rounded-xl text-[10px] text-center font-bold">{error}</p>}

                  <button 
                    disabled={isLoading} 
                    className="w-full bg-[#0c2445] hover:bg-[#15345a] text-white font-black h-[56px] rounded-[20px] shadow-2xl transition-all transform active:scale-[0.98] mt-4 disabled:opacity-50 text-[15px] tracking-tight"
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