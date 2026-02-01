import React from 'react';
import Link from 'next/link';

interface ButtonProps {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  disabled = false,
  href,
  onClick,
  className = '',
}: ButtonProps) {
  const baseClasses = "py-2 px-6 border rounded-lg shadow-sm text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:opacity-90 motion-reduce:transition-none";

  const variantClasses = {
    primary: "bg-gradient-to-r from-blue-600 to-blue-500 text-white border-transparent hover:from-blue-700 hover:to-blue-600",
    secondary: "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={classes}
    >
      {children}
    </button>
  );
}