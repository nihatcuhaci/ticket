import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomModal } from './BottomModal';
import { PassengerCategory, PassengerCounts } from '../types';
import { colors, radius, spacing, typography } from '../theme';
import { PrimaryButton } from './ui';

const CATEGORY_META: { id: PassengerCategory; label: string; hint: string; min: number }[] = [
  { id: 'adult', label: 'Yetişkin', hint: '26-59 yaş', min: 1 },
  { id: 'youth', label: 'Genç', hint: '12-25 yaş', min: 0 },
  { id: 'child', label: 'Çocuk', hint: '0-11 yaş', min: 0 },
  { id: 'senior', label: 'Senior', hint: '60+ yaş', min: 0 },
  { id: 'infant', label: 'Bebek', hint: '0-3 yaş, kucakta ücretsiz', min: 0 },
];

export const PassengerPickerModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  value: PassengerCounts;
  wheelchairUser: boolean;
  onChange: (value: PassengerCounts) => void;
  onChangeWheelchair: (value: boolean) => void;
}> = ({ visible, onClose, value, wheelchairUser, onChange, onChangeWheelchair }) => {
  const total = Object.values(value).reduce((a, b) => a + b, 0);

  const update = (id: PassengerCategory, delta: number) => {
    const min = CATEGORY_META.find((c) => c.id === id)!.min;
    const next = Math.max(min, Math.min(9, value[id] + delta));
    onChange({ ...value, [id]: next });
  };

  return (
    <BottomModal visible={visible} onClose={onClose} title="Yolcular">
      {CATEGORY_META.map((cat) => (
        <View key={cat.id} style={styles.row}>
          <View>
            <Text style={styles.label}>{cat.label}</Text>
            <Text style={styles.hint}>{cat.hint}</Text>
          </View>
          <View style={styles.counter}>
            <Pressable
              onPress={() => update(cat.id, -1)}
              disabled={value[cat.id] <= cat.min}
              style={[styles.counterBtn, value[cat.id] <= cat.min && styles.counterBtnDisabled]}
              accessibilityRole="button"
              accessibilityLabel={`${cat.label} azalt`}
            >
              <Ionicons name="remove" size={18} color={colors.navy700} />
            </Pressable>
            <Text style={styles.count}>{value[cat.id]}</Text>
            <Pressable
              onPress={() => update(cat.id, 1)}
              style={styles.counterBtn}
              accessibilityRole="button"
              accessibilityLabel={`${cat.label} arttır`}
            >
              <Ionicons name="add" size={18} color={colors.navy700} />
            </Pressable>
          </View>
        </View>
      ))}

      <View style={[styles.row, { marginTop: spacing.sm }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Tekerlekli sandalye kullanıcısı</Text>
          <Text style={styles.hint}>Erişilebilir koltuk ve alanları önceliklendirir</Text>
        </View>
        <Switch value={wheelchairUser} onValueChange={onChangeWheelchair} />
      </View>

      <PrimaryButton
        label={`Devam et (${total} yolcu)`}
        onPress={onClose}
        style={{ marginTop: spacing.lg }}
      />
    </BottomModal>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  label: { ...typography.bodyStrong, color: colors.navy900 },
  hint: { ...typography.caption, color: colors.gray600, marginTop: 2 },
  counter: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  counterBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.navy700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnDisabled: { borderColor: colors.gray200 },
  count: { ...typography.bodyStrong, minWidth: 18, textAlign: 'center' },
});
