import React, { useState } from 'react';
import { ArrowLeft, User, Mail, Phone, Save, Upload, Shield, ExternalLink, Check } from 'lucide-react';

interface ProfileSettingsProps {
  onBackToWorkspace: () => void;
  onForgotPassword?: () => void;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  loginMethod: 'email' | 'google' | 'microsoft';
  profileImage: string | null;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onBackToWorkspace, onForgotPassword }) => {
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Dr. John Smith',
    email: 'john.smith@dentalclinic.com',
    phone: '+1 (555) 123-4567',
    loginMethod: 'email',
    profileImage: null
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Name validation
    if (!profile.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (profile.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!profile.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(profile.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!profile.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(profile.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Clear success message when user makes changes
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Saving profile:', {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        loginMethod: profile.loginMethod
      });
      
      setSuccessMessage('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      console.error('Error saving profile:', error);
      setErrors({ name: 'Failed to save profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfile(prev => ({ ...prev, profileImage: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangePassword = () => {
    if (onForgotPassword) {
      onForgotPassword();
    } else {
      console.log('Redirecting to 2FA password reset...');
      alert('Redirecting to 2FA password reset page...');
    }
  };

  const getLoginMethodDisplay = (method: string) => {
    switch (method) {
      case 'google':
        return 'Google Account';
      case 'microsoft':
        return 'Microsoft Account';
      default:
        return 'Email & Password';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBackToWorkspace}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              <ArrowLeft size={16} />
              <span>Back to Workspace</span>
            </button>
          </div>
          
          {successMessage && (
            <div className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
              <Check size={16} />
              <span>{successMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-blue-600 rounded-2xl flex items-center justify-center overflow-hidden">
                  {profile.profileImage ? (
                    <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={40} className="text-white" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Check size={16} className="text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{profile.name}</h1>
                <p className="text-slate-400 text-lg">{profile.email}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Information */}
            <div className="lg:col-span-2 space-y-8">
              {/* User Profile Section */}
              <div>
                <h2 className="text-white text-xl font-semibold mb-2">User profile</h2>
                <p className="text-slate-400 text-sm mb-6">Update your profile information here.</p>
                
                <div className="space-y-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Full Name</label>
                    <p className="text-slate-400 text-sm mb-3">This will be displayed on your profile.</p>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                        errors.name ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p className="text-red-400 text-sm mt-2">{errors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Email Address</label>
                    <p className="text-slate-400 text-sm mb-3">Your primary email address for notifications.</p>
                    <div className="flex">
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`flex-1 px-4 py-3 bg-slate-800 border rounded-l-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                          errors.email ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'
                        }`}
                        placeholder="Enter your email address"
                      />
                      <div className="flex items-center px-4 bg-slate-700 border border-l-0 border-slate-600 rounded-r-lg">
                        <Check size={16} className="text-green-400" />
                      </div>
                    </div>
                    {errors.email && (
                      <p className="text-red-400 text-sm mt-2">{errors.email}</p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Phone Number</label>
                    <p className="text-slate-400 text-sm mb-3">Your contact phone number.</p>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                        errors.phone ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'
                      }`}
                      placeholder="Enter your phone number"
                    />
                    {errors.phone && (
                      <p className="text-red-400 text-sm mt-2">{errors.phone}</p>
                    )}
                  </div>

                  {/* Login Method */}
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Login Method</label>
                    <p className="text-slate-400 text-sm mb-3">How you sign in to your account.</p>
                    <div className="flex">
                      <div className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-l-lg text-white">
                        {getLoginMethodDisplay(profile.loginMethod)}
                      </div>
                      <div className="flex items-center px-4 bg-slate-700 border border-l-0 border-slate-600 rounded-r-lg">
                        <Check size={16} className="text-green-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Section */}
              <div>
                <h2 className="text-white text-xl font-semibold mb-2">Security</h2>
                <p className="text-slate-400 text-sm mb-6">Manage your account security settings.</p>
                
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Shield size={20} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">Change Password</h3>
                        <p className="text-slate-400 text-sm">Use 2FA to securely reset your password</p>
                      </div>
                    </div>
                    <button
                      onClick={handleChangePassword}
                      className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors duration-200"
                    >
                      <span>Reset Password</span>
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Profile Image */}
            <div className="space-y-8">
              {/* Profile Image Upload */}
              <div>
                <h2 className="text-white text-xl font-semibold mb-2">Profile Image</h2>
                <p className="text-slate-400 text-sm mb-6">Update your profile photo and choose where you want it to display.</p>
                
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center overflow-hidden">
                      {profile.profileImage ? (
                        <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User size={24} className="text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        id="profile-image"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="profile-image"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-slate-500 transition-colors duration-200"
                      >
                        <Upload size={24} className="text-slate-400 mb-2" />
                        <p className="text-slate-400 text-sm text-center">
                          <span className="font-medium text-blue-400">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-slate-500 text-xs mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="sticky top-6">
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                    isLoading
                      ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <Save size={16} />
                  <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;