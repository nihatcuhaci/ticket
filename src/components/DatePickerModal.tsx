import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomModal } from './BottomModal';
import { colors, radius, spacing, typography } from '../theme';
import { isoDateAddDays, todayISO } from '../services/journeyGenerator';

const WEEKDAYS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
const MONTHS = [
  'Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara',
];

export const DatePickerModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  value: string;
  onSelect: (date: string) => void;
}> = ({ visible, onClose, value, onSelect }) => {
  const days = useMemo(() => {
    const today = todayISO();
    return Array.from({ length: 120 }, (_, i) => isoDateAddDays(today, i));
  }, []);

  return (
    <BottomModal visible={visible} onClose={onClose} title="Tarih seçin">
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
                {WEEKDAYS[d.getDay()]}, {d.getDate()} {MONTHS[d.getMonth()]}
              </Text>
              {selected && <Text style={styles.selectedTag}>Seçili</Text>}
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
