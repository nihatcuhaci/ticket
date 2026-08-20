import React, { useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme';
import { useAppState } from '../state/AppState';
import { stationById } from '../data/stations';
import { fareClassById } from '../data/fareClasses';
import { PrimaryButton, SecondaryButton } from '../components/ui';
import { buildEurostarSearchUrl } from '../services/eurostarLink';
import { SelectedFare } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Confirmation'>;

const LegCard: React.FC<{ label?: string; leg: SelectedFare }> = ({ label, leg }) => {
  const origin = stationById(leg.journey.originId);
  const destination = stationById(leg.journey.destinationId);
  const fareClass = fareClassById(leg.fareClassId);
  return (
    <View style={styles.card}>
      {label && <Text style={styles.cardLegLabel}>{label}</Text>}
      <Text style={styles.route}>
        {origin?.city} → {destination?.city}
      </Text>
      <Text style={styles.detail}>
        {leg.journey.date} · {leg.journey.departureTime} - {leg.journey.arrivalTime}
      </Text>
      <View style={styles.divider} />
      <Row label="Sınıf" value={fareClass?.label ?? ''} />
      <Row label="Bu uygulamadaki tahmini fiyat" value={`€${leg.price}`} />
    </View>
  );
};

export default function ConfirmationScreen({ navigation }: Props) {
  const { criteria, selection, returnSelection, resetBooking } = useAppState();
  const [reopening, setReopening] = useState(false);
  const isRoundTrip = criteria.tripType === 'roundtrip';

  if (!selection) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={typography.body as any}>Seçili bir sefer bulunamadı.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const reopenEurostar = async () => {
    const url = buildEurostarSearchUrl(
      selection.journey.originId,
      selection.journey.destinationId,
      selection.journey.date,
      criteria.passengers,
      isRoundTrip ? returnSelection?.journey.date : null
    );
    if (!url) return;
    setReopening(true);
    try {
      await Linking.openURL(url);
    } catch (e) {
      Alert.alert('Açılamadı', 'eurostar.com şu anda açılamadı. Lütfen tekrar deneyin.');
    } finally {
      setReopening(false);
    }
  };

  const startNewSearch = () => {
    resetBooking();
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.iconWrap}>
          <Ionicons name="open-outline" size={64} color={colors.teal500} />
        </View>
        <Text style={styles.title}>Eurostar.com'a yönlendirildiniz</Text>
        <Text style={styles.subtitle}>
          Güncel fiyatı ve koltuk uygunluğunu görüp satın alma işlemini eurostar.com'da tamamlayabilirsiniz.
        </Text>

        <LegCard label={isRoundTrip ? 'Gidiş' : undefined} leg={selection} />
        {isRoundTrip && returnSelection && <LegCard label="Dönüş" leg={returnSelection} />}

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={18} color={colors.navy700} />
          <Text style={styles.infoText}>
            EuroTrain herhangi bir ödeme almadı veya bilet oluşturmadı. Satın alma, açılan sekmede
            Eurostar'ın kendi sitesinde gerçekleşir.
          </Text>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <SecondaryButton label="Eurostar.com'u tekrar aç" onPress={reopenEurostar} loading={reopening} />
        <PrimaryButton label="Yeni arama yap" onPress={startNewSearch} style={{ marginTop: spacing.sm }} />
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
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray200,
    marginBottom: spacing.lg,
  },
  cardLegLabel: {
    ...typography.tiny,
    color: colors.teal500,
    textTransform: 'uppercase',
    marginBottom: 4,
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
