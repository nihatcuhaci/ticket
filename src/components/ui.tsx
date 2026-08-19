import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

export const PrimaryButton: React.FC<{
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}> = ({ label, onPress, disabled, loading, style }) => (
  <Pressable
    accessibilityRole="button"
    accessibilityState={{ disabled: !!disabled || !!loading }}
    onPress={onPress}
    disabled={disabled || loading}
    style={({ pressed }) => [
      styles.primaryBtn,
      (disabled || loading) && styles.primaryBtnDisabled,
      pressed && !disabled && !loading && styles.pressed,
      style,
    ]}
  >
    {loading ? (
      <ActivityIndicator color={colors.navy900} />
    ) : (
      <Text style={styles.primaryBtnText}>{label}</Text>
    )}
  </Pressable>
);

export const SecondaryButton: React.FC<{
  label: string;
  onPress: () => void;
  style?: ViewStyle;
}> = ({ label, onPress, style }) => (
  <Pressable
    accessibilityRole="button"
    onPress={onPress}
    style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed, style]}
  >
    <Text style={styles.secondaryBtnText}>{label}</Text>
  </Pressable>
);

export const Badge: React.FC<{ label: string; tone?: 'teal' | 'amber' | 'gray' | 'error' }> = ({
  label,
  tone = 'teal',
}) => {
  const bg = {
    teal: colors.teal100,
    amber: '#FCEBCB',
    gray: colors.gray100,
    error: '#F7DAD8',
  }[tone];
  const fg = {
    teal: colors.teal500,
    amber: colors.amber600,
    gray: colors.gray600,
    error: colors.error,
  }[tone];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: fg }]}>{label}</Text>
    </View>
  );
};

export const Card: React.FC<{ children: React.ReactNode; style?: ViewStyle }> = ({
  children,
  style,
}) => <View style={[styles.card, style]}>{children}</View>;

export const Divider: React.FC = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  primaryBtn: {
    backgroundColor: colors.amber500,
    borderRadius: radius.pill,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnDisabled: {
    backgroundColor: colors.gray200,
  },
  primaryBtnText: {
    ...typography.bodyStrong,
    color: colors.navy900,
  },
  secondaryBtn: {
    borderWidth: 1.5,
    borderColor: colors.navy700,
    borderRadius: radius.pill,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    ...typography.bodyStrong,
    color: colors.navy700,
  },
  pressed: {
    opacity: 0.85,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  badgeText: {
    ...typography.tiny,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray200,
    marginVertical: spacing.md,
  },
});
