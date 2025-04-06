import React from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  type: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  isPassword?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type,
  required = false,
  value,
  onChange,
  placeholder,
  isPassword = false
}) => {
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getStrengthLabel = (strength: number) => {
    if (strength === 0) return '';
    if (strength <= 2) return 'Débil';
    if (strength <= 3) return 'Media';
    return 'Fuerte';
  };

  const getStrengthColor = (strength: number) => {
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const passwordStrength = isPassword ? getPasswordStrength(value) : 0;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1 relative">
        <input
          id={id}
          name={id}
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2A6877] focus:border-transparent transition-all duration-300"
        />
        {isPassword && value && (
          <div className="mt-2">
            <div className="flex gap-1 h-1 mb-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`h-full w-full rounded-full transition-all duration-300 ${
                    level <= passwordStrength
                      ? getStrengthColor(passwordStrength)
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            {value && (
              <div className="flex justify-between items-center text-xs">
                <span className={`${
                  passwordStrength <= 2 ? 'text-red-500' : 
                  passwordStrength <= 3 ? 'text-yellow-500' : 
                  'text-green-500'
                }`}>
                  {getStrengthLabel(passwordStrength)}
                </span>
                <span className="text-gray-500">
                  {passwordStrength < 3 && 'Incluye mayúsculas, números y símbolos'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormField;
