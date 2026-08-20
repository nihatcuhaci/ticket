import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme';
import { useAppState } from '../state/AppState';
import { stationById } from '../data/stations';
import { findRoute } from '../data/routes';
import { generateJourneys, todayISO } from '../services/journeyGenerator';
import { getLiveJourneys, getLiveScheduleFreshness } from '../services/liveScheduleService';
import { FareClassId, Journey } from '../types';
import { DateStrip } from '../components/DateStrip';
import { JourneyCard } from '../components/JourneyCard';
import { FareDetailsSheet } from '../components/FareDetailsSheet';
import { CurrencyToggle } from '../components/CurrencyToggle';
import { PrimaryButton, SecondaryButton } from '../components/ui';
import { useExchangeRates } from '../hooks/useExchangeRates';
import { CurrencyCode, convert, formatCurrency } from '../services/currencyService';
import { fareClassById } from '../data/fareClasses';

/** "3 dk önce" / "2 sa önce" — coarse relative freshness label for the live-schedule badge. */
function relativeFreshness(iso: string): string {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return 'az önce';
  if (minutes < 60) return `${minutes} dk önce`;
  const hours = Math.round(minutes / 60);
  return `${hours} sa önce`;
}

type Props = NativeStackScreenProps<RootStackParamList, 'Results'>;
type LoadState = 'loading' | 'ready' | 'error';
type Leg = 'outbound' | 'return';

