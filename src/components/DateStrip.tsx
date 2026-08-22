import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import { generateDayPrice, isoDateAddDays } from '../services/journeyGenerator';
import { RouteDefinition } from '../types';
import { CurrencyCode, convert, formatCurrency, ExchangeRates } from '../services/currencyService';
import { useTranslation } from '../hooks/useTranslation';

export const DateStrip: React.FC<{
  route: RouteDefinition;
  selectedDate: string;
  onSelect: (date: string) => void;
  currency: CurrencyCode;
  rates: ExchangeRates | null;
  /** Dates before this (ISO) are shown but disabled — used for a round
   * trip's return leg so it can't be browsed to before the outbound date. */
  minDateISO?: string;
}> = ({ route, selectedDate, onSelect, currency, rates, minDateISO }) => {
  const { t } = useTranslation();
  const days = useMemo(
    () => Array.from({ length: 9 }, (_, i) => isoDateAddDays(selectedDate, i - 3)),
    [selectedDate]
  );

  // Computed once per window of visible days so the cheapest one can be
  // highlighted — the "top suggestions" a shopper scans before picking a
  // date, so the best price among them should stand out at a glance.
  const dayEntries = useMemo(
    () =>
      days.map((date) => ({
        date,
        disabled: !!minDateISO && date < minDateISO,
        dayPrice: generateDayPrice(route, date),
      })),
    [days, route, minDateISO]
  );

  const cheapestDate = useMemo(() => {
    let best: { date: string; price: number } | null = null;
    for (const entry of dayEntries) {
      if (entry.disabled || entry.dayPrice.lowestFare === null) continue;
      if (!best || entry.dayPrice.lowestFare < best.price) {
        best = { date: entry.date, price: entry.dayPrice.lowestFare };
      }
    }
    return best?.date ?? null;
  }, [dayEntries]);

  return (
    <FlatList
      horizontal
      data={dayEntries}
      keyExtractor={(entry) => entry.date}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}
      renderItem={({ item }) => {
        const { date, disabled, dayPrice } = item;
        const d = new Date(date + 'T00:00:00');
        const selected = date === selectedDate;
        const isCheapest = !selected && !disabled && date === cheapestDate;
        const displayPrice =
          dayPrice.lowestFare !== null && rates
            ? formatCurrency(convert(dayPrice.lowestFare, currency, rates), currency)
            : dayPrice.lowestFare !== null
            ? `€${dayPrice.lowestFare}`
            : null;

        const dayLabel = `${t.weekdaysShort[d.getDay()]} ${d.getDate()} ${t.monthsShort[d.getMonth()]}`;

        return (
          <Pressable
            onPress={() => !disabled && onSelect(date)}
            disabled={disabled}
            style={[
              styles.chip,
              selected && styles.chipSelected,
              isCheapest && styles.chipCheapest,
              disabled && styles.chipDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel={t.datePicker.dateChipA11y(dayLabel)}
          >
            <Text style={[styles.day, selected && styles.textSelected, disabled && styles.textDisabled]}>
              {dayLabel}
            </Text>
            <Text style={[styles.price, selected && styles.textSelected, disabled && styles.textDisabled]}>
              {disabled ? '—' : displayPrice ?? t.common.soldOut}
            </Text>
          </Pressable>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray200,
    minWidth: 84,
  },
  chipSelected: {
    backgroundColor: colors.navy800,
    borderColor: colors.navy800,
  },
  chipDisabled: {
    backgroundColor: colors.gray100,
    borderColor: colors.gray100,
  },
  // Light green fill + green border on the box itself — text keeps its
  // normal color, only the container is highlighted.
  chipCheapest: {
    backgroundColor: '#E3F5EA',
    borderColor: colors.success,
    borderWidth: 1.5,
  },
  day: { ...typography.tiny, color: colors.gray600 },
  price: { ...typography.bodyStrong, color: colors.navy900, marginTop: 4 },
  textSelected: { color: colors.white },
  textDisabled: { color: colors.gray400 },
});
