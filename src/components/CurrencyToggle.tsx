import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import { CurrencyCode } from '../services/currencyService';

const OPTIONS: CurrencyCode[] = ['EUR', 'TRY', 'USD', 'GBP'];

export const CurrencyToggle: React.FC<{
  value: CurrencyCode;
  onChange: (c: CurrencyCode) => void;
  freshness?: 'live' | 'fallback' | null;
}> = ({ value, onChange, freshness }) => (
  <View style={styles.wrap}>
    <View style={styles.row}>
      {OPTIONS.map((c) => (
        <Pressable
          key={c}
          onPress={() => onChange(c)}
          style={[styles.chip, value === c && styles.chipSelected]}
          accessibilityRole="button"
          accessibilityLabel={`${c} para birimini göster`}
        >
          <Text style={[styles.chipText, value === c && styles.chipTextSelected]}>{c}</Text>
        </Pressable>
      ))}
    </View>
    {freshness && (
      <Text style={styles.freshness}>
        {freshness === 'live' ? '● Canlı kur' : '● Kur şu an alınamadı, önbellek gösteriliyor'}
      </Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  wrap: { gap: 4 },
  row: { flexDirection: 'row', gap: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  chipSelected: { backgroundColor: colors.navy800, borderColor: colors.navy800 },
  chipText: { ...typography.captionStrong, color: colors.navy700 },
  chipTextSelected: { color: colors.white },
  freshness: { ...typography.tiny, color: colors.gray400 },
});
