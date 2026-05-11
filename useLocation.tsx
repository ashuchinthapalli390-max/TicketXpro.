import React, { createContext, useContext, useState, useEffect } from 'react';

interface LocationContextType {
  city: string;
  setCity: (city: string) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [city, setCity] = useState(() => {
    return localStorage.getItem('user_city') || 'Narasaraopet';
  });

  useEffect(() => {
    localStorage.setItem('user_city', city);
  }, [city]);

  return (
    <LocationContext.Provider value={{ city, setCity }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
};
