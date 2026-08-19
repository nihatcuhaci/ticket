import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import { generateDayPrice, isoDateAddDays } from '../services/journeyGenerator';
import { RouteDefinition } from '../types';
import { CurrencyCode, convert, formatCurrency, ExchangeRates } from '../services/currencyService';

const WEEKDAYS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

export const DateStrip: React.FC<{
  route: RouteDefinition;
  selectedDate: string;
  onSelect: (date: string) => void;
  currency: CurrencyCode;
  rates: ExchangeRates | null;
}> = ({ route, selectedDate, onSelect, currency, rates }) => {
  const days = useMemo(
    () => Array.from({ length: 9 }, (_, i) => isoDateAddDays(selectedDate, i - 3)),
    [selectedDate]
  );

  return (
    <FlatList
      horizontal
      data={days}
      keyExtractor={(d) => d}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}
      renderItem={({ item }) => {
        const d = new Date(item + 'T00:00:00');
        const selected = item === selectedDate;
        const dayPrice = generateDayPrice(route, item);
        const displayPrice =
          dayPrice.lowestFare !== null && rates
            ? formatCurrency(convert(dayPrice.lowestFare, currency, rates), currency)
            : dayPrice.lowestFare !== null
            ? `€${dayPrice.lowestFare}`
            : null;

        return (
          <Pressable
            onPress={() => onSelect(item)}
            style={[styles.chip, selected && styles.chipSelected]}
            accessibilityRole="button"
            accessibilityLabel={`${item} tarihini seç`}
          >
            <Text style={[styles.day, selected && styles.textSelected]}>
              {WEEKDAYS[d.getDay()]} {d.getDate()} {MONTHS[d.getMonth()]}
            </Text>
            <Text style={[styles.price, selected && styles.textSelected]}>
              {displayPrice ?? 'Dolu'}
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
  day: { ...typography.tiny, color: colors.gray600 },
  price: { ...typography.bodyStrong, color: colors.navy900, marginTop: 4 },
  textSelected: { color: colors.white },
});
