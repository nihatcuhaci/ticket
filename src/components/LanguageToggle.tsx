import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import { Language, LANGUAGE_LABELS } from '../i18n/translations';
import { useTranslation } from '../hooks/useTranslation';

const OPTIONS: Language[] = ['tr', 'en'];

/**
 * Small pill toggle, same visual pattern as CurrencyToggle — a two-way
 * switch rather than a picker sheet, since there are only two languages.
 */
export const LanguageToggle: React.FC = () => {
  const { language, setLanguage, t } = useTranslation();
  return (
    <View style={styles.row}>
      {OPTIONS.map((code) => (
        <Pressable
          key={code}
          onPress={() => setLanguage(code)}
          style={[styles.chip, language === code && styles.chipSelected]}
          accessibilityRole="button"
          accessibilityLabel={t.language.toggleA11y(LANGUAGE_LABELS[code])}
        >
          <Text style={[styles.chipText, language === code && styles.chipTextSelected]}>
            {LANGUAGE_LABELS[code]}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  chipSelected: { backgroundColor: colors.amber500, borderColor: colors.amber500 },
  chipText: { ...typography.captionStrong, color: colors.white },
  chipTextSelected: { color: colors.navy900 },
});
