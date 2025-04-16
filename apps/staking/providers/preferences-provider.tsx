'use client';

import { preferenceStorageDefaultItems, preferenceStorageKey } from '@/lib/constants';
import type { ReactNode } from 'react';
import { PreferencesProvider as PreferencesProviderUsePref } from 'usepref/providers/preferences-provider';
import { PreferenceStorage } from 'usepref/storage/preference-storage';

let browserPreferencesStorage: PreferenceStorage | undefined;

function createPreferencesStorage() {
  return new PreferenceStorage({
    key: preferenceStorageKey,
    defaultItems: preferenceStorageDefaultItems,
  });
}

export function getPreferencesStorage() {
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
