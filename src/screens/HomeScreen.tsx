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
import { isoDateAddDays, todayISO } from '../services/journeyGenerator';
import { RecentSearch, SearchCriteria, TripType } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { LanguageToggle } from '../components/LanguageToggle';
import { useRecentSearches } from '../hooks/useRecentSearches';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

// Curated from real routes (routes.ts) — the display label is derived at
// render time from stations.ts's `city` field, so it's automatically
// correct (and language-agnostic) rather than hardcoded per-language here.
const PROMO_ROUTES = [
  { originId: 'par', destinationId: 'ams', from: 35 },
  { originId: 'lon', destinationId: 'par', from: 44 },
  { originId: 'par', destinationId: 'cgn', from: 35 },
];

const DEFAULT_TRIP_LENGTH_DAYS = 3;

export default function HomeScreen({ navigation }: Props) {
  const { criteria, setCriteria } = useAppState();
  const { t } = useTranslation();
  const { recentSearches, recordSearch, removeSearch, clear: clearRecentSearches } = useRecentSearches();
  const [pickerOpen, setPickerOpen] = useState<'origin' | 'destination' | null>(null);
  const [dateOpen, setDateOpen] = useState<'outbound' | 'return' | null>(null);
  const [passengerOpen, setPassengerOpen] = useState(false);

  const TRIP_TYPES: { id: TripType; label: string }[] = [
    { id: 'oneway', label: t.home.tripTypeOneway },
    { id: 'roundtrip', label: t.home.tripTypeRoundtrip },
  ];

  function formatDate(iso: string): string {
    const d = new Date(iso + 'T00:00:00');
    return `${t.weekdaysShort[d.getDay()]}, ${d.getDate()} ${t.monthsShort[d.getMonth()]}`;
  }

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

  // Quick-pick shortcuts so a common search ("today", "tomorrow", "this
  // weekend") doesn't require opening the full date picker sheet. Reuses
  // selectOutboundDate so round-trip return-date correction stays
  // consistent with picking a date the "long way" via the modal.
  const todayDateISO = todayISO();
  const todayDow = new Date(todayDateISO + 'T00:00:00').getDay(); // 0 Sun..6 Sat
  const daysUntilSaturday = (6 - todayDow + 7) % 7; // 0 if today is already Saturday
  // Keyed by a stable preset id, not by the computed date — "tomorrow" and
  // "weekend" (or "today" and "weekend", if today is Saturday) can land on
  // the exact same date, and keying by date would give two list items the
  // same React key, breaking reconciliation on selection.
  const QUICK_DATES: { id: string; date: string; label: string }[] = [
    { id: 'today', date: todayDateISO, label: t.home.quickToday },
    { id: 'tomorrow', date: isoDateAddDays(todayDateISO, 1), label: t.home.quickTomorrow },
    { id: 'weekend', date: isoDateAddDays(todayDateISO, daysUntilSaturday), label: t.home.quickWeekend },
  ];

  const search = () => {
    if (!routeExists) return;
    if (isRoundTrip && !criteria.returnDate) return;
    recordSearch(criteria);
    navigation.navigate('Results');
  };

  // Recent-search entries deliberately don't store a date (see RecentSearch
  // in src/types) — re-running one always re-dates it to today (and, for a
  // round trip, a fresh default-length return date) rather than replaying
  // whatever date it was originally searched for, which is very likely in
  // the past by the time someone taps it again.
  const applyRecentSearch = (entry: RecentSearch) => {
    const date = todayISO();
    const next: SearchCriteria = {
      ...criteria,
      originId: entry.originId,
      destinationId: entry.destinationId,
      tripType: entry.tripType,
      passengers: entry.passengers,
      wheelchairUser: entry.wheelchairUser,
      date,
      returnDate: entry.tripType === 'roundtrip' ? isoDateAddDays(date, DEFAULT_TRIP_LENGTH_DAYS) : null,
    };
    setCriteria(next);
    recordSearch(next);
    navigation.navigate('Results');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.brand}>EuroTrain</Text>
            <View style={styles.headerActions}>
              <Pressable
                onPress={() => navigation.navigate('Help')}
                style={styles.helpBtn}
                accessibilityRole="button"
                accessibilityLabel={t.home.helpButtonA11y}
                hitSlop={8}
              >
                <Ionicons name="help-circle-outline" size={22} color={colors.white} />
              </Pressable>
              <LanguageToggle />
            </View>
          </View>
          <Text style={styles.tagline}>{t.home.tagline}</Text>
        </View>

        <View style={styles.searchCard}>
          <View style={styles.tripTypeRow}>
            {TRIP_TYPES.map((tt) => (
              <Pressable
                key={tt.id}
                onPress={() => setTripType(tt.id)}
                style={[styles.tripTypeChip, criteria.tripType === tt.id && styles.tripTypeChipSelected]}
                accessibilityRole="button"
                accessibilityState={{ selected: criteria.tripType === tt.id }}
                accessibilityLabel={t.home.tripTypeSelectA11y(tt.label)}
              >
                <Text
                  style={[
                    styles.tripTypeLabel,
                    criteria.tripType === tt.id && styles.tripTypeLabelSelected,
                  ]}
                >
                  {tt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={styles.field}
            onPress={() => setPickerOpen('origin')}
            accessibilityRole="button"
            accessibilityLabel={t.home.originA11y}
          >
            <Ionicons name="radio-button-on" size={16} color={colors.teal500} />
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>{t.home.fromLabel}</Text>
              <Text style={styles.fieldValue}>{origin?.city ?? t.common.select}</Text>
            </View>
          </Pressable>

          <Pressable
            onPress={swap}
            style={styles.swapBtn}
            accessibilityRole="button"
            accessibilityLabel={t.home.swapA11y}
            hitSlop={10}
          >
            <Ionicons name="swap-vertical" size={18} color={colors.navy700} />
          </Pressable>

          <Pressable
            style={styles.field}
            onPress={() => setPickerOpen('destination')}
            accessibilityRole="button"
            accessibilityLabel={t.home.destinationA11y}
          >
            <Ionicons name="location" size={16} color={colors.garnet600} />
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>{t.home.toLabel}</Text>
              <Text style={styles.fieldValue}>{destination?.city ?? t.common.select}</Text>
            </View>
          </Pressable>

          <View style={styles.divider} />

          <View style={styles.quickDateRow}>
            {QUICK_DATES.map((qd) => {
              const active = criteria.date === qd.date;
              return (
                <Pressable
                  key={qd.id}
                  onPress={() => selectOutboundDate(qd.date)}
                  style={[styles.tripTypeChip, styles.quickDateChip, active && styles.tripTypeChipSelected]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={t.datePicker.dateChipA11y(qd.label)}
                >
                  <Text style={[styles.tripTypeLabel, active && styles.tripTypeLabelSelected]}>{qd.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.rowFields}>
            <Pressable
              style={[styles.field, styles.halfField]}
              onPress={() => setDateOpen('outbound')}
              accessibilityRole="button"
              accessibilityLabel={t.home.outboundDateA11y}
            >
              <Ionicons name="calendar-outline" size={16} color={colors.navy700} />
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>{isRoundTrip ? t.home.dateLabelOutbound : t.home.dateLabelOneway}</Text>
                <Text style={styles.fieldValue}>{formatDate(criteria.date)}</Text>
              </View>
            </Pressable>

            {isRoundTrip ? (
              <Pressable
                style={[styles.field, styles.halfField]}
                onPress={() => setDateOpen('return')}
                accessibilityRole="button"
                accessibilityLabel={t.home.returnDateA11y}
              >
                <Ionicons name="calendar-outline" size={16} color={colors.navy700} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>{t.home.returnLabel}</Text>
                  <Text style={styles.fieldValue}>
                    {criteria.returnDate ? formatDate(criteria.returnDate) : t.home.pickDate}
                  </Text>
                </View>
              </Pressable>
            ) : (
              <Pressable
                style={[styles.field, styles.halfField]}
                onPress={() => setPassengerOpen(true)}
                accessibilityRole="button"
                accessibilityLabel={t.home.editPassengersA11y}
              >
                <Ionicons name="people-outline" size={16} color={colors.navy700} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>{t.home.passengerLabel}</Text>
                  <Text style={styles.fieldValue}>{t.home.passengerCount(totalPassengers)}</Text>
                </View>
              </Pressable>
            )}
          </View>

          {isRoundTrip && (
            <Pressable
              style={styles.field}
              onPress={() => setPassengerOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={t.home.editPassengersA11y}
            >
              <Ionicons name="people-outline" size={16} color={colors.navy700} />
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>{t.home.passengerLabel}</Text>
                <Text style={styles.fieldValue}>{t.home.passengerCount(totalPassengers)}</Text>
              </View>
            </Pressable>
          )}

          {!routeExists && (
            <View style={styles.warning}>
              <Ionicons name="information-circle" size={16} color={colors.warning} />
              <Text style={styles.warningText}>{t.home.noRouteWarning}</Text>
            </View>
          )}

          <PrimaryButton
            label={t.home.searchButton}
            onPress={search}
            disabled={!routeExists}
            style={{ marginTop: spacing.lg }}
          />
        </View>

        {recentSearches.length > 0 && (
          <>
            <View style={styles.recentHeader}>
              <Text style={styles.recentSectionTitle}>{t.home.recentSearchesTitle}</Text>
              <Pressable
                onPress={clearRecentSearches}
                accessibilityRole="button"
                accessibilityLabel={t.home.recentSearchesClearA11y}
                hitSlop={8}
              >
                <Text style={styles.recentClearLabel}>{t.home.recentSearchesClear}</Text>
              </Pressable>
            </View>
            <View style={{ gap: spacing.sm, marginHorizontal: spacing.lg }}>
              {recentSearches.map((entry) => {
                const entryOrigin = stationById(entry.originId);
                const entryDestination = stationById(entry.destinationId);
                if (!entryOrigin || !entryDestination) return null;
                const routeLabel = `${entryOrigin.city} → ${entryDestination.city}`;
                const tripLabel =
                  entry.tripType === 'roundtrip' ? t.home.tripTypeRoundtrip : t.home.tripTypeOneway;
                const paxTotal = Object.values(entry.passengers).reduce((a, b) => a + b, 0);
                return (
                  <Pressable
                    key={entry.id}
                    style={styles.recentCard}
                    onPress={() => applyRecentSearch(entry)}
                    accessibilityRole="button"
                    accessibilityLabel={t.home.recentSearchEntryA11y(routeLabel)}
                  >
                    <Ionicons name="time-outline" size={20} color={colors.gray400} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.recentRoute}>{routeLabel}</Text>
                      <Text style={styles.recentMeta}>
                        {tripLabel} · {t.home.passengerCount(paxTotal)}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => removeSearch(entry.id)}
                      accessibilityRole="button"
                      accessibilityLabel={t.home.recentSearchesRemoveA11y(routeLabel)}
                      hitSlop={10}
                      style={styles.recentRemoveBtn}
                    >
                      <Ionicons name="close" size={18} color={colors.gray400} />
                    </Pressable>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>{t.home.popularRoutes}</Text>
        <View style={{ gap: spacing.sm }}>
          {PROMO_ROUTES.map((p) => {
            const promoOrigin = stationById(p.originId);
            const promoDestination = stationById(p.destinationId);
            return (
              <Pressable
                key={`${p.originId}-${p.destinationId}`}
                style={styles.promoCard}
                onPress={() => {
                  // Was only updating the search fields in the background
                  // with no navigation, so tapping a card looked like it
                  // did nothing. PROMO_ROUTES are curated from real routes
                  // (routes.ts), so no routeExists re-check is needed here
                  // the way the main "Sefer ara" button needs one.
                  const next = { ...criteria, originId: p.originId, destinationId: p.destinationId };
                  setCriteria(next);
                  recordSearch(next);
                  navigation.navigate('Results');
                }}
                accessibilityRole="button"
              >
                <View>
                  <Text style={styles.promoLabel}>
                    {promoOrigin?.city} → {promoDestination?.city}
                  </Text>
                  <Text style={styles.promoFrom}>{t.home.promoFrom(p.from)}</Text>
                </View>
                <Ionicons name="arrow-forward-circle" size={26} color={colors.amber500} />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <StationPickerModal
        visible={pickerOpen === 'origin'}
        onClose={() => setPickerOpen(null)}
        title={t.home.originPickerTitle}
        excludeId={criteria.destinationId}
        onSelect={(s) => setCriteria((c) => ({ ...c, originId: s.id }))}
      />
      <StationPickerModal
        visible={pickerOpen === 'destination'}
        onClose={() => setPickerOpen(null)}
        title={t.home.destinationPickerTitle}
        excludeId={criteria.originId}
        onSelect={(s) => setCriteria((c) => ({ ...c, destinationId: s.id }))}
      />
      <DatePickerModal
        visible={dateOpen === 'outbound'}
        onClose={() => setDateOpen(null)}
        value={criteria.date}
        onSelect={selectOutboundDate}
        title={t.home.outboundDatePickerTitle}
      />
      <DatePickerModal
        visible={dateOpen === 'return'}
        onClose={() => setDateOpen(null)}
        value={criteria.returnDate ?? criteria.date}
        onSelect={(returnDate) => setCriteria((c) => ({ ...c, returnDate }))}
        minDateISO={criteria.date}
        title={t.home.returnDatePickerTitle}
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
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { ...typography.h1, color: colors.white },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  helpBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  quickDateRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.sm },
  quickDateChip: { flex: 1, alignItems: 'center' },
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
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.xl,
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  recentSectionTitle: { ...typography.h3, color: colors.white },
  recentClearLabel: { ...typography.captionStrong, color: colors.amber500 },
  recentCard: {
    backgroundColor: colors.navy700,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  recentRoute: { ...typography.bodyStrong, color: colors.white },
  recentMeta: { ...typography.caption, color: colors.gray200, marginTop: 2 },
  recentRemoveBtn: { padding: spacing.xs },
});
