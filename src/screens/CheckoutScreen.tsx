import React, { useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme';
import { useAppState } from '../state/AppState';
import { stationById } from '../data/stations';
import { getFareClassById } from '../data/fareClasses';
import { PrimaryButton, SecondaryButton } from '../components/ui';
import { buildBookingSearchUrl } from '../services/bookingLink';
import { useExchangeRates } from '../hooks/useExchangeRates';
import { convert, formatCurrency } from '../services/currencyService';
import { SelectedFare } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { Language } from '../i18n/translations';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

const TripLegCard: React.FC<{ label?: string; leg: SelectedFare; language: Language }> = ({
  label,
  leg,
  language,
}) => {
  const origin = stationById(leg.journey.originId);
  const destination = stationById(leg.journey.destinationId);
  const fareClass = getFareClassById(leg.fareClassId, language);
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
  const { t, language } = useTranslation();
  const { rates } = useExchangeRates();
  const [opening, setOpening] = useState(false);
  const isRoundTrip = criteria.tripType === 'roundtrip';

  const totalEUR = (selection?.price ?? 0) + (isRoundTrip ? returnSelection?.price ?? 0 : 0);
  const totalLabel = rates ? formatCurrency(convert(totalEUR, 'EUR', rates), 'EUR') : `€${totalEUR}`;

  const handleContinue = async () => {
    if (!selection) return;
    const url = buildBookingSearchUrl(
      selection.journey.originId,
      selection.journey.destinationId,
      selection.journey.date,
      criteria.passengers,
      isRoundTrip ? returnSelection?.journey.date : null
    );
    if (!url) {
      Alert.alert(t.checkout.cantRedirectTitle, t.checkout.cantRedirectText);
      return;
    }
    setOpening(true);
    try {
      await Linking.openURL(url);
      navigation.replace('Confirmation');
    } catch (e) {
      Alert.alert(t.checkout.cantOpenTitle, t.checkout.cantOpenText);
    } finally {
      setOpening(false);
    }
  };

  if (!selection) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerState}>
          <Text style={typography.body as any}>{t.checkout.needSelectionText}</Text>
          <PrimaryButton
            label={t.checkout.backToSearch}
            onPress={() => navigation.navigate('Home')}
            style={{ marginTop: spacing.lg }}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (isRoundTrip && !returnSelection) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerState}>
          <Text style={typography.body as any}>{t.checkout.needReturnSelectionText}</Text>
          <SecondaryButton
            label={t.checkout.backToResults}
            onPress={() => navigation.goBack()}
            style={{ marginTop: spacing.lg }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TripLegCard label={isRoundTrip ? t.checkout.legOutbound : undefined} leg={selection} language={language} />
        {isRoundTrip && returnSelection && (
          <TripLegCard label={t.checkout.legReturn} leg={returnSelection} language={language} />
        )}

        <Text style={styles.sectionTitle}>{t.checkout.sectionTitle}</Text>
        <View style={styles.formCard}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>{t.checkout.priceLabel(isRoundTrip)}</Text>
            <Text style={styles.priceValue}>{totalLabel}</Text>
          </View>
          <Text style={styles.priceNote}>{t.checkout.priceNote}</Text>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={18} color={colors.navy700} />
          <Text style={styles.infoText}>
            {t.checkout.infoText(
              isRoundTrip ? t.checkout.infoTextDateWordRoundtrip : t.checkout.infoTextDateWordOneway
            )}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerTotalRow}>
          <Text style={styles.totalLabel}>{t.checkout.totalLabel}</Text>
          <Text style={styles.totalPrice}>{totalLabel}</Text>
        </View>
        <PrimaryButton label={t.checkout.continueButton} onPress={handleContinue} loading={opening} />
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
