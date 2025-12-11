
import React, { useState } from 'react';
import { Lock, Mail, User as UserIcon, Calendar, Phone, ChevronDown, Eye, EyeOff, Plus, Check, ArrowLeft } from 'lucide-react';
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
      // SPECIAL HANDLING FOR ADMIN DEMO ACCOUNT
      if (isLogin && formData.email === 'admin@icc.com' && formData.password === 'admin123') {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });

          if (signInError) {
             console.log("Admin account not found, attempting to auto-create...");
             const { data, error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: { data: { firstName: 'Admin', lastName: 'User', role: 'ADMIN' } }
             });

             if (signUpError) throw signUpError;
             if (data.user) {
                 await supabase.from('profiles').upsert([{ id: data.user.id, email: formData.email, first_name: 'Admin', last_name: 'User', role: 'ADMIN' }]);
                 return;
             }
          } else if (signInData.user) {
              await supabase.from('profiles').upsert({ id: signInData.user.id, email: formData.email, role: 'ADMIN', first_name: 'Admin', last_name: 'User' });
              return;
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
            options: { data: { firstName: formData.firstName, lastName: formData.lastName, dob: formData.dob, phone: formData.phone, gender: formData.gender } }
         });
         if (error) throw error;

         if (data.user) {
             if (data.session) {
                 const { error: profileError } = await supabase.from('profiles').upsert([{ id: data.user.id, email: formData.email, first_name: formData.firstName, last_name: formData.lastName, dob: formData.dob, phone: formData.phone, gender: formData.gender, role: 'MEMBER' }]);
                 if (profileError) console.error("Profile creation failed:", JSON.stringify(profileError));
             } else {
                 setVerificationEmail(formData.email);
                 setNeedsVerification(true);
             }
         }
      }
    } catch (err: any) {
        if (err.message && err.message.includes("Email not confirmed")) {
           setError("Please verify your email address to log in. Check your inbox.");
        } else {
           setError(err.message || 'Authentication failed');
        }
    } finally {
        setIsLoading(false);
    }
  };

  if (needsVerification) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#0c2d58] to-[#08182e] p-4 font-sans">
        <div className="w-full max-w-sm bg-white/15 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 shadow-2xl text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="text-green-400 w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Check your Inbox</h2>
            <p className="text-blue-200 text-sm mb-6">We've sent a verification link to <br/><span className="font-bold text-white">{verificationEmail}</span></p>
            <p className="text-xs text-slate-400 mb-8">Please confirm your email address to activate your account and start your journey with us.</p>
            <button onClick={() => { setNeedsVerification(false); setIsLogin(true); }} className="w-full bg-[#112a4a] hover:bg-[#1a3b63] text-white font-bold py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2"><ArrowLeft size={18} /> Back to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#0c2d58] to-[#08182e] p-4 font-sans overflow-y-auto py-10">
      <div className="w-full max-w-sm bg-[#112a4a] rounded-[32px] p-8 text-center shadow-2xl mb-6 border-t border-white/10 relative z-10">
         <div className="w-24 h-24 bg-white/10 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg relative backdrop-blur-sm border border-white/20">
             <Logo className="w-16 h-16" />
         </div>
         <h1 className="text-2xl font-bold text-white mb-1 leading-tight tracking-tight">Isipingo Community Church</h1>
         <p className="text-[#29C5F6] italic font-medium text-base">Where it’s all about Jesus</p>
      </div>

      <div className="w-full max-w-sm bg-white/15 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 shadow-2xl relative">
        <div className="text-center mb-6">
           <h2 className="text-lg text-slate-100 font-medium opacity-90">Welcome to ICC</h2>
           <p className="text-[#29C5F6] text-sm font-medium">Join our community of believers</p>
        </div>

        <div className="bg-white rounded-full p-1 flex mb-6 shadow-sm">
           <button type="button" onClick={() => { setIsLogin(true); setError(''); }} className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${isLogin ? 'bg-white text-slate-900 shadow-md ring-1 ring-black/5' : 'bg-transparent text-slate-500 hover:text-slate-700'}`}>Login</button>
           <button type="button" onClick={() => { setIsLogin(false); setError(''); }} className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${!isLogin ? 'bg-white text-slate-900 shadow-md ring-1 ring-black/5' : 'bg-transparent text-slate-500 hover:text-slate-700'}`}>Sign Up</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
           {!isLogin && (
             <div className="flex gap-3">
               <div className="flex-1 space-y-1">
                 <label className="text-xs text-slate-300 ml-3 font-medium">First Name</label>
                 <div className="relative"><UserIcon className="absolute left-4 top-3.5 text-slate-400" size={18}/><input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="John" required={!isLogin} className="w-full bg-white text-slate-900 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"/></div>
               </div>
               <div className="flex-1 space-y-1">
                 <label className="text-xs text-slate-300 ml-3 font-medium">Last Name</label>
                 <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Doe" required={!isLogin} className="w-full bg-white text-slate-900 rounded-2xl py-3 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"/>
               </div>
             </div>
           )}

           <div className="space-y-1">
             <label className="text-xs text-slate-300 ml-3 font-medium">Email</label>
             <div className="relative"><Mail className="absolute left-4 top-3.5 text-slate-400" size={18}/><input name="email" type="email" placeholder="your@email.com" value={formData.email} onChange={handleChange} required className="w-full bg-white text-slate-900 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"/></div>
           </div>

           <div className="space-y-1">
             <label className="text-xs text-slate-300 ml-3 font-medium">Password</label>
             <div className="relative"><Lock className="absolute left-4 top-3.5 text-slate-400" size={18}/><input name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={formData.password} onChange={handleChange} required className="w-full bg-white text-slate-900 rounded-2xl py-3 pl-12 pr-10 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"/><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-slate-400">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div>
           </div>

           {!isLogin && (
             <>
               <div className="space-y-1"><label className="text-xs text-slate-300 ml-3 font-medium">Date of Birth</label><div className="relative"><Calendar className="absolute left-4 top-3.5 text-slate-400" size={18}/><input name="dob" type="date" value={formData.dob} onChange={handleChange} required={!isLogin} className="w-full bg-white text-slate-900 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"/></div></div>
               <div className="space-y-1"><label className="text-xs text-slate-300 ml-3 font-medium">Phone Number</label><div className="relative"><Phone className="absolute left-4 top-3.5 text-slate-400" size={18}/><input name="phone" type="tel" placeholder="+27 123 456 789" value={formData.phone} onChange={handleChange} required={!isLogin} className="w-full bg-white text-slate-900 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"/></div></div>
               <div className="space-y-1"><label className="text-xs text-slate-300 ml-3 font-medium">Gender</label><div className="relative"><select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-white text-slate-900 rounded-2xl py-3 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 shadow-sm appearance-none"><option>Female</option><option>Male</option></select><ChevronDown className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" size={18}/></div></div>
             </>
           )}

           {isLogin && (<div className="flex items-center justify-between px-2 pt-1"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/><span className="text-xs text-slate-200 font-medium">Remember me</span></label><button type="button" className="text-xs text-[#29C5F6] font-bold hover:underline">Forgot Password?</button></div>)}

           {error && <p className="text-red-300 bg-red-900/50 border border-red-500/30 p-2 rounded-xl text-xs text-center font-medium">{error}</p>}

           <button disabled={isLoading} className="w-full bg-[#112a4a] hover:bg-[#1a3b63] text-white font-bold py-4 rounded-2xl shadow-lg transition transform active:scale-95 mt-4 disabled:opacity-50">{isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}</button>
        </form>
      </div>
    </div>
  );
};
