import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, UserCheck, Lock, Eye, EyeOff, KeyRound, Mail, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import Logo from '../../components/layout/Logo';
import API_URL from '../../api';

interface LoginProps {
  setView: (v: string) => void;
}

type AuthMode = 'LOGIN' | 'FORGOT_PASSWORD' | 'RESET_PASSWORD' | 'VERIFY_PENDING' | 'OTP_CHALLENGE';

export default function Login({ setView }: LoginProps) {
  const { login, googleLogin } = useAuth();
  
  // Navigation internal mode
  const [mode, setMode] = useState<AuthMode>('LOGIN');

  // Input fields state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Password reset token
  const [resetToken, setResetToken] = useState('');

  // 2FA Admin Code (Secure generated single-use OTP)
  const [otpCode, setOtpCode] = useState('');
  const [authTempUser, setAuthTempUser] = useState<any>(null);

  // Customer OTP login mode states
  const [isOtpLogin, setIsOtpLogin] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Notifications signals
  const [errorVal, setErrorVal] = useState('');
  const [infoVal, setInfoVal] = useState('');
  const [loading, setLoading] = useState(false);

  // Monitor resend cooldown ticker
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Monitor email verification token from query params if clicking from email box
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      if (token.startsWith('v-token-') || token.startsWith('force-res-')) {
        handleEmailVerification(token);
      } else if (token.startsWith('reset-p-')) {
        setResetToken(token);
        setMode('RESET_PASSWORD');
        setInfoVal('Secure parameters detected. Specify your fresh credentials below to complete restoration.');
      }
    }
  }, []);

  const handleEmailVerification = async (tok: string) => {
    setLoading(true);
    setMode('VERIFY_PENDING');
    setErrorVal('');
    setInfoVal('');
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-email?token=${encodeURIComponent(tok)}`);
      const data = await res.json();
      if (res.ok) {
        setInfoVal('🙏 Account verified successfully! You can sign in using your credentials now.');
      } else {
        setErrorVal(data.message || 'Verification failed. This signature is invalid or expired.');
      }
    } catch (err: any) {
      setErrorVal('An error occurred while confirming validation signature.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorVal('');
    setInfoVal('');
    setLoading(true);

    try {
      // 1. Initiate normal login exchange
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Access credentials invalid');
      }

      if (data.requiresOtp) {
        setAuthTempUser(data); // save temporarily
        setMode('OTP_CHALLENGE');
        setInfoVal(data.message || '🛡️ Multi-Factor OTP Verification required for administrator accounts. A secure single-use passcode has been sent to your email.');
        setLoading(false);
      } else {
        // Direct customer logon
        localStorage.setItem('gdh_user', JSON.stringify(data.user));
        localStorage.setItem('gdh_token', data.accessToken);
        localStorage.setItem('gdh_refresh_token', data.refreshToken);
        
        // Refresh browser window / contexts
        window.location.reload();
      }
    } catch (err: any) {
      setErrorVal(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorVal('');
    setInfoVal('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/google`, { credentials: 'include' });
      const data = await res.json();
      
      if (!res.ok || !data.url) {
        throw new Error(data.message || 'Unable to retrieve Google connection link');
      }

      const width = 500;
      const height = 650;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const popupWindow = window.open(
        data.url,
        'gdh_google_auth_popup',
        `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`
      );

      if (!popupWindow) {
        throw new Error('Pop-up window was blocked to secure security bounds. Please allow popup windows for this server domain.');
      }

      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
          const { accessToken, refreshToken, user: authUser } = event.data;
          
          googleLogin(accessToken, refreshToken, authUser);
          setInfoVal(`🙏 Welcome, ${authUser.name}! Successfully signed in via Google.`);
          
          const isAdminRole = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'VIEWER'].includes(authUser.role);
          if (isAdminRole) {
            setAuthTempUser({ accessToken, refreshToken, user: authUser });
            setMode('OTP_CHALLENGE');
            setInfoVal('🛡️ Multi-Factor OTP Verification required for administrator accounts. A secure single-use passcode has been sent to your registered email.');
          } else {
            setTimeout(() => {
              setView('home');
              setTimeout(() => {
                window.location.reload();
              }, 100);
            }, 1200);
          }

          window.removeEventListener('message', handleMessage);
          setLoading(false);
        } else if (event.data?.type === 'OAUTH_AUTH_FAILURE') {
          setErrorVal(event.data.message || 'Google authentication was declined or cancelled.');
          window.removeEventListener('message', handleMessage);
          setLoading(false);
        }
      };

      window.addEventListener('message', handleMessage);

      const pollTimer = setInterval(() => {
        if (popupWindow.closed) {
          clearInterval(pollTimer);
          setLoading((prev) => {
            if (prev) {
              window.removeEventListener('message', handleMessage);
              return false;
            }
            return false;
          });
        }
      }, 1000);

    } catch (err: any) {
      setErrorVal(err.message || 'Failed to start Google connection.');
      setLoading(false);
    }
  };

  // 2FA Admin OTP Submit
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorVal('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/admin-otp-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otpCode }),
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Security passcode verification failed.');
      }

      // Successful verification
      localStorage.setItem('gdh_user', JSON.stringify(data.user));
      localStorage.setItem('gdh_token', data.accessToken);
      localStorage.setItem('gdh_refresh_token', data.refreshToken);
      
      // Navigate to admin
      setView('admin');
      window.location.reload();
    } catch (err: any) {
      setErrorVal(err.message || 'Passcode rejected.');
    } finally {
      setLoading(false);
    }
  };

  // Dispatch Forgot Password link request
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorVal('');
    setInfoVal('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setInfoVal(data.message || 'If this account is registered, a password reset link has been dispatched.');
    } catch (err: any) {
      setErrorVal('An error occurred during link generation request.');
    } finally {
      setLoading(false);
    }
  };

  // Submit password reset values
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorVal('');
    setInfoVal('');
    setLoading(true);

    if (password !== confirmPassword) {
      setErrorVal('Mismatch values: Passwords must be identical.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword: password, confirmPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to complete credentials reset.');
      }

      setInfoVal('🎉 Password updated successfully! Please sign in with your fresh password.');
      setPassword('');
      setConfirmPassword('');
      setMode('LOGIN');
    } catch (err: any) {
      setErrorVal(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  // Send OTP for Customer OTP logons
  const handleSendOtp = async () => {
    if (!email) {
      setErrorVal('Please enter a valid email address first.');
      return;
    }
    setErrorVal('');
    setInfoVal('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to dispatch OTP.');
      }
      setOtpSent(true);
      setCooldown(60);
      setInfoVal('🙏 Secure 6-digit passcode has been sent to your email. Please check your spam folder.');
    } catch (err: any) {
      setErrorVal(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Submit and verify Customer OTP logins
  const handleCustomerOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otpCode) {
      setErrorVal('Email and OTP code are required.');
      return;
    }
    setErrorVal('');
    setInfoVal('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'OTP verification failed.');
      }

      // Successful OTP Login
      localStorage.setItem('gdh_user', JSON.stringify(data.user));
      localStorage.setItem('gdh_token', data.accessToken);
      localStorage.setItem('gdh_refresh_token', data.refreshToken);
      
      setInfoVal(`🙏 Welcome, ${data.user.name}! Successful login with OTP.`);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setErrorVal(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F5EFE6] text-[#2C1810] font-sans min-h-screen py-16 flex items-center justify-center select-none">
      <div className="max-w-md w-full mx-4 bg-white border border-[#D4B896]/60 p-8 rounded-2xl shadow-sm flex flex-col items-center">
        
        <Logo size={72} className="mb-4" />
        
        {mode === 'LOGIN' && (
          <>
            <h2 className="font-serif text-2xl font-bold text-[#6B2D0E] mb-1">Sign In To Godhara</h2>
            <p className="text-xs text-stone-400 font-medium uppercase tracking-wider mb-8">పోధార - Vedic Cattle Care</p>
          </>
        )}

        {mode === 'OTP_CHALLENGE' && (
          <>
            <h2 className="font-serif text-2xl font-bold text-amber-700 mb-1 flex items-center gap-1.5 animate-pulse">
              <KeyRound size={22} /> Two-Factor Access
            </h2>
            <p className="text-xs text-stone-400 font-medium uppercase tracking-wider mb-6">Security Clearance Required</p>
          </>
        )}

        {mode === 'FORGOT_PASSWORD' && (
          <>
            <h2 className="font-serif text-2xl font-bold text-[#6B2D0E] mb-1">Forgot Credentials</h2>
            <p className="text-xs text-stone-400 font-medium uppercase tracking-wider mb-6">Restoration Circle</p>
          </>
        )}

        {mode === 'RESET_PASSWORD' && (
          <>
            <h2 className="font-serif text-2xl font-bold text-emerald-800 mb-1">New Access Credentials</h2>
            <p className="text-xs text-stone-400 font-medium uppercase tracking-wider mb-6">Complete Protection Update</p>
          </>
        )}

        {mode === 'VERIFY_PENDING' && (
          <>
            <h2 className="font-serif text-2xl font-bold text-blue-800 mb-1">Confirming Signature</h2>
            <p className="text-xs text-stone-400 font-medium uppercase tracking-wider mb-6">Securing Account verification</p>
          </>
        )}

        {/* NOTIFICATIONS BOXES */}
        {errorVal && (
          <div className="w-full bg-red-50 text-red-700 text-xs font-semibold p-3.5 rounded-lg border border-red-100 flex items-start gap-2 leading-relaxed mb-5">
            <AlertCircle size={16} className="shrink-0 text-red-500 mt-0.5" />
            <div>{errorVal}</div>
          </div>
        )}

        {infoVal && (
          <div className="w-full bg-amber-50 text-[#6B2D0E] text-xs font-semibold p-3.5 rounded-lg border border-amber-100 flex items-start gap-2 leading-normal mb-5">
            <CheckCircle2 size={16} className="shrink-0 text-[#E8820C] mt-0.5" />
            <div>{infoVal}</div>
          </div>
        )}

        {/* 1. STANDARD LOGIN FLOW */}
        {mode === 'LOGIN' && (
          <>
            {/* Credentials hints for quick exploration testing */}
            <div className="w-full bg-[#F5EFE6]/60 rounded-xl border border-[#D4B896]/30 p-3.5 text-[10px] text-stone-500 font-sans leading-normal mb-6 flex flex-col gap-1">
              <p className="font-bold text-[#6B2D0E] flex items-center gap-1">
                <ShieldCheck size={12} className="text-[#E8820C]" />
                Demo Workspace Accounts:
              </p>
              <p><strong>Admin Session (OTP sent via Email):</strong> kalyanvasantham906@gmail.com | <strong>Pass:</strong> admin123</p>
              <p><strong>Customer Session (OTP sent via Email):</strong> seeker@vedic.com </p>
            </div>

            {/* Access Mode Selector Toggle Tabs */}
            <div className="flex w-full bg-stone-100 p-1 rounded-full mb-6 max-w-sm">
              <button
                type="button"
                onClick={() => {
                  setIsOtpLogin(false);
                  setErrorVal('');
                  setInfoVal('');
                }}
                className={`flex-1 text-center py-2 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer ${!isOtpLogin ? 'bg-[#6B2D0E] text-white shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              >
                Password Access
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOtpLogin(true);
                  setErrorVal('');
                  setInfoVal('');
                }}
                className={`flex-1 text-center py-2 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer ${isOtpLogin ? 'bg-[#6B2D0E] text-white shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              >
                Email OTP Access
              </button>
            </div>

            {!isOtpLogin ? (
              <form onSubmit={handleLoginSubmit} className="w-full flex flex-col gap-4 font-sans">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-stone-500">Contact Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="e.g. kalyanvasantham906@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-stone-50 border border-[#D4B896]/70 text-[#2C1810] text-xs font-medium rounded-lg p-2.5 pl-9 focus:outline-none focus:ring-1 focus:ring-[#E8820C]"
                    />
                    <UserCheck size={14} className="absolute left-3 top-3 text-stone-400" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase text-stone-500">Authentication Password</label>
                    <button
                      type="button"
                      onClick={() => setMode('FORGOT_PASSWORD')}
                      className="text-[9px] font-bold text-[#6B2D0E] hover:text-[#E8820C] underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-stone-50 border border-[#D4B896]/70 text-[#2C1810] text-xs font-medium rounded-lg p-2.5 pl-9 pr-9 focus:outline-none focus:ring-1 focus:ring-[#E8820C]"
                    />
                    <Lock size={14} className="absolute left-3 top-3.5 text-stone-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-stone-400 hover:text-[#6B2D0E] cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Option */}
                <div className="flex items-center justify-between mt-1">
                  <label className="flex items-center gap-1.5 text-[11px] text-stone-500 font-medium select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-[#D4B896] text-[#6B2D0E] focus:ring-[#E8820C] h-3.5 w-3.5 cursor-pointer"
                    />
                    Remember access coordinates (30 Days)
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#6B2D0E] hover:bg-[#E8820C] text-white font-bold py-3 rounded-full shadow hover:shadow-md transition-all mt-3 select-none cursor-pointer text-xs"
                >
                  {loading ? 'Authenticating Sacred Sessions...' : 'Sign In Now'}
                </button>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#D4B896]/30"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-white px-3 text-stone-400 font-bold">Or Connect Via</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-white border border-[#D4B896]/60 hover:bg-[#F5EFE6] text-[#2C1810] font-bold py-2.5 px-4 rounded-full transition-all text-xs cursor-pointer"
                >
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>
              </form>
            ) : (
              <form onSubmit={handleCustomerOtpSubmit} className="w-full flex flex-col gap-4 font-sans">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-stone-500">Contact Email Address</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="email"
                        required
                        placeholder="e.g. kalyanvasantham906@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-stone-50 border border-[#D4B896]/70 text-[#2C1810] text-xs font-medium rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#E8820C]"
                      />
                      <UserCheck size={14} className="absolute left-3 top-3 text-stone-400" />
                    </div>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading || cooldown > 0 || !email}
                      className="bg-[#6B2D0E] hover:bg-[#E8820C] text-white font-bold text-xs px-4 py-2.5 rounded-lg disabled:opacity-50 select-none cursor-pointer duration-100 shrink-0"
                    >
                      {cooldown > 0 ? `${cooldown}s` : otpSent ? 'Resend' : 'Send'}
                    </button>
                  </div>
                </div>

                {otpSent && (
                  <div className="flex flex-col gap-1.5 animate-fadeIn">
                    <label className="text-[10px] font-bold uppercase text-stone-500">6-Digit OTP Verification Code</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="Enter 6-digit Code"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="w-full bg-stone-50 border border-[#D4B896]/70 text-[#2C1810] text-xs font-medium rounded-lg p-2.5 pl-9 tracking-widest focus:outline-none"
                      />
                      <KeyRound size={14} className="absolute left-3 top-3.5 text-stone-400" />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !otpSent || otpCode.length < 6}
                  className="w-full bg-[#6B2D0E] hover:bg-[#E8820C] text-white font-bold py-3 rounded-full shadow hover:shadow-md transition-all mt-3 select-none cursor-pointer text-xs disabled:opacity-50"
                >
                  {loading ? 'Authenticating passcode...' : 'Verify & Log In'}
                </button>
              </form>
            )}
          </>
        )}

        {/* 2. OTP CHALLENGE FLOW */}
        {mode === 'OTP_CHALLENGE' && (
          <form onSubmit={handleOtpSubmit} className="w-full flex flex-col gap-4 font-sans">
            <div className="text-center text-xs font-medium text-stone-500 mb-2 leading-relaxed">
              We have initialized security checks. Please input the 6-digit administrative authenticator clearance code to complete access clearance.
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-stone-500 text-center">6-Digit Passcode</label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="6-digit code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full text-center bg-stone-50 border border-amber-300 text-[#2C1810] text-lg font-bold tracking-widest rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length < 6}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-full shadow hover:shadow-md transition-all mt-2 select-none cursor-pointer text-xs"
            >
              {loading ? 'Authorizing Administrative Credentials...' : 'Confirm Authentication'}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('LOGIN');
                setOtpCode('');
                setAuthTempUser(null);
                setErrorVal('');
              }}
              className="text-stone-400 hover:text-stone-600 text-[10px] mt-2 font-bold uppercase underline"
            >
              Back To Login Form
            </button>
          </form>
        )}

        {/* 3. FORGOT PASSWORD FLOW */}
        {mode === 'FORGOT_PASSWORD' && (
          <form onSubmit={handleForgotSubmit} className="w-full flex flex-col gap-4 font-sans">
            <div className="text-xs text-stone-500 leading-normal mb-2">
              Specify your registered email address. If validated, we shall generate and dispatch a secure uuid parameters recovery token code.
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-stone-500">Contact Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="e.g. kalyanvasantham906@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-stone-50 border border-[#D4B896]/70 text-[#2C1810] text-xs font-medium rounded-lg p-2.5 pl-9 focus:outline-none focus:ring-1 focus:ring-[#E8820C]"
                />
                <Mail size={14} className="absolute left-3 top-3 text-stone-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6B2D0E] hover:bg-[#E8820C] text-white font-bold py-3 rounded-full shadow hover:shadow-md transition-all mt-2 select-none cursor-pointer text-xs"
            >
              {loading ? 'Dispatching Secure Reset Link...' : 'Dispatch Reset Directions'}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('LOGIN');
                setErrorVal('');
                setInfoVal('');
              }}
              className="text-[#6B2D0E] hover:text-[#E8820C] text-[10px] mt-2 font-bold uppercase underline"
            >
              Back to Sign In
            </button>
          </form>
        )}

        {/* 4. PASSWORD RESET SUBMIT FLOW */}
        {mode === 'RESET_PASSWORD' && (
          <form onSubmit={handleResetSubmit} className="w-full flex flex-col gap-4 font-sans">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-stone-500">New Password Code</label>
              <input
                type="password"
                required
                placeholder="At least 8 characters with Capital, Digit & Symbol"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-stone-50 border border-[#D4B896]/70 text-[#2C1810] text-xs font-medium rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#E8820C]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-stone-500">Confirm New Password Code</label>
              <input
                type="password"
                required
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-stone-50 border border-[#D4B896]/70 text-[#2C1810] text-xs font-medium rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#E8820C]"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !password || password !== confirmPassword}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-full shadow hover:shadow-md transition-all mt-2 select-none cursor-pointer text-xs"
            >
              {loading ? 'Rewriting Secure Credentials...' : 'Save Fresh Password'}
            </button>
          </form>
        )}

        {/* 5. VERIFYING EMAIL TRANSITION LOADER */}
        {mode === 'VERIFY_PENDING' && (
          <div className="w-full flex flex-col items-center justify-center p-6 text-center gap-4">
            {loading && <RefreshCw className="text-[#E8820C] animate-spin h-10 w-10" />}
            <div className="text-xs text-stone-500 font-medium">
              We are verifying security tokens with central blockchain parameters. Please wait...
            </div>
            <button
              type="button"
              onClick={() => {
                setMode('LOGIN');
                setErrorVal('');
                setInfoVal('');
              }}
              className="text-[#6B2D0E] hover:text-[#E8820C] text-[10px] mt-4 font-bold uppercase underline"
            >
              Navigate to Sign In
            </button>
          </div>
        )}

        {mode === 'LOGIN' && (
          <p className="text-xs text-stone-400 mt-8 font-sans font-medium">
            New to our Gaushala circles?{' '}
            <button
              onClick={() => setView('register')}
              className="text-[#6B2D0E] hover:text-[#E8820C] font-bold underline cursor-pointer"
            >
              Register Account
            </button>
          </p>
        )}

      </div>
    </div>
  );
}

