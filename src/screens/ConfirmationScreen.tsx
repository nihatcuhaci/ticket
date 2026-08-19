import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme';
import { useAppState } from '../state/AppState';
import { stationById } from '../data/stations';
import { fareClassById } from '../data/fareClasses';
import { PrimaryButton, SecondaryButton } from '../components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Confirmation'>;

export default function ConfirmationScreen({ navigation }: Props) {
  const { confirmation, resetBooking } = useAppState();

  if (!confirmation) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={typography.body as any}>Rezervasyon bulunamadı.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { selection, passenger, pnr, totalPaid, currency } = confirmation;
  const origin = stationById(selection.journey.originId);
  const destination = stationById(selection.journey.destinationId);
  const fareClass = fareClassById(selection.fareClassId);

  const goHome = () => {
    resetBooking();
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark-circle" size={64} color={colors.teal500} />
        </View>
        <Text style={styles.title}>Rezervasyonunuz onaylandı</Text>
        <Text style={styles.subtitle}>Bilet detayları {passenger.email || 'e-posta adresinize'} gönderildi.</Text>

        <View style={styles.pnrCard}>
          <Text style={styles.pnrLabel}>Rezervasyon kodu (PNR)</Text>
          <Text style={styles.pnr}>{pnr}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.route}>
            {origin?.city} → {destination?.city}
          </Text>
          <Text style={styles.detail}>
            {selection.journey.date} · {selection.journey.departureTime} - {selection.journey.arrivalTime}
          </Text>
          <View style={styles.divider} />
          <Row label="Yolcu" value={`${passenger.firstName} ${passenger.lastName}`} />
          <Row label="Sınıf" value={fareClass?.label ?? ''} />
          <Row label="Ödenen tutar" value={`€${totalPaid} (${currency})`} />
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={18} color={colors.navy700} />
          <Text style={styles.infoText}>
            Bu bir demo rezervasyondur, gerçek bir bilet oluşturulmadı ve ödeme alınmadı.
          </Text>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton label="Ana sayfaya dön" onPress={goHome} />
      </View>
    </SafeAreaView>
  );
}

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.offWhite },
  scroll: { padding: spacing.lg, alignItems: 'stretch' },
  iconWrap: { alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.md },
  title: { ...typography.h2, color: colors.navy900, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.gray600, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.xl },
  pnrCard: {
    backgroundColor: colors.navy900,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  pnrLabel: { ...typography.caption, color: colors.gray200 },
  pnr: { ...typography.h1, color: colors.amber500, letterSpacing: 4, marginTop: 4 },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray200,
    marginBottom: spacing.lg,
  },
  route: { ...typography.h3, color: colors.navy900 },
  detail: { ...typography.caption, color: colors.gray600, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.gray200, marginVertical: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  rowLabel: { ...typography.caption, color: colors.gray600 },
  rowValue: { ...typography.captionStrong, color: colors.navy900 },
  infoCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.teal100,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  infoText: { ...typography.caption, color: colors.navy800, flex: 1 },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.gray200, backgroundColor: colors.white },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
