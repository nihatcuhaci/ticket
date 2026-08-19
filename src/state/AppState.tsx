import React, { createContext, useContext, useMemo, useState } from 'react';
import {
  BookingConfirmation,
  PassengerCounts,
  PassengerDetails,
  SearchCriteria,
  SelectedFare,
} from '../types';
import { todayISO } from '../services/journeyGenerator';

const DEFAULT_PASSENGERS: PassengerCounts = { adult: 1, youth: 0, child: 0, senior: 0, infant: 0 };

export const DEFAULT_CRITERIA: SearchCriteria = {
  originId: 'lon',
  destinationId: 'par',
  date: todayISO(),
  passengers: DEFAULT_PASSENGERS,
  wheelchairUser: false,
};

interface AppStateShape {
  criteria: SearchCriteria;
  setCriteria: React.Dispatch<React.SetStateAction<SearchCriteria>>;
  selection: SelectedFare | null;
  setSelection: (s: SelectedFare | null) => void;
  passenger: PassengerDetails;
  setPassenger: (p: PassengerDetails) => void;
  confirmation: BookingConfirmation | null;
  setConfirmation: (c: BookingConfirmation | null) => void;
  resetBooking: () => void;
}

const AppStateContext = createContext<AppStateShape | undefined>(undefined);

const EMPTY_PASSENGER: PassengerDetails = { firstName: '', lastName: '', email: '', phone: '' };

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [criteria, setCriteria] = useState<SearchCriteria>(DEFAULT_CRITERIA);
  const [selection, setSelection] = useState<SelectedFare | null>(null);
  const [passenger, setPassenger] = useState<PassengerDetails>(EMPTY_PASSENGER);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);

  const resetBooking = () => {
    setSelection(null);
    setPassenger(EMPTY_PASSENGER);
    setConfirmation(null);
  };

  const value = useMemo(
    () => ({
      criteria,
      setCriteria,
      selection,
      setSelection,
      passenger,
      setPassenger,
      confirmation,
      setConfirmation,
      resetBooking,
    }),
    [criteria, selection, passenger, confirmation]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};

export function useAppState(): AppStateShape {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
