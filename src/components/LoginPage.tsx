import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Shield, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [step, setStep] = useState<'login' | '2fa'>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    twoFactorCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Login attempt:', { email: formData.email });
      
      // Move to 2FA step
      setStep('2fa');
      setErrors({});
      
    } catch (error) {
      setErrors({ general: 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.twoFactorCode) {
      setErrors({ twoFactorCode: '2FA code is required' });
      return;
    }
    
    if (formData.twoFactorCode.length !== 6) {
      setErrors({ twoFactorCode: '2FA code must be 6 digits' });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate 2FA verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('2FA verification:', { code: formData.twoFactorCode });
      
      // Success - redirect to main app
      onLoginSuccess();
      
    } catch (error) {
      setErrors({ twoFactorCode: 'Invalid 2FA code. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'apple') => {
    console.log(`Logging in with ${provider}`);
    // TODO: Implement social login
    // For now, simulate success
    setTimeout(() => {
      onLoginSuccess();
    }, 1000);
  };

  const handleForgotPassword = () => {
    console.log('Redirecting to 2FA password reset...');
    // TODO: Implement redirect to 2FA password reset
    alert('Redirecting to 2FA password reset page...');
  };

  const resend2FACode = () => {
    console.log('Resending 2FA code...');
    // TODO: Implement resend 2FA code
    alert('2FA code sent to your registered device');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-12">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">3D</span>
            </div>
            <span className="text-white font-bold text-xl">DentalCAD Pro</span>
          </div>

          {step === 'login' ? (
            <>
              {/* Welcome Section */}
              <div className="mb-8">
                <h1 className="text-white text-3xl font-bold mb-2">Welcome!</h1>
                <p className="text-slate-400">Log in to DentalCAD Pro to continue to DentalCAD Pro.</p>
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => handleSocialLogin('google')}
                  className="w-full flex items-center justify-center space-x-3 p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-white transition-colors duration-200"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Log in with Google</span>
                </button>

                <button
                  onClick={() => handleSocialLogin('apple')}
                  className="w-full flex items-center justify-center space-x-3 p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-white transition-colors duration-200"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <span>Log in with Apple</span>
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-slate-700"></div>
                <span className="px-4 text-slate-500 text-sm">OR</span>
                <div className="flex-1 border-t border-slate-700"></div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                {errors.general && (
                  <div className="p-3 bg-red-600/20 border border-red-600/30 rounded-lg text-red-400 text-sm">
                    {errors.general}
                  </div>
                )}

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Your email address"
                      className={`w-full pl-10 pr-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                        errors.email ? 'border-red-500' : 'border-slate-700 focus:border-blue-500'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-slate-300 text-sm font-medium">Password</label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-blue-400 hover:text-blue-300 text-sm transition-colors duration-200"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Your password"
                      className={`w-full pl-10 pr-12 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                        errors.password ? 'border-red-500' : 'border-slate-700 focus:border-blue-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg font-medium transition-colors duration-200 ${
                    isLoading
                      ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Log in</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* 2FA Verification */}
              <div className="mb-8">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Shield size={32} className="text-white" />
                </div>
                <h1 className="text-white text-3xl font-bold mb-2 text-center">Two-Factor Authentication</h1>
                <p className="text-slate-400 text-center">Enter the 6-digit code from your authenticator app</p>
              </div>

              <form onSubmit={handleTwoFactorVerification} className="space-y-6">
                {errors.twoFactorCode && (
                  <div className="p-3 bg-red-600/20 border border-red-600/30 rounded-lg text-red-400 text-sm text-center">
                    {errors.twoFactorCode}
                  </div>
                )}

                <div>
                  <input
                    type="text"
                    value={formData.twoFactorCode}
                    onChange={(e) => handleInputChange('twoFactorCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className={`w-full px-4 py-4 bg-slate-800 border rounded-lg text-white text-center text-2xl font-mono tracking-widest placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                      errors.twoFactorCode ? 'border-red-500' : 'border-slate-700 focus:border-blue-500'
                    }`}
                    maxLength={6}
                    autoComplete="one-time-code"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || formData.twoFactorCode.length !== 6}
                  className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg font-medium transition-colors duration-200 ${
                    isLoading || formData.twoFactorCode.length !== 6
                      ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Verify & Continue</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={resend2FACode}
                    className="text-blue-400 hover:text-blue-300 text-sm transition-colors duration-200"
                  >
                    Didn't receive a code? Resend
                  </button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep('login')}
                    className="text-slate-400 hover:text-slate-300 text-sm transition-colors duration-200"
                  >
                    ← Back to login
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Right Side - 3D Model and Stats */}
            <div className="relative w-64 h-80">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, #8b5cf6 0%, transparent 50%)`
          }}></div>
        </div>

        {/* Large "3D" Background Text */}
                    transform: 'rotateX(-15deg) rotateY(25deg)',
          <div 
            className="text-[20rem] font-black text-slate-700/20 select-none leading-none tracking-wider"
            style={{
              background: 'linear-gradient(to bottom, rgba(51, 65, 85, 0.3) 0%, rgba(51, 65, 85, 0.05) 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text'
            }}
          >
                      marginLeft: '-40px',
                      marginTop: '-80px',
                      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(71, 85, 105, 0.5)'
          <div className="text-slate-400 text-xl">generated dental models.</div>
        </div>

        {/* 3D Model Container */}
        <div className="relative">
                    className="absolute bg-gradient-to-br from-slate-700 to-slate-800"
          <div className="relative w-64 h-64">
                      width: '80px',
                      height: '160px',
                      transform: 'translateZ(-40px) rotateY(180deg)',
              transformStyle: 'preserve-3d'
            }}>
                      marginLeft: '-40px',
                      marginTop: '-80px',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(51, 65, 85, 0.5)'
                  transformStyle: 'preserve-3d',
                  transform: 'rotateX(-15deg) rotateY(25deg)',
                  animation: 'float 6s ease-in-out infinite'
                }}
              >
                    className="absolute bg-gradient-to-br from-slate-500 to-slate-600"
                <div 
                      width: '80px',
                      height: '160px',
                      transform: 'rotateY(90deg) translateZ(40px)',
                    left: '50%',
                    top: '50%',
                      marginLeft: '-40px',
                      marginTop: '-80px',
                      boxShadow: '0 6px 12px rgba(0, 0, 0, 0.35)',
                      border: '1px solid rgba(100, 116, 139, 0.5)'
                
                {/* Back Face */}
                <div 
                  className="absolute w-32 h-32 bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600"
                  style={{
                    className="absolute bg-gradient-to-br from-slate-700 to-slate-800"
                    left: '50%',
                      width: '80px',
                      height: '160px',
                      transform: 'rotateY(-90deg) translateZ(40px)',
                  }}
                ></div>
                      marginLeft: '-40px',
                      marginTop: '-80px',
                      boxShadow: '0 6px 12px rgba(0, 0, 0, 0.35)',
                      border: '1px solid rgba(51, 65, 85, 0.5)'
                  className="absolute w-32 h-32 bg-gradient-to-br from-slate-650 to-slate-750 border border-slate-550"
                  style={{
                    transform: 'rotateY(90deg) translateZ(64px)',
                    left: '50%',
                    top: '50%',
                    className="absolute bg-gradient-to-br from-slate-400 to-slate-500"
                    marginTop: '-64px',
                      width: '80px',
                      height: '80px',
                      transform: 'rotateX(90deg) translateZ(80px)',
                
                {/* Left Face */}
                      marginLeft: '-40px',
                      marginTop: '-40px',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(148, 163, 184, 0.5)'
                    transform: 'rotateY(-90deg) translateZ(64px)',
                    left: '50%',
                    top: '50%',
                    marginLeft: '-64px',
                    marginTop: '-64px'
                    className="absolute bg-gradient-to-br from-slate-800 to-slate-900"
                ></div>
                      width: '80px',
                      height: '80px',
                      transform: 'rotateX(-90deg) translateZ(80px)',
                  className="absolute w-32 h-32 bg-gradient-to-br from-slate-500 to-slate-600 border border-slate-400"
                  style={{
                      marginLeft: '-40px',
                      marginTop: '-40px',
                      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.5)',
                      border: '1px solid rgba(30, 41, 59, 0.5)'
                    marginLeft: '-64px',
                    marginTop: '-64px'
                  }}
                ></div>
                
                {/* Bottom Face */}
              <div className="absolute top-16 left-20 w-2 h-2 bg-slate-400 rounded-full"></div>
              <div className="absolute top-16 right-20 w-2 h-2 bg-slate-400 rounded-full"></div>
              <div className="absolute bottom-16 left-20 w-2 h-2 bg-slate-400 rounded-full"></div>
              <div className="absolute bottom-16 right-20 w-2 h-2 bg-slate-400 rounded-full"></div>
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-400 rounded-full"></div>
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-400 rounded-full"></div>
                    marginLeft: '-64px',
              {/* Horizontal Orbital Circle with Arrow */}
                  }}
                ></div>
              </div>
                  className="border border-slate-600 rounded-full relative opacity-60"

                    width: '320px',
                    height: '320px'
            <div className="absolute bottom-12 left-12 w-2 h-2 bg-slate-400 rounded-full"></div>
            <div className="absolute bottom-12 right-12 w-2 h-2 bg-slate-400 rounded-full"></div>
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-400 rounded-full"></div>
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-400 rounded-full"></div>

            {/* Orbital Circle with Arrow */}
                      top: '-8px',
              <div 
                      transform: 'translate(-50%, 0)',
                      animation: 'orbitArrow 8s linear infinite'
                  animation: 'rotate 8s linear infinite'
                }}
              >
                {/* Arrow on the circle */}
                <div 
                  className="absolute w-0 h-0 -top-2 left-1/2 transform -translate-x-1/2"
                  style={{
                        borderBottom: '12px solid #8b5cf6',
                        transform: 'rotate(90deg)'
                    borderRight: '8px solid transparent',
                    borderBottom: '12px solid #8b5cf6'
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent"></div>

        {/* CSS Animations */}
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: rotateX(-15deg) rotateY(25deg) translateY(0px); }
            50% { transform: rotateX(-15deg) rotateY(25deg) translateY(-6px); }
          }
          
          @keyframes orbitArrow {
            0% { 
             transform: translate(-50%, 0) rotate(0deg) translateX(160px) rotate(-90deg);
            }
            100% { 
             transform: translate(-50%, 0) rotate(-360deg) translateX(160px) rotate(-90deg);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default LoginPage;