import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Shield, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
  initialStep?: 'login' | '2fa' | 'forgot-password' | 'forgot-2fa';
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, initialStep = 'login' }) => {
  const [step, setStep] = useState<'login' | '2fa' | 'forgot-password' | 'forgot-2fa'>(initialStep);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    twoFactorCode: '',
    resetEmail: '',
    resetCode: ''
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
    setStep('forgot-password');
    setErrors({});
    setFormData(prev => ({ ...prev, resetEmail: prev.email }));
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.resetEmail) {
      setErrors({ resetEmail: 'Email is required' });
      return;
    }
    
    if (!validateEmail(formData.resetEmail)) {
      setErrors({ resetEmail: 'Please enter a valid email address' });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call to send reset code
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Password reset code sent to:', formData.resetEmail);
      
      // Move to 2FA verification step
      setStep('forgot-2fa');
      setErrors({});
      
    } catch (error) {
      setErrors({ resetEmail: 'Failed to send reset code. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetCodeVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.resetCode) {
      setErrors({ resetCode: '2FA code is required' });
      return;
    }
    
    if (formData.resetCode.length !== 6) {
      setErrors({ resetCode: '2FA code must be 6 digits' });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate 2FA verification for password reset
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Reset code verified:', formData.resetCode);
      
      // In a real app, you would redirect to a new password form
      // For now, we'll show success and return to login
      alert('Password reset successful! You can now login with your new password.');
      setStep('login');
      setFormData({
        email: '',
        password: '',
        twoFactorCode: '',
        resetEmail: '',
        resetCode: ''
      });
      setErrors({});
      
    } catch (error) {
      setErrors({ resetCode: 'Invalid reset code. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const resend2FACode = () => {
    console.log('Resending 2FA code...');
    // TODO: Implement resend 2FA code
    alert('2FA code sent to your registered device');
  };

  const resendResetCode = () => {
    console.log('Resending password reset code...');
    // TODO: Implement resend reset code
    alert('Password reset code sent to your email');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-12">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#28c489' }}>
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
                      className={`w-full pl-10 pr-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors duration-200 ${
                        errors.email ? 'border-red-500' : 'border-slate-700'
                      }`}
                      style={{ 
                        focusBorderColor: '#28c489',
                        '--tw-ring-color': '#28c489'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#28c489'}
                      onBlur={(e) => e.target.style.borderColor = errors.email ? '#ef4444' : '#475569'}
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
                      className="text-sm transition-colors duration-200"
                      style={{ color: '#28c489' }}
                      onMouseEnter={(e) => e.target.style.color = '#22ae79'}
                      onMouseLeave={(e) => e.target.style.color = '#28c489'}
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
                      className={`w-full pl-10 pr-12 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors duration-200 ${
                        errors.password ? 'border-red-500' : 'border-slate-700'
                      }`}
                      style={{ 
                        focusBorderColor: '#28c489',
                        '--tw-ring-color': '#28c489'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#28c489'}
                      onBlur={(e) => e.target.style.borderColor = errors.password ? '#ef4444' : '#475569'}
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
                      : 'text-white'
                  }`}
                  style={{ 
                    backgroundColor: isLoading ? '#475569' : '#28c489',
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) e.target.style.backgroundColor = '#22ae79';
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) e.target.style.backgroundColor = '#28c489';
                  }}
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
          ) : step === '2fa' ? (
            <>
              {/* 2FA Verification */}
              <div className="mb-8">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgb(32 40 58)' }}>
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
                    className={`w-full px-4 py-4 bg-slate-800 border rounded-lg text-white text-center text-2xl font-mono tracking-widest placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors duration-200 ${
                      errors.twoFactorCode ? 'border-red-500' : 'border-slate-700'
                    }`}
                    style={{ 
                      focusBorderColor: '#28c489',
                      '--tw-ring-color': '#28c489'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#28c489'}
                    onBlur={(e) => e.target.style.borderColor = errors.twoFactorCode ? '#ef4444' : '#475569'}
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
                      : 'text-white'
                  }`}
                  style={{ 
                    backgroundColor: (isLoading || formData.twoFactorCode.length !== 6) ? '#475569' : '#28c489',
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading && formData.twoFactorCode.length === 6) e.target.style.backgroundColor = '#22ae79';
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading && formData.twoFactorCode.length === 6) e.target.style.backgroundColor = '#28c489';
                  }}
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
                    className="text-sm transition-colors duration-200"
                    style={{ color: '#28c489' }}
                    onMouseEnter={(e) => e.target.style.color = '#22ae79'}
                    onMouseLeave={(e) => e.target.style.color = '#28c489'}
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
          ) : step === 'forgot-password' ? (
            <>
              {/* Forgot Password */}
              <div className="mb-8">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgb(32 40 58)' }}>
                  <Mail size={32} className="text-white" />
                </div>
                <h1 className="text-white text-3xl font-bold mb-2 text-center">Reset Password</h1>
                <p className="text-slate-400 text-center">Enter your email address and we'll send you a 2FA code to reset your password</p>
              </div>

              <form onSubmit={handleForgotPasswordSubmit} className="space-y-6">
                {errors.resetEmail && (
                  <div className="p-3 bg-red-600/20 border border-red-600/30 rounded-lg text-red-400 text-sm text-center">
                    {errors.resetEmail}
                  </div>
                )}

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Email Address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={formData.resetEmail}
                      onChange={(e) => handleInputChange('resetEmail', e.target.value)}
                      placeholder="Enter your email address"
                      className={`w-full pl-10 pr-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors duration-200 ${
                        errors.resetEmail ? 'border-red-500' : 'border-slate-700'
                      }`}
                      style={{ 
                        focusBorderColor: '#28c489',
                        '--tw-ring-color': '#28c489'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#28c489'}
                      onBlur={(e) => e.target.style.borderColor = errors.resetEmail ? '#ef4444' : '#475569'}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg font-medium transition-colors duration-200 ${
                    isLoading
                      ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                      : 'text-white'
                  }`}
                  style={{ 
                    backgroundColor: isLoading ? '#475569' : '#28c489',
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) e.target.style.backgroundColor = '#22ae79';
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) e.target.style.backgroundColor = '#28c489';
                  }}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Send Reset Code</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

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
          ) : (
            <>
              {/* Forgot Password 2FA Verification */}
              <div className="mb-8">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgb(32 40 58)' }}>
                  <Shield size={32} className="text-white" />
                </div>
                <h1 className="text-white text-3xl font-bold mb-2 text-center">Verify Reset Code</h1>
                <p className="text-slate-400 text-center">Enter the 6-digit code sent to {formData.resetEmail}</p>
              </div>

              <form onSubmit={handleResetCodeVerification} className="space-y-6">
                {errors.resetCode && (
                  <div className="p-3 bg-red-600/20 border border-red-600/30 rounded-lg text-red-400 text-sm text-center">
                    {errors.resetCode}
                  </div>
                )}

                <div>
                  <input
                    type="text"
                    value={formData.resetCode}
                    onChange={(e) => handleInputChange('resetCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className={`w-full px-4 py-4 bg-slate-800 border rounded-lg text-white text-center text-2xl font-mono tracking-widest placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors duration-200 ${
                      errors.resetCode ? 'border-red-500' : 'border-slate-700'
                    }`}
                    style={{ 
                      focusBorderColor: '#28c489',
                      '--tw-ring-color': '#28c489'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#28c489'}
                    onBlur={(e) => e.target.style.borderColor = errors.resetCode ? '#ef4444' : '#475569'}
                    maxLength={6}
                    autoComplete="one-time-code"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || formData.resetCode.length !== 6}
                  className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg font-medium transition-colors duration-200 ${
                    isLoading || formData.resetCode.length !== 6
                      ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                      : 'text-white'
                  }`}
                  style={{ 
                    backgroundColor: (isLoading || formData.resetCode.length !== 6) ? '#475569' : '#28c489',
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading && formData.resetCode.length === 6) e.target.style.backgroundColor = '#22ae79';
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading && formData.resetCode.length === 6) e.target.style.backgroundColor = '#28c489';
                  }}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={resendResetCode}
                    className="text-sm transition-colors duration-200"
                    style={{ color: '#28c489' }}
                    onMouseEnter={(e) => e.target.style.color = '#22ae79'}
                    onMouseLeave={(e) => e.target.style.color = '#28c489'}
                  >
                    Didn't receive a code? Resend
                  </button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep('forgot-password')}
                    className="text-slate-400 hover:text-slate-300 text-sm transition-colors duration-200"
                  >
                    ← Back to email entry
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Right Side - 3D Model and Stats */}
      <div className="flex-1 relative bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center overflow-hidden pl-16">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, #8b5cf6 0%, transparent 50%)`
          }}></div>
        </div>

        {/* Large "3D" Background Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-[20rem] font-black text-slate-700/20 select-none leading-none tracking-wider">
            3D
          </div>
        </div>
        {/* Stats */}
        <div className="absolute top-8 right-8 text-center">
          <div className="text-5xl font-bold mb-2" style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>400K+ users. 50M+ AI</div>
          <div className="text-slate-400 text-xl">generated graphics.</div>
        </div>

        {/* 3D Model Container with spacing */}
        <div className="relative flex-1 flex items-center justify-center pr-8 mt-5">
          {/* 3D Dental Tooth Model */}
          <div className="relative w-80 h-full max-h-[800px] ml-8">
            {/* 3D Tooth with CSS Transform */}
            <div className="relative w-full h-full" style={{ 
              perspective: '1000px',
              transformStyle: 'preserve-3d'
            }}>
              <div 
                className="absolute inset-0"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: 'rotateX(-10deg) rotateY(15deg)',
                  animation: 'float 6s ease-in-out infinite',
                  marginTop: '220px'
                }}
              >
                {/* Tooth Crown - Front */}
                <div 
                  className="absolute border border-slate-500"
                  style={{
                    width: '160px',
                    height: '280px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '60px 60px 20px 20px',
                    transform: 'translateZ(70px)',
                    left: '50%',
                    top: '30%',
                    marginLeft: '-80px',
                    marginTop: '-140px',
                    boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.1)'
                  }}
                ></div>
                
                {/* Tooth Crown - Back */}
                <div 
                  className="absolute border border-slate-500"
                  style={{
                    width: '160px',
                    height: '280px',
                    backgroundColor: '#e2e8f0',
                    borderRadius: '60px 60px 20px 20px',
                    transform: 'translateZ(-70px) rotateY(180deg)',
                    left: '50%',
                    top: '30%',
                    marginLeft: '-80px',
                    marginTop: '-140px',
                    boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.1)'
                  }}
                ></div>
                
                {/* Tooth Crown - Right Side */}
                <div 
                  className="absolute border border-slate-500"
                  style={{
                    width: '160px',
                    height: '280px',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '60px 60px 20px 20px',
                    transform: 'rotateY(90deg) translateZ(70px)',
                    left: '50%',
                    top: '30%',
                    marginLeft: '-80px',
                    marginTop: '-140px',
                    boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.1)'
                  }}
                ></div>
                
                {/* Tooth Crown - Left Side */}
                <div 
                  className="absolute border border-slate-500"
                  style={{
                    width: '160px',
                    height: '280px',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '60px 60px 20px 20px',
                    transform: 'rotateY(-90deg) translateZ(70px)',
                    left: '50%',
                    top: '30%',
                    marginLeft: '-80px',
                    marginTop: '-140px',
                    boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.1)'
                  }}
                ></div>
                
                {/* Tooth Crown - Top (Chewing Surface) */}
                <div 
                  className="absolute border border-slate-400"
                  style={{
                    width: '160px',
                    height: '160px',
                    backgroundColor: '#ffffff',
                    borderRadius: '50%',
                    transform: 'rotateX(90deg) translateZ(140px)',
                    left: '50%',
                    top: '30%',
                    marginLeft: '-80px',
                    marginTop: '-80px',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  {/* Tooth Surface Details */}
                  <div className="absolute inset-4 border border-slate-300 rounded-full opacity-30"></div>
                  <div className="absolute inset-8 border border-slate-300 rounded-full opacity-20"></div>
                </div>
                
                {/* Tooth Root */}
                <div 
                  className="absolute border border-slate-500"
                  style={{
                    width: '120px',
                    height: '400px',
                    backgroundColor: '#fef3c7',
                    borderRadius: '0 0 40px 40px',
                    transform: 'rotateX(-90deg) translateZ(-200px)',
                    left: '50%',
                    top: '30%',
                    marginLeft: '-60px',
                    marginTop: '-200px',
                    boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.1)'
                  }}
                ></div>
              </div>
            </div>

            {/* Tooth Measurement Points */}
            <div className="absolute" style={{ top: '25%', left: '50%', transform: 'translateX(-50%)' }}>
              {/* 4 measurement points on tooth crown */}
              <div className="relative">
                {/* Front measurement points */}
                <div className="absolute w-2 h-2 bg-blue-400 rounded-full" style={{ left: '-100px', top: '0px' }}></div>
                <div className="absolute w-2 h-2 bg-blue-400 rounded-full" style={{ right: '-100px', top: '0px' }}></div>
                {/* Back measurement points */}
                <div className="absolute w-2 h-2 bg-blue-400 rounded-full" style={{ left: '-80px', top: '-20px' }}></div>
                <div className="absolute w-2 h-2 bg-blue-400 rounded-full" style={{ right: '-80px', top: '-20px' }}></div>
                
                {/* Measurement lines */}
                <svg className="absolute" style={{ left: '-115px', top: '-35px', width: '230px', height: '50px' }}>
                  {/* Front measurement line */}
                  <line x1="15" y1="35" x2="215" y2="35" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3,3" opacity="0.6"/>
                  {/* Back measurement line */}
                  <line x1="35" y1="15" x2="195" y2="15" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3,3" opacity="0.6"/>
                  {/* Left measurement line */}
                  <line x1="15" y1="25" x2="30" y2="10" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2,2" opacity="0.7"/>
                  {/* Right measurement line */}
                  <line x1="215" y1="35" x2="195" y2="15" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3,3" opacity="0.6"/>
                </svg>
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
            50% { transform: rotateX(-15deg) rotateY(25deg) translateY(-10px); }
          }
          
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default LoginPage;