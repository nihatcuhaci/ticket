import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme';
import { PrimaryButton } from '../components/ui';
import { StationPickerModal } from '../components/StationPickerModal';
import { PassengerPickerModal } from '../components/PassengerPickerModal';
import { DatePickerModal } from '../components/DatePickerModal';
import { useAppState } from '../state/AppState';
import { stationById } from '../data/stations';
import { findRoute } from '../data/routes';
import { isoDateAddDays } from '../services/journeyGenerator';
import { TripType } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const WEEKDAYS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

const PROMO_ROUTES = [
  { originId: 'par', destinationId: 'ams', label: 'Paris → Amsterdam', from: 35 },
  { originId: 'lon', destinationId: 'par', label: 'Londra → Paris', from: 44 },
  { originId: 'par', destinationId: 'cgn', label: 'Paris → Köln', from: 35 },
];

const TRIP_TYPES: { id: TripType; label: string }[] = [
  { id: 'oneway', label: 'Tek yön' },
  { id: 'roundtrip', label: 'Gidiş - dönüş' },
];

const DEFAULT_TRIP_LENGTH_DAYS = 3;

export default function HomeScreen({ navigation }: Props) {
  const { criteria, setCriteria } = useAppState();
  const [pickerOpen, setPickerOpen] = useState<'origin' | 'destination' | null>(null);
  const [dateOpen, setDateOpen] = useState<'outbound' | 'return' | null>(null);
  const [passengerOpen, setPassengerOpen] = useState(false);

  const origin = stationById(criteria.originId);
  const destination = stationById(criteria.destinationId);
  const routeExists = !!findRoute(criteria.originId, criteria.destinationId);
  const totalPassengers = Object.values(criteria.passengers).reduce((a, b) => a + b, 0);
  const isRoundTrip = criteria.tripType === 'roundtrip';

  const swap = () =>
    setCriteria((c) => ({ ...c, originId: c.destinationId, destinationId: c.originId }));

  const setTripType = (tripType: TripType) => {
    setCriteria((c) => {
      if (tripType === 'roundtrip' && (!c.returnDate || c.returnDate <= c.date)) {
        return { ...c, tripType, returnDate: isoDateAddDays(c.date, DEFAULT_TRIP_LENGTH_DAYS) };
      }
      return { ...c, tripType };
    });
  };

  const selectOutboundDate = (date: string) => {
    setCriteria((c) => {
      const next = { ...c, date };
      // Keep the return date valid if it would now fall on/before the new outbound date.
      if (c.tripType === 'roundtrip' && c.returnDate && c.returnDate <= date) {
        next.returnDate = isoDateAddDays(date, DEFAULT_TRIP_LENGTH_DAYS);
      }
      return next;
    });
  };

  const search = () => {
    if (!routeExists) return;
    if (isRoundTrip && !criteria.returnDate) return;
    navigation.navigate('Results');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.brand}>EuroTrain</Text>
          <Text style={styles.tagline}>Avrupa'yı trenle keşfedin</Text>
        </View>

        <View style={styles.searchCard}>
          <View style={styles.tripTypeRow}>
            {TRIP_TYPES.map((t) => (
              <Pressable
                key={t.id}
                onPress={() => setTripType(t.id)}
                style={[styles.tripTypeChip, criteria.tripType === t.id && styles.tripTypeChipSelected]}
                accessibilityRole="button"
                accessibilityState={{ selected: criteria.tripType === t.id }}
                accessibilityLabel={`${t.label} seçeneğini seç`}
              >
                <Text
                  style={[
                    styles.tripTypeLabel,
                    criteria.tripType === t.id && styles.tripTypeLabelSelected,
                  ]}
                >
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={styles.field}
            onPress={() => setPickerOpen('origin')}
            accessibilityRole="button"
            accessibilityLabel="Kalkış istasyonu seç"
          >
            <Ionicons name="radio-button-on" size={16} color={colors.teal500} />
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Nereden</Text>
              <Text style={styles.fieldValue}>{origin?.city ?? 'Seçin'}</Text>
            </View>
          </Pressable>

          <Pressable
            onPress={swap}
            style={styles.swapBtn}
            accessibilityRole="button"
            accessibilityLabel="Kalkış ve varışı yer değiştir"
            hitSlop={10}
          >
            <Ionicons name="swap-vertical" size={18} color={colors.navy700} />
          </Pressable>

          <Pressable
            style={styles.field}
            onPress={() => setPickerOpen('destination')}
            accessibilityRole="button"
            accessibilityLabel="Varış istasyonu seç"
          >
            <Ionicons name="location" size={16} color={colors.garnet600} />
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Nereye</Text>
              <Text style={styles.fieldValue}>{destination?.city ?? 'Seçin'}</Text>
            </View>
          </Pressable>

          <View style={styles.divider} />

          <View style={styles.rowFields}>
            <Pressable
              style={[styles.field, styles.halfField]}
              onPress={() => setDateOpen('outbound')}
              accessibilityRole="button"
              accessibilityLabel="Gidiş tarihini seç"
            >
              <Ionicons name="calendar-outline" size={16} color={colors.navy700} />
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>{isRoundTrip ? 'Gidiş' : 'Tarih'}</Text>
                <Text style={styles.fieldValue}>{formatDate(criteria.date)}</Text>
              </View>
            </Pressable>

            {isRoundTrip ? (
              <Pressable
                style={[styles.field, styles.halfField]}
                onPress={() => setDateOpen('return')}
                accessibilityRole="button"
                accessibilityLabel="Dönüş tarihini seç"
              >
                <Ionicons name="calendar-outline" size={16} color={colors.navy700} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Dönüş</Text>
                  <Text style={styles.fieldValue}>
                    {criteria.returnDate ? formatDate(criteria.returnDate) : 'Tarih seçin'}
                  </Text>
                </View>
              </Pressable>
            ) : (
              <Pressable
                style={[styles.field, styles.halfField]}
                onPress={() => setPassengerOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="Yolcu sayısını düzenle"
              >
                <Ionicons name="people-outline" size={16} color={colors.navy700} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Yolcu</Text>
                  <Text style={styles.fieldValue}>{totalPassengers} yolcu</Text>
                </View>
              </Pressable>
            )}
          </View>

          {isRoundTrip && (
            <Pressable
              style={styles.field}
              onPress={() => setPassengerOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Yolcu sayısını düzenle"
            >
              <Ionicons name="people-outline" size={16} color={colors.navy700} />
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Yolcu</Text>
                <Text style={styles.fieldValue}>{totalPassengers} yolcu</Text>
              </View>
            </Pressable>
          )}

          {!routeExists && (
            <View style={styles.warning}>
              <Ionicons name="information-circle" size={16} color={colors.warning} />
              <Text style={styles.warningText}>
                Bu iki istasyon arasında doğrudan EuroTrain seferi bulunmuyor. Lütfen farklı bir
                güzergah deneyin.
              </Text>
            </View>
          )}

          <PrimaryButton
            label="Sefer ara"
            onPress={search}
            disabled={!routeExists}
            style={{ marginTop: spacing.lg }}
          />
        </View>

        <Text style={styles.sectionTitle}>Popüler güzergahlar</Text>
        <View style={{ gap: spacing.sm }}>
          {PROMO_ROUTES.map((p) => (
            <Pressable
              key={p.label}
              style={styles.promoCard}
              onPress={() => {
                setCriteria((c) => ({ ...c, originId: p.originId, destinationId: p.destinationId }));
              }}
              accessibilityRole="button"
            >
              <View>
                <Text style={styles.promoLabel}>{p.label}</Text>
                <Text style={styles.promoFrom}>€{p.from}'dan başlayan fiyatlarla</Text>
              </View>
              <Ionicons name="arrow-forward-circle" size={26} color={colors.amber500} />
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <StationPickerModal
        visible={pickerOpen === 'origin'}
        onClose={() => setPickerOpen(null)}
        title="Kalkış istasyonu"
        excludeId={criteria.destinationId}
        onSelect={(s) => setCriteria((c) => ({ ...c, originId: s.id }))}
      />
      <StationPickerModal
        visible={pickerOpen === 'destination'}
        onClose={() => setPickerOpen(null)}
        title="Varış istasyonu"
        excludeId={criteria.originId}
        onSelect={(s) => setCriteria((c) => ({ ...c, destinationId: s.id }))}
      />
      <DatePickerModal
        visible={dateOpen === 'outbound'}
        onClose={() => setDateOpen(null)}
        value={criteria.date}
        onSelect={selectOutboundDate}
        title="Gidiş tarihi seçin"
      />
      <DatePickerModal
        visible={dateOpen === 'return'}
        onClose={() => setDateOpen(null)}
        value={criteria.returnDate ?? criteria.date}
        onSelect={(returnDate) => setCriteria((c) => ({ ...c, returnDate }))}
        minDateISO={criteria.date}
        title="Dönüş tarihi seçin"
      />
      <PassengerPickerModal
        visible={passengerOpen}
        onClose={() => setPassengerOpen(false)}
        value={criteria.passengers}
        wheelchairUser={criteria.wheelchairUser}
        onChange={(passengers) => setCriteria((c) => ({ ...c, passengers }))}
        onChangeWheelchair={(wheelchairUser) => setCriteria((c) => ({ ...c, wheelchairUser }))}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.navy900 },
  scroll: { paddingBottom: spacing.xxxl },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxl },
  brand: { ...typography.h1, color: colors.white },
  tagline: { ...typography.body, color: colors.gray200, marginTop: spacing.xs },
  searchCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  tripTypeRow: { flexDirection: 'row', gap: spacing.xs, paddingTop: spacing.sm, paddingBottom: spacing.xs },
  tripTypeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.offWhite,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  tripTypeChipSelected: { backgroundColor: colors.navy800, borderColor: colors.navy800 },
  tripTypeLabel: { ...typography.captionStrong, color: colors.navy700 },
  tripTypeLabelSelected: { color: colors.white },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  fieldLabel: { ...typography.tiny, color: colors.gray600, textTransform: 'uppercase' },
  fieldValue: { ...typography.bodyStrong, color: colors.navy900, marginTop: 2 },
  swapBtn: {
    position: 'absolute',
    right: spacing.md,
    top: 90,
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.offWhite,
    borderWidth: 1,
    borderColor: colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  divider: { height: 1, backgroundColor: colors.gray200, marginVertical: spacing.xs },
  rowFields: { flexDirection: 'row', gap: spacing.md },
  halfField: { flex: 1 },
  warning: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: '#FCF3E3',
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    alignItems: 'flex-start',
  },
  warningText: { ...typography.caption, color: colors.warning, flex: 1 },
  sectionTitle: {
    ...typography.h3,
    color: colors.white,
    marginHorizontal: spacing.xl,
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  promoCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.navy700,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promoLabel: { ...typography.bodyStrong, color: colors.white },
  promoFrom: { ...typography.caption, color: colors.gray200, marginTop: 2 },
});
