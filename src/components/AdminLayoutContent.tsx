'use client';

import { useEffect, useState } from 'react';

export default function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Listen for sidebar state changes
    const checkSidebarState = () => {
      setSidebarOpen(document.body.classList.contains('admin-sidebar-open'));
    };

    // Check initial state
    checkSidebarState();

    // Use MutationObserver to watch for class changes on body
    const observer = new MutationObserver(checkSidebarState);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`transition-all duration-300 ${
        sidebarOpen ? 'md:ml-80' : 'ml-0'
      }`}
    >
      {children}
    </div>
  );
}
