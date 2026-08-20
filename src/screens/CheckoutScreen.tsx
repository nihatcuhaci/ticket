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
import { useExchangeRates } from '../hooks/useExchangeRates';
import { convert, formatCurrency } from '../services/currencyService';
import { SelectedFare } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

const TripLegCard: React.FC<{ label?: string; leg: SelectedFare }> = ({ label, leg }) => {
  const origin = stationById(leg.journey.originId);
  const destination = stationById(leg.journey.destinationId);
  const fareClass = fareClassById(leg.fareClassId);
  return (
    <View style={styles.tripCard}>
      {label && <Text style={styles.tripLegLabel}>{label}</Text>}
      <Text style={styles.tripRoute}>
        {origin?.city} → {destination?.city}
      </Text>
      <Text style={styles.tripDetail}>
        {leg.journey.date} · {leg.journey.departureTime}-{leg.journey.arrivalTime} · {fareClass?.label}
      </Text>
    </View>
  );
};

export default function CheckoutScreen({ navigation }: Props) {
  const { criteria, selection, returnSelection } = useAppState();
  const { rates } = useExchangeRates();
  const [opening, setOpening] = useState(false);
  const isRoundTrip = criteria.tripType === 'roundtrip';

  const totalEUR = (selection?.price ?? 0) + (isRoundTrip ? returnSelection?.price ?? 0 : 0);
  const totalLabel = rates ? formatCurrency(convert(totalEUR, 'EUR', rates), 'EUR') : `€${totalEUR}`;

  const handleContinue = async () => {
    if (!selection) return;
    const url = buildEurostarSearchUrl(
      selection.journey.originId,
      selection.journey.destinationId,
      selection.journey.date,
      criteria.passengers,
      isRoundTrip ? returnSelection?.journey.date : null
    );
    if (!url) {
      Alert.alert('Yönlendirilemedi', 'Bu güzergah için eurostar.com bağlantısı oluşturulamadı.');
      return;
    }
    setOpening(true);
    try {
      await Linking.openURL(url);
      navigation.replace('Confirmation');
    } catch (e) {
      Alert.alert('Açılamadı', 'eurostar.com şu anda açılamadı. Lütfen tekrar deneyin.');
    } finally {
      setOpening(false);
    }
  };

  if (!selection) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerState}>
          <Text style={typography.body as any}>Önce bir sefer seçmelisiniz.</Text>
          <PrimaryButton label="Aramaya dön" onPress={() => navigation.navigate('Home')} style={{ marginTop: spacing.lg }} />
        </View>
      </SafeAreaView>
    );
  }

  if (isRoundTrip && !returnSelection) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerState}>
          <Text style={typography.body as any}>Önce dönüş seferini de seçmelisiniz.</Text>
          <SecondaryButton label="Sonuçlara dön" onPress={() => navigation.goBack()} style={{ marginTop: spacing.lg }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TripLegCard label={isRoundTrip ? 'Gidiş' : undefined} leg={selection} />
        {isRoundTrip && returnSelection && <TripLegCard label="Dönüş" leg={returnSelection} />}

        <Text style={styles.sectionTitle}>Fiyat özeti</Text>
        <View style={styles.formCard}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              Bu uygulamada gösterilen tahmini {isRoundTrip ? 'toplam ' : ''}fiyat
            </Text>
            <Text style={styles.priceValue}>{totalLabel}</Text>
          </View>
          <Text style={styles.priceNote}>
            Kesin fiyat, koltuk uygunluğu ve varsa promosyonlar eurostar.com üzerinde değişiklik gösterebilir.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={18} color={colors.navy700} />
          <Text style={styles.infoText}>
            EuroTrain, ödeme veya bilet ihracı yapmaz. "Eurostar.com'da devam et" seçildiğinde aynı
            güzergah, {isRoundTrip ? 'gidiş-dönüş tarihleri' : 'tarih'} ve yolcu sayısıyla
            eurostar.com'un gerçek arama sonuçlarına yönlendirilirsiniz; satın alma işlemi tamamen
            Eurostar'ın kendi sitesinde, kendi güvenli ödeme altyapısıyla tamamlanır.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerTotalRow}>
          <Text style={styles.totalLabel}>Tahmini toplam</Text>
          <Text style={styles.totalPrice}>{totalLabel}</Text>
        </View>
        <PrimaryButton label="Eurostar.com'da devam et" onPress={handleContinue} loading={opening} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.offWhite },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  tripCard: {
    backgroundColor: colors.navy900,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  tripLegLabel: {
    ...typography.tiny,
    color: colors.amber500,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  tripRoute: { ...typography.h3, color: colors.white },
  tripDetail: { ...typography.caption, color: colors.gray200, marginTop: spacing.xs },
  sectionTitle: { ...typography.h3, color: colors.navy900, marginBottom: spacing.sm, marginTop: spacing.md },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray200,
    marginBottom: spacing.xl,
    gap: 4,
  },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  priceLabel: { ...typography.caption, color: colors.gray600, flex: 1, marginRight: spacing.md },
  priceValue: { ...typography.h2, color: colors.navy900 },
  priceNote: { ...typography.tiny, color: colors.gray400, marginTop: spacing.sm },
  infoCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.teal100,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  infoText: { ...typography.caption, color: colors.navy800, flex: 1 },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    backgroundColor: colors.white,
    gap: spacing.sm,
  },
  footerTotalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  totalLabel: { ...typography.caption, color: colors.gray600 },
  totalPrice: { ...typography.h2, color: colors.navy900 },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
});
