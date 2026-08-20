import React, { createContext, useContext, useMemo, useState } from 'react';
import { PassengerCounts, SearchCriteria, SelectedFare } from '../types';
import { todayISO } from '../services/journeyGenerator';

const DEFAULT_PASSENGERS: PassengerCounts = { adult: 1, youth: 0, child: 0, senior: 0, infant: 0 };

export const DEFAULT_CRITERIA: SearchCriteria = {
  originId: 'lon',
  destinationId: 'par',
  date: todayISO(),
  tripType: 'oneway',
  returnDate: null,
  passengers: DEFAULT_PASSENGERS,
  wheelchairUser: false,
};

interface AppStateShape {
  criteria: SearchCriteria;
  setCriteria: React.Dispatch<React.SetStateAction<SearchCriteria>>;
  /** Outbound-leg fare selection (the only leg for a one-way search). */
  selection: SelectedFare | null;
  setSelection: (s: SelectedFare | null) => void;
  /** Return-leg fare selection — only used when criteria.tripType is 'roundtrip'. */
  returnSelection: SelectedFare | null;
  setReturnSelection: (s: SelectedFare | null) => void;
  resetBooking: () => void;
}

const AppStateContext = createContext<AppStateShape | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [criteria, setCriteria] = useState<SearchCriteria>(DEFAULT_CRITERIA);
  const [selection, setSelection] = useState<SelectedFare | null>(null);
  const [returnSelection, setReturnSelection] = useState<SelectedFare | null>(null);

  const resetBooking = () => {
    setSelection(null);
    setReturnSelection(null);
  };

  const value = useMemo(
    () => ({
      criteria,
      setCriteria,
      selection,
      setSelection,
      returnSelection,
      setReturnSelection,
      resetBooking,
    }),
    [criteria, selection, returnSelection]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};

export function useAppState(): AppStateShape {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
