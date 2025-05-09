'use client';

import { volatileStorageKey } from '@/lib/constants';
import { type ReactNode, createContext, useContext } from 'react';
import { PreferenceStorage } from 'usepref/storage/preference-storage';

type VolatileStorageContext = {
  volatileStorage: PreferenceStorage;
};

const Context = createContext<VolatileStorageContext | undefined>(undefined);

let browserVolatileStorage: PreferenceStorage | undefined;

function createVolatileStorage() {
  return new PreferenceStorage({
    key: volatileStorageKey,
  });
}

export function getVolatileStorage() {
  if (!browserVolatileStorage) browserVolatileStorage = createVolatileStorage();
  return browserVolatileStorage;
}

// TODO: investigate adding multi storage support to the usePref library

export default function VolatileStorageProvider({ children }: { children: ReactNode }) {
  const volatileStorage = getVolatileStorage();
  return <Context.Provider value={{ volatileStorage }}>{children}</Context.Provider>;
}

export const useVolatileStorage = () => {
  const context = useContext(Context);

  if (context === undefined) {
    throw new Error('useVolatileStorage must be used inside VolatileStorageProvider');
  }

  const instance = context.volatileStorage;

  return {
    getItem: instance.getItem.bind(instance),
    setItem: instance.setItem.bind(instance),
  };
};
