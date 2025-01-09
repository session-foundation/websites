'use client';
import { PreferencesProvider as PreferencesProviderUsePref } from 'usepref/providers/preferences-provider';
import { PreferenceStorage } from 'usepref/storage/preference-storage';
import type { ReactNode } from 'react';
import { preferenceStorageDefaultItems, preferenceStorageKey } from '@/lib/constants';

let browserPreferencesStorage: PreferenceStorage | undefined = undefined;

function createPreferencesStorage() {
  return new PreferenceStorage({
    key: preferenceStorageKey,
    defaultItems: preferenceStorageDefaultItems,
  });
}

function getPreferencesStorage() {
  if (!browserPreferencesStorage) browserPreferencesStorage = createPreferencesStorage();
  return browserPreferencesStorage;
}

export default function PreferencesProvider({ children }: { children: ReactNode }) {
  const PreferencesStorage = getPreferencesStorage();

  return (
    <PreferencesProviderUsePref preferenceStorage={PreferencesStorage}>
      {children}
    </PreferencesProviderUsePref>
  );
}
