import React, { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme';
import { SecondaryButton } from '../components/ui';
import { useTranslation } from '../hooks/useTranslation';

// Real pages on the same eurotrain.net this app's checkout hands travelers
// off to (see services/bookingLink.ts) — not invented support contacts.
// This app never had its own support inbox to fake, so rather than mock
// one up, questions about an actual booking/payment/ticket point to the
// one real place they can actually be answered.
const HELP_CENTER_URL = 'https://eurotrain.net/tr/help';
const CONTACT_FORM_URL = 'https://eurotrain.net/tr/contact';

const FaqItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  return (
    <Pressable
      style={styles.faqItem}
      onPress={() => setExpanded((e) => !e)}
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      accessibilityLabel={t.help.faqToggleA11y(q, expanded)}
    >
      <Ionicons
        name={expanded ? 'chevron-up' : 'chevron-down'}
        size={18}
        color={colors.navy700}
        style={styles.faqChevron}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.faqQuestion}>{q}</Text>
        {expanded && <Text style={styles.faqAnswer}>{a}</Text>}
      </View>
    </Pressable>
  );
};

export default function HelpScreen() {
  const { t } = useTranslation();

  const openLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (e) {
      Alert.alert(t.help.cantOpenTitle, t.help.cantOpenText);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.intro}>{t.help.intro}</Text>

        <Text style={styles.sectionTitle}>{t.help.faqTitle}</Text>
        <View style={styles.faqCard}>
          {t.help.faqs.map((item, i) => (
            <React.Fragment key={item.q}>
              {i > 0 && <View style={styles.divider} />}
              <FaqItem q={item.q} a={item.a} />
            </React.Fragment>
          ))}
        </View>

        <View style={styles.contactCard}>
          <Ionicons name="chatbubbles-outline" size={22} color={colors.teal500} />
          <Text style={styles.contactTitle}>{t.help.contactTitle}</Text>
          <Text style={styles.contactText}>{t.help.contactText}</Text>
          <SecondaryButton
            label={t.help.helpCenterButton}
            onPress={() => openLink(HELP_CENTER_URL)}
            style={{ marginTop: spacing.md, alignSelf: 'stretch' }}
          />
          <SecondaryButton
            label={t.help.contactFormButton}
            onPress={() => openLink(CONTACT_FORM_URL)}
            style={{ marginTop: spacing.sm, alignSelf: 'stretch' }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.offWhite },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  intro: { ...typography.body, color: colors.gray600, marginBottom: spacing.lg },
  sectionTitle: { ...typography.h3, color: colors.navy900, marginBottom: spacing.sm },
  faqCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.gray200,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  divider: { height: 1, backgroundColor: colors.gray200 },
  faqItem: { flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.md },
  faqChevron: { marginTop: 3 },
  faqQuestion: { ...typography.bodyStrong, color: colors.navy900 },
  faqAnswer: { ...typography.caption, color: colors.gray600, marginTop: spacing.xs },
  contactCard: {
    backgroundColor: colors.teal100,
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: 'flex-start',
  },
  contactTitle: { ...typography.h3, color: colors.navy900, marginTop: spacing.sm },
  contactText: { ...typography.caption, color: colors.navy700, marginTop: spacing.xs },
});
