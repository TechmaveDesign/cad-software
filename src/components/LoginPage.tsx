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
      <div className="flex-1 relative bg-black flex flex-col items-center justify-center overflow-hidden pl-16">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
          
          {/* Geometric shapes */}
          <div className="absolute top-20 left-20 w-2 h-2 bg-blue-500 rounded-full opacity-60"></div>
          <div className="absolute top-40 right-32 w-3 h-3 bg-purple-500 rounded-full opacity-40"></div>
          <div className="absolute bottom-32 left-16 w-2 h-2 bg-green-500 rounded-full opacity-50"></div>
          <div className="absolute top-60 left-1/3 w-1 h-1 bg-white rounded-full opacity-30"></div>
          <div className="absolute bottom-40 right-20 w-1 h-1 bg-white rounded-full opacity-40"></div>
        </div>

        {/* Stats */}
        <div className="text-center mb-12 z-10">
          <div className="text-5xl font-bold mb-2" style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>10K+ dentists. 500K+ models</div>
          <div className="text-slate-400 text-xl">created with precision.</div>
          
          {/* Join Now Button */}
          <div className="mt-8">
            <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg">
              Join Now
            </button>
          </div>
        </div>

        {/* 3D Geometric Shape */}
        <div className="relative z-10">
          <div className="relative w-64 h-64" style={{ 
            perspective: '1000px',
            transformStyle: 'preserve-3d'
          }}>
            {/* Main Cube */}
            <div 
              className="absolute inset-0"
              style={{
                transformStyle: 'preserve-3d',
                transform: 'rotateX(-15deg) rotateY(25deg)',
                animation: 'float 6s ease-in-out infinite'
              }}
            >
              {/* Front Face */}
              <div 
                className="absolute border border-slate-600"
                style={{
                  width: '120px',
                  height: '120px',
                  backgroundColor: '#1e293b',
                  transform: 'translateZ(60px)',
                  left: '50%',
                  top: '50%',
                  marginLeft: '-60px',
                  marginTop: '-60px',
                  boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1)'
                }}
              ></div>
              
              {/* Back Face */}
              <div 
                className="absolute border border-slate-600"
                style={{
                  width: '120px',
                  height: '120px',
                  backgroundColor: '#0f172a',
                  transform: 'translateZ(-60px) rotateY(180deg)',
                  left: '50%',
                  top: '50%',
                  marginLeft: '-60px',
                  marginTop: '-60px'
                }}
              ></div>
              
              {/* Right Face */}
              <div 
                className="absolute border border-slate-600"
                style={{
                  width: '120px',
                  height: '120px',
                  backgroundColor: '#334155',
                  transform: 'rotateY(90deg) translateZ(60px)',
                  left: '50%',
                  top: '50%',
                  marginLeft: '-60px',
                  marginTop: '-60px'
                }}
              ></div>
              
              {/* Left Face */}
              <div 
                className="absolute border border-slate-600"
                style={{
                  width: '120px',
                  height: '120px',
                  backgroundColor: '#475569',
                  transform: 'rotateY(-90deg) translateZ(60px)',
                  left: '50%',
                  top: '50%',
                  marginLeft: '-60px',
                  marginTop: '-60px'
                }}
              ></div>
              
              {/* Top Face */}
              <div 
                className="absolute border border-slate-600"
                style={{
                  width: '120px',
                  height: '120px',
                  backgroundColor: '#64748b',
                  transform: 'rotateX(90deg) translateZ(60px)',
                  left: '50%',
                  top: '50%',
                  marginLeft: '-60px',
                  marginTop: '-60px'
                }}
              ></div>
              
              {/* Bottom Face */}
              <div 
                className="absolute border border-slate-600"
                style={{
                  width: '120px',
                  height: '120px',
                  backgroundColor: '#1e293b',
                  transform: 'rotateX(-90deg) translateZ(60px)',
                  left: '50%',
                  top: '50%',
                  marginLeft: '-60px',
                  marginTop: '-60px'
                }}
              ></div>
            </div>
            
            {/* Floating Points */}
            <div className="absolute w-2 h-2 bg-blue-500 rounded-full" style={{ left: '20px', top: '40px', animation: 'pulse 2s infinite' }}></div>
            <div className="absolute w-2 h-2 bg-purple-500 rounded-full" style={{ right: '30px', top: '60px', animation: 'pulse 3s infinite' }}></div>
            <div className="absolute w-2 h-2 bg-green-500 rounded-full" style={{ left: '40px', bottom: '50px', animation: 'pulse 2.5s infinite' }}></div>
            <div className="absolute w-2 h-2 bg-pink-500 rounded-full" style={{ right: '20px', bottom: '40px', animation: 'pulse 1.8s infinite' }}></div>
            
            {/* Orbital Ring */}
            <div 
              className="absolute border border-blue-500 rounded-full opacity-30"
              style={{
                width: '200px',
                height: '200px',
                left: '50%',
                top: '50%',
                marginLeft: '-100px',
                marginTop: '-100px',
                animation: 'rotate 20s linear infinite'
              }}
            ></div>
          </div>
        </div>

        {/* CSS Animations */}
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: rotateX(-15deg) rotateY(25deg) translateY(0px) scale(1); }
            50% { transform: rotateX(-15deg) rotateY(25deg) translateY(-10px) scale(1.05); }
          }
          
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default LoginPage;