import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomModal } from './BottomModal';
import { searchStations } from '../data/stations';
import { Station } from '../types';
import { colors, radius, spacing, typography } from '../theme';

export const StationPickerModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSelect: (station: Station) => void;
  excludeId?: string;
  title: string;
}> = ({ visible, onClose, onSelect, excludeId, title }) => {
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchStations(query, excludeId), [query, excludeId]);

  return (
    <BottomModal visible={visible} onClose={onClose} title={title}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={colors.gray400} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Şehir veya istasyon ara"
          placeholderTextColor={colors.gray400}
          style={styles.input}
          autoFocus
          accessibilityLabel="İstasyon ara"
        />
      </View>
      <FlatList
        data={results}
        keyExtractor={(s) => s.id}
        style={{ maxHeight: 380 }}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text style={styles.empty}>"{query}" için istasyon bulunamadı.</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => {
              onSelect(item);
              setQuery('');
              onClose();
            }}
            accessibilityRole="button"
          >
            <View style={styles.rowIcon}>
              <Ionicons name="train-outline" size={16} color={colors.navy700} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.city}>{item.city}</Text>
              <Text style={styles.name}>
                {item.name} · {item.country}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </BottomModal>
  );
};

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.offWhite,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    ...typography.body,
    color: colors.gray800,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  rowPressed: { backgroundColor: colors.offWhite },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.teal100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  city: { ...typography.bodyStrong, color: colors.navy900 },
  name: { ...typography.caption, color: colors.gray600, marginTop: 2 },
  empty: { ...typography.body, color: colors.gray600, textAlign: 'center', marginTop: spacing.xl },
});
