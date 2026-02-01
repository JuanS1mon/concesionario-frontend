'use client';

import { ReactNode } from 'react';

interface AdminHeroProps {
  title: string;
  description: string;
  buttonText?: string;
  buttonHref?: string;
  buttonIcon?: ReactNode;
  children?: ReactNode;
}

export default function AdminHero({
  title,
  description,
  buttonText,
  buttonHref,
  buttonIcon,
  children
}: AdminHeroProps) {
  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden w-full">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative w-full px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent leading-tight">
            {title}
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            {description}
          </p>
          {buttonText && buttonHref && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={buttonHref}
                className="bg-red-600 hover:bg-red-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center justify-center"
              >
                {buttonIcon && <span className="mr-2">{buttonIcon}</span>}
                {buttonText}
              </a>
            </div>
          )}
          {children}
        </div>
      </div>
      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-blue-600 to-red-600"></div>
    </section>
  );
}