export default function ResultsScreen({ navigation }: Props) {
  const { criteria, setCriteria, selection, setSelection, returnSelection, setReturnSelection } =
    useAppState();
  const { rates, loading: ratesLoading } = useExchangeRates();
  const [currency, setCurrency] = useState<CurrencyCode>('EUR');
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [conditionsFor, setConditionsFor] = useState<FareClassId | null>(null);
  const [pendingFareJourney, setPendingFareJourney] = useState<Journey | null>(null);
  const [reloadTick, setReloadTick] = useState(0);
  const [leg, setLeg] = useState<Leg>('outbound');
  const [liveFreshness, setLiveFreshness] = useState<{ generatedAt: string } | null>(null);
  const [hasLiveJourneys, setHasLiveJourneys] = useState(false);

  const isRoundTrip = criteria.tripType === 'roundtrip';

  // Everything below is scoped to whichever leg is currently being shopped
  // — outbound origin->destination, or (for a round trip's second step)
  // the reverse direction on the return date. Same screen, same
  // components, just re-pointed at a different origin/destination/date —
  // this mirrors the Outbound -> Return step pattern observed on the real
  // eurostar.com booking flow.
  const legOriginId = leg === 'outbound' ? criteria.originId : criteria.destinationId;
  const legDestinationId = leg === 'outbound' ? criteria.destinationId : criteria.originId;
  const legDate = leg === 'outbound' ? criteria.date : criteria.returnDate ?? criteria.date;
  const currentSelection = leg === 'outbound' ? selection : returnSelection;
  const setCurrentSelection = leg === 'outbound' ? setSelection : setReturnSelection;

  const origin = stationById(legOriginId);
  const destination = stationById(legDestinationId);
  const route = useMemo(
    () => findRoute(legOriginId, legDestinationId),
    [legOriginId, legDestinationId]
  );

  useEffect(() => {
    if (!route) {
      setLoadState('error');
      return;
    }
    let cancelled = false;
    setLoadState('loading');
    const timer = setTimeout(() => {
      // Deterministic, occasional simulated network failure so the error
      // state is reachable in a demo rather than only existing on paper.
      const failureSeed = `${legOriginId}${legDestinationId}${legDate}${reloadTick}`;
      const shouldFail = reloadTick === 0 && failureSeed.length % 17 === 0;
      if (shouldFail) {
        setLoadState('error');
        return;
      }
      // Try Eurostar's real GTFS-sourced departures first; fall back to
      // the synthetic generator when there's no live coverage for this
      // route/date (unreachable feed, placeholder repo not yet
      // configured, or a connection this feed doesn't model — see
      // liveScheduleService.ts).
      getLiveJourneys(route, legDate).then((live) => {
        if (cancelled) return;
        const usingLive = !!live && live.length > 0;
        setHasLiveJourneys(usingLive);
        setJourneys(usingLive ? (live as Journey[]) : generateJourneys(route, legDate));
        setLoadState('ready');
      });
    }, 650);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [route, legOriginId, legDestinationId, legDate, reloadTick]);

  useEffect(() => {
    let cancelled = false;
    getLiveScheduleFreshness().then((f) => {
      if (!cancelled) setLiveFreshness(f);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelectFare = (journey: Journey, fareClassId: FareClassId) => {
    const fare = journey.fares.find((f) => f.classId === fareClassId);
    if (!fare || fare.price === null) return;
    setCurrentSelection({ journey, fareClassId, price: fare.price });
  };

  const handleDateSelect = (date: string) => {
    // The previously selected journey's id won't exist in the regenerated
    // list for a different date, so clear this leg's selection rather
    // than leave the summary bar pointing at a stale fare.
    setCurrentSelection(null);
    if (leg === 'outbound') {
      setCriteria((c) => ({ ...c, date }));
    } else {
      setCriteria((c) => ({ ...c, returnDate: date }));
    }
  };

  const handleContinue = () => {
    if (isRoundTrip && leg === 'outbound') {
      setLeg('return');
      return;
    }
    navigation.navigate('Checkout');
  };

  const priceLabel = (amountEUR: number) =>
    rates ? formatCurrency(convert(amountEUR, currency, rates), currency) : `€${amountEUR}`;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            {isRoundTrip && (
              <Text style={styles.legLabel}>
                {leg === 'outbound' ? '1. Gidiş' : '2. Dönüş'}
              </Text>
            )}
            <Text style={styles.route}>
              {origin?.city} → {destination?.city}
            </Text>
          </View>
          <SecondaryButton label="Düzenle" onPress={() => navigation.goBack()} style={styles.editBtn} />
        </View>
        {isRoundTrip && leg === 'return' && (
          <Pressable
            onPress={() => setLeg('outbound')}
            style={styles.backLink}
            accessibilityRole="button"
            accessibilityLabel="Gidiş seçimini düzenle"
          >
            <Ionicons name="arrow-back" size={14} color={colors.navy700} />
            <Text style={styles.backLinkText}>Gidiş seçimini düzenle</Text>
          </Pressable>
        )}
        <CurrencyToggle
          value={currency}
          onChange={setCurrency}
          freshness={ratesLoading ? null : rates?.source ?? null}
        />
        {loadState === 'ready' && (
          <Text style={styles.scheduleFreshness}>
            {hasLiveJourneys && liveFreshness
              ? `● Canlı sefer verisi · ${relativeFreshness(liveFreshness.generatedAt)} güncellendi`
              : '● Sefer saatleri örnek veridir (bkz. README)'}
          </Text>
        )}
      </View>

      {route && (
        <View style={styles.dateStripWrap}>
          <DateStrip
            route={route}
            selectedDate={legDate}
            onSelect={handleDateSelect}
            currency={currency}
            rates={rates}
            minDateISO={leg === 'return' ? criteria.date : todayISO()}
          />
        </View>
      )}

      {loadState === 'loading' && (
        <View style={styles.centerState}>
          <ActivityIndicator color={colors.navy800} size="large" />
          <Text style={styles.centerStateText}>Seferler aranıyor…</Text>
        </View>
      )}

      {loadState === 'error' && (
        <View style={styles.centerState}>
          <Ionicons name="cloud-offline-outline" size={40} color={colors.gray400} />
          <Text style={styles.centerStateTitle}>Seferler yüklenemedi</Text>
          <Text style={styles.centerStateText}>
            Bağlantıda geçici bir sorun oluştu. Lütfen tekrar deneyin.
          </Text>
          <PrimaryButton
            label="Tekrar dene"
            onPress={() => setReloadTick((t) => t + 1)}
            style={{ marginTop: spacing.lg, minWidth: 160 }}
          />
        </View>
      )}

      {loadState === 'ready' && journeys.length === 0 && (
        <View style={styles.centerState}>
          <Ionicons name="train-outline" size={40} color={colors.gray400} />
          <Text style={styles.centerStateTitle}>Bu tarihte sefer yok</Text>
          <Text style={styles.centerStateText}>
            Farklı bir tarih deneyin veya tarih şeridinden başka bir günü seçin.
          </Text>
        </View>
      )}

      {loadState === 'ready' && journeys.length > 0 && (
        <FlatList
          data={journeys}
          keyExtractor={(j) => j.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <JourneyCard
              journey={item}
              currency={currency}
              rates={rates}
              selectedFareClassId={
                currentSelection?.journey.id === item.id ? currentSelection.fareClassId : undefined
              }
              onSelectFare={(fareClassId) => handleSelectFare(item, fareClassId)}
              onShowConditions={(fareClassId) => {
                setPendingFareJourney(item);
                setConditionsFor(fareClassId);
              }}
            />
          )}
        />
      )}

      {currentSelection && (
        <View style={styles.summaryBar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryLabel}>
              {currentSelection.journey.departureTime} ·{' '}
              {fareClassById(currentSelection.fareClassId)?.shortLabel}
            </Text>
            <Text style={styles.summaryPrice}>{priceLabel(currentSelection.price)}</Text>
          </View>
          <PrimaryButton
            label={isRoundTrip && leg === 'outbound' ? 'Dönüş seç' : 'Devam et'}
            onPress={handleContinue}
            style={{ minWidth: 140 }}
          />
        </View>
      )}

      <FareDetailsSheet
        visible={conditionsFor !== null}
        fareClassId={conditionsFor}
        onClose={() => setConditionsFor(null)}
        onChooseThisFare={
          pendingFareJourney && conditionsFor
            ? () => handleSelectFare(pendingFareJourney, conditionsFor)
            : undefined
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.offWhite },
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    gap: spacing.sm,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  legLabel: { ...typography.tiny, color: colors.teal500, textTransform: 'uppercase', marginBottom: 2 },
  route: { ...typography.h3, color: colors.navy900 },
  editBtn: { paddingVertical: 6, paddingHorizontal: spacing.md },
  backLink: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' },
  backLinkText: { ...typography.captionStrong, color: colors.navy700, textDecorationLine: 'underline' },
  scheduleFreshness: { ...typography.tiny, color: colors.gray400 },
  dateStripWrap: { backgroundColor: colors.white, paddingBottom: spacing.md },
  list: { padding: spacing.lg, paddingBottom: 140 },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl, gap: spacing.xs },
  centerStateTitle: { ...typography.h3, color: colors.navy900, marginTop: spacing.sm },
  centerStateText: { ...typography.body, color: colors.gray600, textAlign: 'center' },
  summaryBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  summaryLabel: { ...typography.caption, color: colors.gray600 },
  summaryPrice: { ...typography.h2, color: colors.navy900 },
});
