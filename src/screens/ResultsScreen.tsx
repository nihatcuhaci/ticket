import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
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
import { generateJourneys } from '../services/journeyGenerator';
import { FareClassId, Journey } from '../types';
import { DateStrip } from '../components/DateStrip';
import { JourneyCard } from '../components/JourneyCard';
import { FareDetailsSheet } from '../components/FareDetailsSheet';
import { CurrencyToggle } from '../components/CurrencyToggle';
import { PrimaryButton, SecondaryButton } from '../components/ui';
import { useExchangeRates } from '../hooks/useExchangeRates';
import { CurrencyCode, convert, formatCurrency } from '../services/currencyService';
import { fareClassById } from '../data/fareClasses';

type Props = NativeStackScreenProps<RootStackParamList, 'Results'>;
type LoadState = 'loading' | 'ready' | 'error';

export default function ResultsScreen({ navigation }: Props) {
  const { criteria, setCriteria, selection, setSelection } = useAppState();
  const { rates, loading: ratesLoading } = useExchangeRates();
  const [currency, setCurrency] = useState<CurrencyCode>('EUR');
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [conditionsFor, setConditionsFor] = useState<FareClassId | null>(null);
  const [pendingFareJourney, setPendingFareJourney] = useState<Journey | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  const origin = stationById(criteria.originId);
  const destination = stationById(criteria.destinationId);
  const route = useMemo(
    () => findRoute(criteria.originId, criteria.destinationId),
    [criteria.originId, criteria.destinationId]
  );

  useEffect(() => {
    if (!route) {
      setLoadState('error');
      return;
    }
    setLoadState('loading');
    setSelection(null);
    const timer = setTimeout(() => {
      // Deterministic, occasional simulated network failure so the error
      // state is reachable in a demo rather than only existing on paper.
      const failureSeed = `${criteria.originId}${criteria.destinationId}${criteria.date}${reloadTick}`;
      const shouldFail = reloadTick === 0 && failureSeed.length % 17 === 0;
      if (shouldFail) {
        setLoadState('error');
        return;
      }
      setJourneys(generateJourneys(route, criteria.date));
      setLoadState('ready');
    }, 650);
    return () => clearTimeout(timer);
  }, [route, criteria.originId, criteria.destinationId, criteria.date, reloadTick]);

  const handleSelectFare = (journey: Journey, fareClassId: FareClassId) => {
    const fare = journey.fares.find((f) => f.classId === fareClassId);
    if (!fare || fare.price === null) return;
    setSelection({ journey, fareClassId, price: fare.price });
  };

  const priceLabel = (amountEUR: number) =>
    rates ? formatCurrency(convert(amountEUR, currency, rates), currency) : `€${amountEUR}`;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.route}>
            {origin?.city} → {destination?.city}
          </Text>
          <SecondaryButton label="Düzenle" onPress={() => navigation.goBack()} style={styles.editBtn} />
        </View>
        <CurrencyToggle
          value={currency}
          onChange={setCurrency}
          freshness={ratesLoading ? null : rates?.source ?? null}
        />
      </View>

      {route && (
        <View style={styles.dateStripWrap}>
          <DateStrip
            route={route}
            selectedDate={criteria.date}
            onSelect={(date) => setCriteria((c) => ({ ...c, date }))}
            currency={currency}
            rates={rates}
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
              selectedFareClassId={selection?.journey.id === item.id ? selection.fareClassId : undefined}
              onSelectFare={(fareClassId) => handleSelectFare(item, fareClassId)}
              onShowConditions={(fareClassId) => {
                setPendingFareJourney(item);
                setConditionsFor(fareClassId);
              }}
            />
          )}
        />
      )}

      {selection && (
        <View style={styles.summaryBar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryLabel}>
              {selection.journey.departureTime} · {fareClassById(selection.fareClassId)?.shortLabel}
            </Text>
            <Text style={styles.summaryPrice}>{priceLabel(selection.price)}</Text>
          </View>
          <PrimaryButton
            label="Devam et"
            onPress={() => navigation.navigate('Checkout')}
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
  route: { ...typography.h3, color: colors.navy900 },
  editBtn: { paddingVertical: 6, paddingHorizontal: spacing.md },
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
