import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomModal } from './BottomModal';
import { FareClassId } from '../types';
import { getFareClassById } from '../data/fareClasses';
import { colors, spacing, typography } from '../theme';
import { PrimaryButton } from './ui';
import { useTranslation } from '../hooks/useTranslation';

export const FareDetailsSheet: React.FC<{
  visible: boolean;
  onClose: () => void;
  fareClassId: FareClassId | null;
  onChooseThisFare?: () => void;
}> = ({ visible, onClose, fareClassId, onChooseThisFare }) => {
  const { t, language } = useTranslation();
  const fareClass = fareClassId ? getFareClassById(fareClassId, language) : undefined;
  if (!fareClass) return null;

  return (
    <BottomModal visible={visible} onClose={onClose} title={fareClass.label}>
      <Text style={styles.description}>{fareClass.description}</Text>
      <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
        {fareClass.perks.map((perk) => (
          <View key={perk} style={styles.perkRow}>
            <Ionicons name="checkmark-circle" size={18} color={colors.teal500} />
            <Text style={styles.perkText}>{perk}</Text>
          </View>
        ))}
      </View>
      {onChooseThisFare && (
        <PrimaryButton
          label={t.fareClasses.chooseButton(fareClass.shortLabel)}
          onPress={() => {
            onChooseThisFare();
            onClose();
          }}
          style={{ marginTop: spacing.xl }}
        />
      )}
    </BottomModal>
  );
};

const styles = StyleSheet.create({
  description: { ...typography.body, color: colors.gray600 },
  perkRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  perkText: { ...typography.body, color: colors.navy900, flex: 1 },
});
