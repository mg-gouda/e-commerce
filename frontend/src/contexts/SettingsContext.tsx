'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Settings {
  siteName: string;
  siteDescription: string;
  platformLogo: string;
  faviconUrl: string;
  contactEmail: string;
  supportEmail: string;
  currency: string;
  taxRate: number;
  shippingRate: number;
  freeShippingThreshold: number;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  siteName: 'E-Commerce Xpress',
  siteDescription: 'Modern e-commerce platform built with Next.js and NestJS',
  platformLogo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTIwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzI1NjNlYiIvPgo8dGV4dCB4PSI2MCIgeT0iMjYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5FLUNvbW1lcmNlIFhwcmVzczwvdGV4dD4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0xNiAxMVY3YTQgNCAwIDAwLTggMHY0TTUgOWgxNGwxIDEySDRMNSA5eiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHN2Zz4KPHN2Zz4=',
  faviconUrl: '/favicon.ico',
  contactEmail: 'admin@example.com',
  supportEmail: 'support@example.com',
  currency: 'USD',
  taxRate: 8.5,
  shippingRate: 9.99,
  freeShippingThreshold: 100,
  maintenanceMode: false,
  allowRegistration: true,
  emailNotifications: true,
  smsNotifications: false,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}