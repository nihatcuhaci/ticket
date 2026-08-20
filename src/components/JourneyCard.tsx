import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme';
import { FareClassId, Journey } from '../types';
import { FARE_CLASSES } from '../data/fareClasses';
import { CurrencyCode, convert, formatCurrency, ExchangeRates } from '../services/currencyService';
import { Badge } from './ui';

export const JourneyCard: React.FC<{
  journey: Journey;
  currency: CurrencyCode;
  rates: ExchangeRates | null;
  selectedFareClassId?: FareClassId;
  onSelectFare: (fareClassId: FareClassId) => void;
  onShowConditions: (fareClassId: FareClassId) => void;
}> = ({ journey, currency, rates, selectedFareClassId, onSelectFare, onShowConditions }) => {
  const lowestPrice = Math.min(
    ...journey.fares.filter((f) => f.price !== null).map((f) => f.price as number)
  );

  const priceLabel = (amountEUR: number) =>
    rates ? formatCurrency(convert(amountEUR, currency, rates), currency) : `€${amountEUR}`;

  return (
    <View style={styles.card}>
      <View style={styles.timeRow}>
        <View>
          <View style={styles.timeAndBadge}>
            <Text style={styles.time}>{journey.departureTime}</Text>
            {journey.live && <Badge label="Canlı" tone="teal" />}
          </View>
          <Text style={styles.station}>{journey.durationMinutes >= 60
            ? `${Math.floor(journey.durationMinutes / 60)}sa ${journey.durationMinutes % 60}dk`
            : `${journey.durationMinutes}dk`}</Text>
          {journey.live && (journey.delayMinutes ?? 0) > 0 && (
            <Text style={styles.delayText}>+{journey.delayMinutes} dk gecikme bildirildi</Text>
          )}
        </View>
        <View style={styles.timeline}>
          <View style={styles.timelineDot} />
          <View style={styles.timelineLine} />
          <Ionicons name="train" size={14} color={colors.gray400} />
          <View style={styles.timelineLine} />
          <View style={styles.timelineDot} />
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.time}>{journey.arrivalTime}</Text>
          <Text style={styles.station}>{journey.direct ? 'Aktarmasız' : 'Aktarmalı'}</Text>
        </View>
      </View>

      <View style={styles.fareRow}>
        {FARE_CLASSES.map((fc) => {
          const fare = journey.fares.find((f) => f.classId === fc.id);
          const available = fare && fare.price !== null;
          const selected = selectedFareClassId === fc.id;
          return (
            <Pressable
              key={fc.id}
              disabled={!available}
              onPress={() => available && onSelectFare(fc.id)}
              onLongPress={() => onShowConditions(fc.id)}
              accessibilityRole="button"
              accessibilityLabel={`${fc.label} sınıfını seç, fiyat ${
                available ? priceLabel(fare!.price as number) : 'mevcut değil'
              }`}
              style={[
                styles.fareCell,
                selected && styles.fareCellSelected,
                !available && styles.fareCellDisabled,
              ]}
            >
              <Text style={[styles.fareClassLabel, selected && styles.textOnSelected]}>
                {fc.shortLabel}
              </Text>
              {available ? (
                <>
                  <Text style={[styles.farePrice, selected && styles.textOnSelected]}>
                    {priceLabel(fare!.price as number)}
                  </Text>
                  {fare!.price === lowestPrice && (
                    <Badge label="En düşük" tone={selected ? 'amber' : 'teal'} />
                  )}
                  {fare!.seatsLeft !== null && fare!.seatsLeft <= 8 && (
                    <Text style={[styles.seatsLeft, selected && styles.textOnSelected]}>
                      {fare!.seatsLeft} koltuk kaldı
                    </Text>
                  )}
                </>
              ) : (
                <Text style={styles.notAvailable}>Dolu</Text>
              )}
            </Pressable>
          );
        })}
      </View>
      <Pressable
        onPress={() => onShowConditions(selectedFareClassId ?? 'standard')}
        style={styles.conditionsLink}
        accessibilityRole="button"
      >
        <Text style={styles.conditionsText}>Bilet koşullarını gör</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray200,
    marginBottom: spacing.md,
  },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timeAndBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  time: { ...typography.h3, color: colors.navy900 },
  station: { ...typography.caption, color: colors.gray600, marginTop: 2 },
  delayText: { ...typography.tiny, color: colors.warning, marginTop: 2 },
  timeline: { flex: 1, flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.sm, gap: 2 },
  timelineDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.gray400 },
  timelineLine: { flex: 1, height: 1, backgroundColor: colors.gray200 },
  fareRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  fareCell: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.gray200,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    gap: 2,
    minHeight: 78,
    justifyContent: 'center',
  },
  fareCellSelected: { backgroundColor: colors.navy800, borderColor: colors.navy800 },
  fareCellDisabled: { backgroundColor: colors.gray100, borderColor: colors.gray100 },
  fareClassLabel: { ...typography.tiny, color: colors.gray600, textTransform: 'uppercase' },
  farePrice: { ...typography.bodyStrong, color: colors.navy900, fontSize: 17 },
  notAvailable: { ...typography.caption, color: colors.gray400, marginTop: spacing.sm },
  seatsLeft: { ...typography.tiny, color: colors.warning },
  textOnSelected: { color: colors.white },
  conditionsLink: { marginTop: spacing.md, alignSelf: 'flex-start' },
  conditionsText: { ...typography.captionStrong, color: colors.navy700, textDecorationLine: 'underline' },
});
