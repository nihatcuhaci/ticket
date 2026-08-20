import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';
import { PrimaryButton } from './ui';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

/**
 * Blocks the app behind a full-screen "no internet" state whenever the
 * device has no usable connection — both at launch and if connectivity
 * drops later, since the listener keeps watching (see
 * useNetworkStatus).
 *
 * Why block the whole app rather than just Checkout: EuroTrain's search
 * results are local seed data (see README -> APIs & Data) and would
 * technically render offline, but the entire point of "move toward
 * purchasing" is the real eurostar.com handoff at checkout, and the FX
 * conversion is also a live call. Letting someone search and pick a
 * fare only to discover the "Continue on eurostar.com" button doesn't
 * work would be a worse experience than failing loudly and early.
 */
export const NetworkGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isOffline, checking, recheck } = useNetworkStatus();

  if (!isOffline) return <>{children}</>;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Ionicons name="cloud-offline-outline" size={56} color={colors.gray400} />
        <Text style={styles.title}>İnternet bağlantısı yok</Text>
        <Text style={styles.text}>
          EuroTrain'de sefer aramak ve eurostar.com üzerinden satın almaya devam edebilmek için bir
          internet bağlantısı gerekir. Lütfen bağlantınızı kontrol edip tekrar deneyin.
        </Text>
        <PrimaryButton
          label="Tekrar dene"
          onPress={recheck}
          loading={checking}
          style={{ marginTop: spacing.lg, minWidth: 160 }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.offWhite },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  title: { ...typography.h3, color: colors.navy900, marginTop: spacing.md },
  text: { ...typography.body, color: colors.gray600, textAlign: 'center', marginTop: spacing.xs },
});
