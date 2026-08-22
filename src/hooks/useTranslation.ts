import { Language, Strings, TRANSLATIONS } from '../i18n/translations';
import { useAppState } from '../state/AppState';

/**
 * Single entry point every screen/component uses to read UI text.
 * `t` is always fully typed (Strings) so a typo in a key path is a
 * compile error, not a blank label at runtime.
 */
export function useTranslation(): { t: Strings; language: Language; setLanguage: (l: Language) => void } {
  const { language, setLanguage } = useAppState();
  return { t: TRANSLATIONS[language], language, setLanguage };
}
