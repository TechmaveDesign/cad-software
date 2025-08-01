import React, { useState } from 'react';
import { ArrowLeft, User, Mail, Phone, Lock, Save, Eye, EyeOff } from 'lucide-react';

interface ProfileSettingsProps {
  onBackToWorkspace: () => void;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onBackToWorkspace }) => {
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Dr. John Smith',
    email: 'john.smith@dentalclinic.com',
    phone: '+1 (555) 123-4567',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    // Password validation (only if user is trying to change password)
    if (profile.newPassword || profile.confirmPassword || profile.currentPassword) {
      if (!profile.currentPassword) {
        newErrors.currentPassword = 'Current password is required to change password';
      }

      if (!profile.newPassword) {
        newErrors.newPassword = 'New password is required';
      } else if (profile.newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(profile.newPassword)) {
        newErrors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
      }

      if (!profile.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your new password';
      } else if (profile.newPassword !== profile.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
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
        passwordChanged: !!profile.newPassword
      });
      
      // Clear password fields after successful save
      setProfile(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
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

  const InputField = ({ 
    label, 
    type, 
    value, 
    onChange, 
    error, 
    icon: Icon,
    placeholder,
    showPassword,
    onTogglePassword
  }: {
    label: string;
    type: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    icon: React.ComponentType<any>;
    placeholder?: string;
    showPassword?: boolean;
    onTogglePassword?: () => void;
  }) => (
    <div className="space-y-2">
      <label className="block text-slate-300 text-sm font-medium">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon size={16} className="text-slate-400" />
        </div>
        <input
          type={showPassword !== undefined ? (showPassword ? 'text' : 'password') : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-${onTogglePassword ? '12' : '4'} py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
            error ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'
          }`}
        />
        {onTogglePassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
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
            <h1 className="text-xl font-semibold text-white">Profile Settings</h1>
          </div>
          
          {successMessage && (
            <div className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
              {successMessage}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-800 rounded-xl shadow-xl border border-slate-700">
            {/* Profile Header */}
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                  <User size={32} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
                  <p className="text-slate-400">{profile.email}</p>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Full Name"
                    type="text"
                    value={profile.name}
                    onChange={(value) => handleInputChange('name', value)}
                    error={errors.name}
                    icon={User}
                    placeholder="Enter your full name"
                  />
                  
                  <InputField
                    label="Phone Number"
                    type="tel"
                    value={profile.phone}
                    onChange={(value) => handleInputChange('phone', value)}
                    error={errors.phone}
                    icon={Phone}
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div className="mt-6">
                  <InputField
                    label="Email Address"
                    type="email"
                    value={profile.email}
                    onChange={(value) => handleInputChange('email', value)}
                    error={errors.email}
                    icon={Mail}
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              {/* Password Change */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
                <div className="space-y-4">
                  <InputField
                    label="Current Password"
                    type="password"
                    value={profile.currentPassword}
                    onChange={(value) => handleInputChange('currentPassword', value)}
                    error={errors.currentPassword}
                    icon={Lock}
                    placeholder="Enter your current password"
                    showPassword={showCurrentPassword}
                    onTogglePassword={() => setShowCurrentPassword(!showCurrentPassword)}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="New Password"
                      type="password"
                      value={profile.newPassword}
                      onChange={(value) => handleInputChange('newPassword', value)}
                      error={errors.newPassword}
                      icon={Lock}
                      placeholder="Enter new password"
                      showPassword={showNewPassword}
                      onTogglePassword={() => setShowNewPassword(!showNewPassword)}
                    />
                    
                    <InputField
                      label="Confirm New Password"
                      type="password"
                      value={profile.confirmPassword}
                      onChange={(value) => handleInputChange('confirmPassword', value)}
                      error={errors.confirmPassword}
                      icon={Lock}
                      placeholder="Confirm new password"
                      showPassword={showConfirmPassword}
                      onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-6 border-t border-slate-700">
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
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