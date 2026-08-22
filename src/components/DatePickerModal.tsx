import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomModal } from './BottomModal';
import { colors, radius, spacing, typography } from '../theme';
import { isoDateAddDays, todayISO } from '../services/journeyGenerator';
import { useTranslation } from '../hooks/useTranslation';

export const DatePickerModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  value: string;
  onSelect: (date: string) => void;
  /** Earliest selectable date (ISO). Defaults to today — pass the outbound
   * date here when picking a return date, so a round trip can't end up
   * with a return before its outbound leg. */
  minDateISO?: string;
  title?: string;
}> = ({ visible, onClose, value, onSelect, minDateISO, title }) => {
  const { t } = useTranslation();
  const days = useMemo(() => {
    const start = minDateISO && minDateISO > todayISO() ? minDateISO : todayISO();
    return Array.from({ length: 120 }, (_, i) => isoDateAddDays(start, i));
  }, [minDateISO]);

  return (
    <BottomModal visible={visible} onClose={onClose} title={title ?? t.datePicker.defaultTitle}>
      <FlatList
        data={days}
        keyExtractor={(d) => d}
        style={{ maxHeight: 420 }}
        renderItem={({ item }) => {
          const d = new Date(item + 'T00:00:00');
          const selected = item === value;
          return (
            <Pressable
              style={({ pressed }) => [
                styles.row,
                selected && styles.rowSelected,
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => {
                onSelect(item);
                onClose();
              }}
              accessibilityRole="button"
            >
              <Text style={[styles.date, selected && styles.dateSelected]}>
                {t.weekdaysShort[d.getDay()]}, {d.getDate()} {t.monthsShort[d.getMonth()]}
              </Text>
              {selected && <Text style={styles.selectedTag}>{t.common.selectedTag}</Text>}
            </Pressable>
          );
        }}
      />
    </BottomModal>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  rowSelected: { backgroundColor: colors.teal100 },
  date: { ...typography.body, color: colors.navy900 },
  dateSelected: { color: colors.teal500, fontWeight: '700' },
  selectedTag: { ...typography.tiny, color: colors.teal500 },
});
