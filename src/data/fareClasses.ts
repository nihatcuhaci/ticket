import { FareClassInfo } from '../types';
import { Language, TRANSLATIONS } from '../i18n/translations';

/**
 * Fare class definitions and their perks, closely modelled on the real
 * conditions publicly listed on eurostar.com at the time of research
 * (Aug 2026) — exchange/refund policy, luggage allowance, on-board
 * services. Wording rewritten in our own voice, not copied verbatim.
 *
 * The marketing `label`/`shortLabel` ("EuroTrain Standard"/"Standard")
 * are brand names and stay identical in every language. The
 * `description` and `perks` are real sentences, so they're sourced from
 * translations.ts and vary by language — see that file's header comment
 * for why (this used to be hardcoded English-only, a real bug for
 * Turkish-language sessions).
 */
const SHORT_LABELS: Record<string, string> = {
  standard: 'Standard',
  plus: 'Plus',
  premier: 'Premier',
};

export function getFareClasses(language: Language): FareClassInfo[] {
  const fc = TRANSLATIONS[language].fareClasses;
  return (['standard', 'plus', 'premier'] as const).map((id) => ({
    id,
    label: fc[id].label,
    shortLabel: SHORT_LABELS[id],
    description: fc[id].description,
    perks: fc[id].perks,
  }));
}

export const getFareClassById = (id: string, language: Language): FareClassInfo | undefined =>
  getFareClasses(language).find((f) => f.id === id);
