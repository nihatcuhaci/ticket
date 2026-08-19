import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme';
import { useAppState } from '../state/AppState';
import { stationById } from '../data/stations';
import { fareClassById } from '../data/fareClasses';
import { PaymentMethodId } from '../types';
import { PrimaryButton } from '../components/ui';
import { submitBooking } from '../services/bookingService';
import { useExchangeRates } from '../hooks/useExchangeRates';
import { convert, formatCurrency } from '../services/currencyService';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

const PAYMENT_METHODS: { id: PaymentMethodId; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'card', label: 'Kredi / Banka Kartı', icon: 'card-outline' },
  { id: 'apple_pay', label: 'Apple Pay', icon: 'logo-apple' },
  { id: 'paypal', label: 'PayPal', icon: 'logo-paypal' },
];

export default function CheckoutScreen({ navigation }: Props) {
  const { selection, passenger, setPassenger, setConfirmation } = useAppState();
  const { rates } = useExchangeRates();
  const [payment, setPayment] = useState<PaymentMethodId>('card');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const origin = selection ? stationById(selection.journey.originId) : undefined;
  const destination = selection ? stationById(selection.journey.destinationId) : undefined;
  const fareClass = selection ? fareClassById(selection.fareClassId) : undefined;

  const totalEUR = selection?.price ?? 0;
  const totalLabel = rates ? formatCurrency(convert(totalEUR, 'EUR', rates), 'EUR') : `€${totalEUR}`;

  const validate = () => {
    const next: Record<string, string> = {};
    if (!passenger.firstName.trim()) next.firstName = 'Ad gerekli';
    if (!passenger.lastName.trim()) next.lastName = 'Soyad gerekli';
    if (!/^\S+@\S+\.\S+$/.test(passenger.email)) next.email = 'Geçerli bir e-posta girin';
    if (!acceptedTerms) next.terms = 'Devam etmek için şartları kabul edin';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handlePay = async () => {
    if (!selection) return;
    if (!validate()) return;
    setSubmitting(true);
    try {
      const confirmation = await submitBooking(selection, passenger, payment, totalEUR, 'EUR');
      setConfirmation(confirmation);
      navigation.replace('Confirmation');
    } catch (e) {
      Alert.alert(
        'Ödeme alınamadı',
        'Bu bir demo ödeme akışıdır ve rastgele başarısız olabilir. Lütfen tekrar deneyin.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!selection || !origin || !destination || !fareClass) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerState}>
          <Text style={typography.body as any}>Önce bir sefer seçmelisiniz.</Text>
          <PrimaryButton label="Aramaya dön" onPress={() => navigation.navigate('Home')} style={{ marginTop: spacing.lg }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.tripCard}>
          <Text style={styles.tripRoute}>
            {origin.city} → {destination.city}
          </Text>
          <Text style={styles.tripDetail}>
            {selection.journey.date} · {selection.journey.departureTime}-{selection.journey.arrivalTime} ·{' '}
            {fareClass.label}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Yolcu bilgileri</Text>
        <View style={styles.formCard}>
          <View style={styles.rowFields}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Ad</Text>
              <TextInput
                value={passenger.firstName}
                onChangeText={(v) => setPassenger({ ...passenger, firstName: v })}
                style={[styles.input, errors.firstName && styles.inputError]}
                placeholder="Ad"
              />
              {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Soyad</Text>
              <TextInput
                value={passenger.lastName}
                onChangeText={(v) => setPassenger({ ...passenger, lastName: v })}
                style={[styles.input, errors.lastName && styles.inputError]}
                placeholder="Soyad"
              />
              {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
            </View>
          </View>

          <Text style={styles.label}>E-posta</Text>
          <TextInput
            value={passenger.email}
            onChangeText={(v) => setPassenger({ ...passenger, email: v })}
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="ornek@eposta.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <Text style={styles.label}>Telefon (opsiyonel)</Text>
          <TextInput
            value={passenger.phone}
            onChangeText={(v) => setPassenger({ ...passenger, phone: v })}
            style={styles.input}
            placeholder="+90 5xx xxx xx xx"
            keyboardType="phone-pad"
          />
        </View>

        <Text style={styles.sectionTitle}>Ödeme yöntemi</Text>
        <View style={styles.paymentRow}>
          {PAYMENT_METHODS.map((m) => (
            <Pressable
              key={m.id}
              onPress={() => setPayment(m.id)}
              style={[styles.paymentChip, payment === m.id && styles.paymentChipSelected]}
              accessibilityRole="button"
            >
              <Ionicons name={m.icon} size={18} color={payment === m.id ? colors.white : colors.navy700} />
              <Text style={[styles.paymentLabel, payment === m.id && styles.textOnSelected]}>{m.label}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.demoNote}>
          Bu bir demo ödeme akışıdır — gerçek kart bilgisi istenmez veya saklanmaz.
        </Text>

        <Pressable
          style={styles.termsRow}
          onPress={() => setAcceptedTerms((v) => !v)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: acceptedTerms }}
        >
          <Ionicons
            name={acceptedTerms ? 'checkbox' : 'square-outline'}
            size={22}
            color={acceptedTerms ? colors.teal500 : colors.gray400}
          />
          <Text style={styles.termsText}>Şartlar ve Koşullar ile Bilet Koşullarını kabul ediyorum.</Text>
        </Pressable>
        {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerTotalRow}>
          <Text style={styles.totalLabel}>Toplam</Text>
          <Text style={styles.totalPrice}>{totalLabel}</Text>
        </View>
        <PrimaryButton label="Öde ve rezervasyonu tamamla" onPress={handlePay} loading={submitting} />
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
    marginBottom: spacing.xl,
    marginTop: spacing.xs,
  },
  tripRoute: { ...typography.h3, color: colors.white },
  tripDetail: { ...typography.caption, color: colors.gray200, marginTop: spacing.xs },
  sectionTitle: { ...typography.h3, color: colors.navy900, marginBottom: spacing.sm },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray200,
    marginBottom: spacing.xl,
    gap: 4,
  },
  rowFields: { flexDirection: 'row', gap: spacing.md },
  label: { ...typography.captionStrong, color: colors.gray600, marginTop: spacing.md, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    ...typography.body,
    color: colors.navy900,
  },
  inputError: { borderColor: colors.error },
  errorText: { ...typography.tiny, color: colors.error, marginTop: 4 },
  paymentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xs },
  paymentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.gray200,
    backgroundColor: colors.white,
  },
  paymentChipSelected: { backgroundColor: colors.navy800, borderColor: colors.navy800 },
  paymentLabel: { ...typography.captionStrong, color: colors.navy700 },
  textOnSelected: { color: colors.white },
  demoNote: { ...typography.tiny, color: colors.gray400, marginTop: spacing.sm, marginBottom: spacing.xl },
  termsRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  termsText: { ...typography.caption, color: colors.gray600, flex: 1 },
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
