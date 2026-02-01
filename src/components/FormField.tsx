import React from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value?: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  children?: React.ReactNode; // Para options en select
  as?: 'input' | 'textarea' | 'select';
}

export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder,
  min,
  max,
  step,
  children,
  as = 'input',
}: FormFieldProps) {
  const baseClasses = "mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-lg transition-all duration-200 hover:border-blue-400 hover:shadow-md motion-reduce:transition-none text-gray-900 bg-white";

  const Element = as === 'textarea' ? 'textarea' : as === 'select' ? 'select' : 'input';

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label} {required && '*'}
      </label>
      <Element
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className={`${baseClasses} ${disabled ? 'bg-gray-100' : ''}`}
      >
        {children}
      </Element>
    </div>
  );
}