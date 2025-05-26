'use client';

import { type Dispatch, type ReactNode, createContext, useContext, useState } from 'react';

type RegistrationListContext = {
  editing: boolean;
  setEditing: Dispatch<boolean>;
};

const RegistrationListContext = createContext<RegistrationListContext | undefined>(undefined);

export function RegistrationListProvider({ children }: { children: ReactNode }) {
  const [editing, setEditing] = useState<boolean>(false);
  return (
    <RegistrationListContext.Provider
      value={{
        editing,
        setEditing,
      }}
    >
      {children}
    </RegistrationListContext.Provider>
  );
}

export function useRegistrationList() {
  const context = useContext(RegistrationListContext);

  if (context === undefined) {
    throw new Error('useRegistrationList must be used inside RegistrationListContext');
  }

  return context;
}
