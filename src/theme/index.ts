/**
 * EuroTrain design tokens.
 *
 * Original palette (not copied from Eurostar) but in the same spirit as
 * European rail brands: a deep navy base for trust/travel, a warm amber
 * for primary actions, and a teal accent for "value/lowest fare" signals.
 */

export const colors = {
  navy900: '#0B1D3A',
  navy800: '#122A52',
  navy700: '#1B3A6B',
  navy600: '#254B85',

  amber500: '#F5A623',
  amber600: '#DD8F0F',

  teal500: '#0E8F7E',
  teal100: '#DFF5F1',

  garnet600: '#8C1D40',

  white: '#FFFFFF',
  offWhite: '#F6F7FB',
  gray100: '#EEF0F5',
  gray200: '#E1E4EC',
  gray400: '#9AA3B2',
  gray600: '#5B6472',
  gray800: '#2B303A',

  success: '#1F8A4C',
  error: '#C4362E',
  warning: '#B9770E',

  overlay: 'rgba(11, 29, 58, 0.55)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 21 },
  bodyStrong: { fontSize: 15, fontWeight: '600' as const, lineHeight: 21 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  captionStrong: { fontSize: 13, fontWeight: '600' as const, lineHeight: 18 },
  tiny: { fontSize: 11, fontWeight: '500' as const, lineHeight: 14 },
};

export const shadow = {
  card: {
    shadowColor: '#0B1D3A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
};
