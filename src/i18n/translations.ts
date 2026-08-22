/**
 * Hand-rolled i18n — no external library, matching how the rest of this
 * MVP avoids adding a dependency for something a small, typed object can
 * do (see theme/ for the same philosophy applied to design tokens).
 *
 * Every UI string lives here, once, in both languages — `Strings` is the
 * single interface both `tr` and `en` must satisfy, so TypeScript itself
 * catches a missing translation rather than a screen quietly falling
 * back to the wrong language for one label. Screens/components call
 * `useTranslation()` (src/hooks/useTranslation.ts) to get `t` bound to
 * whichever language is currently selected (src/state/AppState.tsx).
 *
 * Station/city names (stations.ts) and fare-class marketing names
 * ("EuroTrain Standard"/"Plus"/"Premier") are deliberately NOT
 * translated — they're proper nouns/brand names, consistent with how a
 * real Eurostar-style product treats them across locales. Fare-class
 * *descriptions and perks* (fareClasses.ts) ARE translated here — they
 * were hardcoded English-only before this change, which meant a
 * Turkish session would show English text mid-sentence. That was a
 * real, visible bug this work fixed, not just a "nice to have."
 */

export type Language = 'tr' | 'en';

export interface Strings {
  weekdaysShort: string[]; // Sun..Sat, matches Date#getDay() index order
  monthsShort: string[]; // Jan..Dec

  common: {
    select: string;
    soldOut: string;
    close: string;
    selectedTag: string;
    tryAgain: string;
  };

  home: {
    tagline: string;
    helpButtonA11y: string;
    tripTypeOneway: string;
    tripTypeRoundtrip: string;
    tripTypeSelectA11y: (label: string) => string;
    fromLabel: string;
    toLabel: string;
    originA11y: string;
    destinationA11y: string;
    swapA11y: string;
    dateLabelOutbound: string;
    dateLabelOneway: string;
    returnLabel: string;
    pickDate: string;
    outboundDateA11y: string;
    returnDateA11y: string;
    passengerLabel: string;
    passengerCount: (n: number) => string;
    editPassengersA11y: string;
    noRouteWarning: string;
    quickToday: string;
    quickTomorrow: string;
    quickWeekend: string;
    searchButton: string;
    recentSearchesTitle: string;
    recentSearchesClear: string;
    recentSearchesClearA11y: string;
    recentSearchEntryA11y: (route: string) => string;
    recentSearchesRemoveA11y: (route: string) => string;
    popularRoutes: string;
    promoFrom: (price: number) => string;
    originPickerTitle: string;
    destinationPickerTitle: string;
    outboundDatePickerTitle: string;
    returnDatePickerTitle: string;
  };

  results: {
    freshnessJustNow: string;
    freshnessMinutesAgo: (n: number) => string;
    freshnessHoursAgo: (n: number) => string;
    legOutbound: string;
    legReturn: string;
    editButton: string;
    editOutboundLink: string;
    liveFreshness: (relative: string) => string;
    syntheticFreshness: string;
    loading: string;
    errorTitle: string;
    errorText: string;
    emptyTodayTitle: string;
    emptyTodayText: string;
    emptyOtherTitle: string;
    emptyOtherText: string;
    chooseReturn: string;
    continueButton: string;
  };

  checkout: {
    needSelectionText: string;
    backToSearch: string;
    needReturnSelectionText: string;
    backToResults: string;
    legOutbound: string;
    legReturn: string;
    sectionTitle: string;
    priceLabel: (isRoundTrip: boolean) => string;
    priceNote: string;
    infoText: (dateWord: string) => string;
    infoTextDateWordRoundtrip: string;
    infoTextDateWordOneway: string;
    totalLabel: string;
    continueButton: string;
    cantRedirectTitle: string;
    cantRedirectText: string;
    cantOpenTitle: string;
    cantOpenText: string;
  };

  confirmation: {
    noSelectionText: string;
    title: string;
    subtitle: string;
    legOutbound: string;
    legReturn: string;
    classLabel: string;
    estimatedPriceLabel: string;
    infoText: string;
    reopenButton: string;
    newSearchButton: string;
    cantOpenTitle: string;
    cantOpenText: string;
  };

  currency: {
    showInA11y: (code: string) => string;
    live: string;
    fallback: string;
  };

  journeyCard: {
    live: string;
    durationHoursMinutes: (h: number, m: number) => string;
    durationMinutes: (m: number) => string;
    delayReported: (n: number) => string;
    direct: string;
    connecting: string;
    selectFareA11y: (fareLabel: string, priceOrUnavailable: string) => string;
    notAvailable: string;
    lowestBadge: string;
    seatsLeft: (n: number) => string;
    viewConditions: string;
  };

  networkGate: {
    title: string;
    text: string;
  };

  passengerPicker: {
    title: string;
    categories: {
      adult: { label: string; hint: string };
      youth: { label: string; hint: string };
      child: { label: string; hint: string };
      senior: { label: string; hint: string };
      infant: { label: string; hint: string };
    };
    decreaseA11y: (label: string) => string;
    increaseA11y: (label: string) => string;
    wheelchairLabel: string;
    wheelchairHint: string;
    continueButton: (n: number) => string;
  };

  stationPicker: {
    searchPlaceholder: string;
    searchA11y: string;
    emptyResult: (query: string) => string;
  };

  datePicker: {
    defaultTitle: string;
    dateChipA11y: (dateLabel: string) => string;
  };

  navigation: {
    checkoutTitle: string;
    confirmationTitle: string;
    helpTitle: string;
  };

  fareClasses: {
    standard: { label: string; description: string; perks: string[] };
    plus: { label: string; description: string; perks: string[] };
    premier: { label: string; description: string; perks: string[] };
    chooseButton: (shortLabel: string) => string;
  };

  language: {
    toggleA11y: (code: string) => string;
  };

  help: {
    intro: string;
    faqTitle: string;
    faqs: { q: string; a: string }[];
    faqToggleA11y: (question: string, expanded: boolean) => string;
    contactTitle: string;
    contactText: string;
    helpCenterButton: string;
    contactFormButton: string;
    cantOpenTitle: string;
    cantOpenText: string;
  };
}

const tr: Strings = {
  weekdaysShort: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
  monthsShort: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],

  common: {
    select: 'Seçin',
    soldOut: 'Dolu',
    close: 'Kapat',
    selectedTag: 'Seçili',
    tryAgain: 'Tekrar dene',
  },

  home: {
    tagline: "Avrupa'yı trenle keşfedin",
    helpButtonA11y: 'Yardım ve iletişim',
    tripTypeOneway: 'Tek yön',
    tripTypeRoundtrip: 'Gidiş - dönüş',
    tripTypeSelectA11y: (label) => `${label} seçeneğini seç`,
    fromLabel: 'Nereden',
    toLabel: 'Nereye',
    originA11y: 'Kalkış istasyonu seç',
    destinationA11y: 'Varış istasyonu seç',
    swapA11y: 'Kalkış ve varışı yer değiştir',
    dateLabelOutbound: 'Gidiş',
    dateLabelOneway: 'Tarih',
    returnLabel: 'Dönüş',
    pickDate: 'Tarih seçin',
    outboundDateA11y: 'Gidiş tarihini seç',
    returnDateA11y: 'Dönüş tarihini seç',
    passengerLabel: 'Yolcu',
    passengerCount: (n) => `${n} yolcu`,
    editPassengersA11y: 'Yolcu sayısını düzenle',
    noRouteWarning:
      'Bu iki istasyon arasında doğrudan EuroTrain seferi bulunmuyor. Lütfen farklı bir güzergah deneyin.',
    quickToday: 'Bugün',
    quickTomorrow: 'Yarın',
    quickWeekend: 'Hafta sonu',
    searchButton: 'Sefer ara',
    recentSearchesTitle: 'Son aramalarım',
    recentSearchesClear: 'Temizle',
    recentSearchesClearA11y: 'Son aramaları temizle',
    recentSearchEntryA11y: (route) => `${route} için tekrar ara`,
    recentSearchesRemoveA11y: (route) => `${route} aramasını sil`,
    popularRoutes: 'Popüler güzergahlar',
    promoFrom: (price) => `€${price}'dan başlayan fiyatlarla`,
    originPickerTitle: 'Kalkış istasyonu',
    destinationPickerTitle: 'Varış istasyonu',
    outboundDatePickerTitle: 'Gidiş tarihi seçin',
    returnDatePickerTitle: 'Dönüş tarihi seçin',
  },

  results: {
    freshnessJustNow: 'az önce',
    freshnessMinutesAgo: (n) => `${n} dk önce`,
    freshnessHoursAgo: (n) => `${n} sa önce`,
    legOutbound: '1. Gidiş',
    legReturn: '2. Dönüş',
    editButton: 'Düzenle',
    editOutboundLink: 'Gidiş seçimini düzenle',
    liveFreshness: (relative) => `● Canlı sefer verisi · ${relative} güncellendi`,
    syntheticFreshness: '● Sefer saatleri örnek veridir (bkz. README)',
    loading: 'Seferler aranıyor…',
    errorTitle: 'Seferler yüklenemedi',
    errorText: 'Bağlantıda geçici bir sorun oluştu. Lütfen tekrar deneyin.',
    emptyTodayTitle: 'Bugün için kalan sefer yok',
    emptyTodayText: 'Bugünkü tüm seferlerin saati geçti. Yarını veya başka bir günü deneyin.',
    emptyOtherTitle: 'Bu tarihte sefer yok',
    emptyOtherText: 'Farklı bir tarih deneyin veya tarih şeridinden başka bir günü seçin.',
    chooseReturn: 'Dönüş seç',
    continueButton: 'Devam et',
  },

  checkout: {
    needSelectionText: 'Önce bir sefer seçmelisiniz.',
    backToSearch: 'Aramaya dön',
    needReturnSelectionText: 'Önce dönüş seferini de seçmelisiniz.',
    backToResults: 'Sonuçlara dön',
    legOutbound: 'Gidiş',
    legReturn: 'Dönüş',
    sectionTitle: 'Fiyat özeti',
    priceLabel: (isRoundTrip) =>
      `Bu uygulamada gösterilen tahmini ${isRoundTrip ? 'toplam ' : ''}fiyat`,
    priceNote:
      "Kesin fiyat, koltuk uygunluğu ve varsa promosyonlar eurotrain.net üzerinde değişiklik gösterebilir.",
    infoText: (dateWord) =>
      `Bu uygulama ödeme almaz veya bilet ihracı yapmaz. "eurotrain.net'te devam et" seçildiğinde aynı güzergah, ${dateWord} ve yolcu sayısıyla eurotrain.net'in gerçek arama sonuçlarına yönlendirilirsiniz; satın alma işlemi tamamen eurotrain.net'in kendi sitesinde, kendi güvenli ödeme altyapısıyla tamamlanır.`,
    infoTextDateWordRoundtrip: 'gidiş-dönüş tarihleri',
    infoTextDateWordOneway: 'tarih',
    totalLabel: 'Tahmini toplam',
    continueButton: "eurotrain.net'te devam et",
    cantRedirectTitle: 'Yönlendirilemedi',
    cantRedirectText: 'Bu güzergah için eurotrain.net bağlantısı oluşturulamadı.',
    cantOpenTitle: 'Açılamadı',
    cantOpenText: 'eurotrain.net şu anda açılamadı. Lütfen tekrar deneyin.',
  },

  confirmation: {
    noSelectionText: 'Seçili bir sefer bulunamadı.',
    title: "eurotrain.net'e yönlendirildiniz",
    subtitle:
      "Güncel fiyatı ve koltuk uygunluğunu görüp satın alma işlemini eurotrain.net'te tamamlayabilirsiniz.",
    legOutbound: 'Gidiş',
    legReturn: 'Dönüş',
    classLabel: 'Sınıf',
    estimatedPriceLabel: 'Bu uygulamadaki tahmini fiyat',
    infoText:
      "Bu uygulama herhangi bir ödeme almadı veya bilet oluşturmadı. Satın alma, açılan sekmede eurotrain.net'in kendi sitesinde gerçekleşir.",
    reopenButton: "eurotrain.net'i tekrar aç",
    newSearchButton: 'Yeni arama yap',
    cantOpenTitle: 'Açılamadı',
    cantOpenText: 'eurotrain.net şu anda açılamadı. Lütfen tekrar deneyin.',
  },

  currency: {
    showInA11y: (code) => `${code} para birimini göster`,
    live: '● Canlı kur',
    fallback: '● Kur şu an alınamadı, önbellek gösteriliyor',
  },

  journeyCard: {
    live: 'Canlı',
    durationHoursMinutes: (h, m) => `${h}sa ${m}dk`,
    durationMinutes: (m) => `${m}dk`,
    delayReported: (n) => `+${n} dk gecikme bildirildi`,
    direct: 'Aktarmasız',
    connecting: 'Aktarmalı',
    selectFareA11y: (fareLabel, priceOrUnavailable) =>
      `${fareLabel} sınıfını seç, fiyat ${priceOrUnavailable}`,
    notAvailable: 'mevcut değil',
    lowestBadge: 'En düşük',
    seatsLeft: (n) => `${n} koltuk kaldı`,
    viewConditions: 'Bilet koşullarını gör',
  },

  networkGate: {
    title: 'İnternet bağlantısı yok',
    text:
      "EuroTrain'de sefer aramak ve eurotrain.net üzerinden satın almaya devam edebilmek için bir internet bağlantısı gerekir. Lütfen bağlantınızı kontrol edip tekrar deneyin.",
  },

  passengerPicker: {
    title: 'Yolcular',
    categories: {
      adult: { label: 'Yetişkin', hint: '26-59 yaş' },
      youth: { label: 'Genç', hint: '12-25 yaş' },
      child: { label: 'Çocuk', hint: '0-11 yaş' },
      senior: { label: 'Senior', hint: '60+ yaş' },
      infant: { label: 'Bebek', hint: '0-3 yaş, kucakta ücretsiz' },
    },
    decreaseA11y: (label) => `${label} azalt`,
    increaseA11y: (label) => `${label} arttır`,
    wheelchairLabel: 'Tekerlekli sandalye kullanıcısı',
    wheelchairHint: 'Erişilebilir koltuk ve alanları önceliklendirir',
    continueButton: (n) => `Devam et (${n} yolcu)`,
  },

  stationPicker: {
    searchPlaceholder: 'Şehir veya istasyon ara',
    searchA11y: 'İstasyon ara',
    emptyResult: (query) => `"${query}" için istasyon bulunamadı.`,
  },

  datePicker: {
    defaultTitle: 'Tarih seçin',
    dateChipA11y: (dateLabel) => `${dateLabel} tarihini seç`,
  },

  navigation: {
    checkoutTitle: 'Özet',
    confirmationTitle: 'Yönlendirme',
    helpTitle: 'Yardım',
  },

  fareClasses: {
    standard: {
      label: 'EuroTrain Standard',
      description: 'Konforlu, gösterişsiz bir yolculuk için uygun fiyat.',
      perks: [
        'Kalkıştan 1 saat öncesine kadar ücretsiz değişiklik (fiyat farkı doğabilir)',
        'Kalkıştan 7 gün öncesine kadar küçük bir ücret karşılığında iade edilebilir',
        '2 valiz + 1 küçük çanta',
        'Trende atıştırmalık ve içecek satın alınabilir',
        'Ücretsiz Wi-Fi',
      ],
    },
    plus: {
      label: 'EuroTrain Plus',
      description: 'Daha fazla diz mesafesi, daha geniş koltuk ve hafif bir yemek dahil.',
      perks: [
        "Standard'daki her şey",
        'Daha geniş ve ferah koltuklar',
        'Koltuğunuzda servis edilen hafif yemek ve içecek',
        'Öncelikli biniş',
      ],
    },
    premier: {
      label: 'EuroTrain Premier',
      description: 'En esnek, en konforlu seyahat şekli.',
      perks: [
        "Plus'taki her şey",
        'Tamamen esnek: ücretsiz değişiklik ve iade',
        'Koltukta tam yemek servisi',
        'Uygun olan yerlerde partner lounge erişimi',
      ],
    },
    chooseButton: (shortLabel) => `${shortLabel} sınıfını seç`,
  },

  language: {
    toggleA11y: (code) => `Uygulama dilini ${code} yap`,
  },

  help: {
    intro:
      'Bu, gerçek bir rezervasyon işlemi yapmayan bir gösterim (demo) uygulamasıdır. Aşağıda uygulamanın kendisiyle ilgili sık sorulan sorular yer alıyor; rezervasyonunuzla ilgili sorular için sayfanın altındaki bağlantıları kullanabilirsiniz.',
    faqTitle: 'Sıkça sorulan sorular',
    faqs: [
      {
        q: 'Bu uygulamadaki fiyatlar gerçek mi?',
        a: "Hayır. Gezinirken gördüğünüz fiyatlar bu uygulamanın kendi tahmini fiyatlandırma modeline dayanır. Kesin, güncel fiyatı ve satın alma imkanını yalnızca eurotrain.net'e yönlendirildiğinizde görürsünüz.",
      },
      {
        q: 'Uygulama içinde ödeme yapabilir miyim?',
        a: "Hayır. Bu uygulama hiçbir ödeme almaz ya da bilet oluşturmaz. Checkout'ta \"devam et\" seçildiğinde, yapılandırdığınız aynı güzergah, tarih ve yolcu sayısıyla eurotrain.net'in gerçek arama sonuçlarına yönlendirilirsiniz; satın alma işlemi tamamen orada tamamlanır.",
      },
      {
        q: "\"Canlı\" rozeti ne anlama geliyor?",
        a: "Bazı güzergah ve tarihlerde kalkış saatleri, gerçek zamanlı güncellenen açık bir kaynaktan alınır ve \"Canlı\" rozetiyle işaretlenir. Bu kapsamın dışında kalan durumlarda, açıkça etiketlenmiş tahmini bir program gösterilir.",
      },
      {
        q: 'Gidiş-dönüş aramalar nasıl çalışıyor?',
        a: 'Önce gidiş seferini, ardından dönüş seferini seçersiniz. Her iki seçim de Checkout ekranında tek bir fiyat özetinde ve eurotrain.net için tek bir yönlendirme bağlantısında birleştirilir.',
      },
      {
        q: 'Uygulama dilini nasıl değiştiririm?',
        a: "Ana ekranın sağ üstündeki TR/EN düğmesine dokunarak dili anında değiştirebilirsiniz.",
      },
      {
        q: '"İnternet bağlantısı yok" ekranını neden görüyorum?',
        a: "Sefer aramak ve eurotrain.net üzerinden satın almaya devam edebilmek için cihazınızın aktif bir internet bağlantısına ihtiyacı var. Bağlantı koptuğunda uygulama bunu otomatik olarak algılar ve bağlantı geri geldiğinde kendiliğinden devam eder.",
      },
    ],
    faqToggleA11y: (question, expanded) => `${question} — ${expanded ? 'yanıtı gizle' : 'yanıtı göster'}`,
    contactTitle: 'Hâlâ yardıma mı ihtiyacınız var?',
    contactText:
      'Bir rezervasyon, ödeme veya bilet ile ilgili sorularınız için eurotrain.net Yardım Merkezi\'ni ziyaret edebilir ya da doğrudan onların iletişim formunu kullanabilirsiniz — bu uygulamanın kendisinin bir destek ekibi yoktur.',
    helpCenterButton: "eurotrain.net Yardım Merkezi'ni aç",
    contactFormButton: 'İletişim formunu aç',
    cantOpenTitle: 'Açılamadı',
    cantOpenText: 'Bağlantı şu anda açılamadı. Lütfen tekrar deneyin.',
  },
};

const en: Strings = {
  weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

  common: {
    select: 'Select',
    soldOut: 'Sold out',
    close: 'Close',
    selectedTag: 'Selected',
    tryAgain: 'Try again',
  },

  home: {
    tagline: 'Discover Europe by train',
    helpButtonA11y: 'Help and contact',
    tripTypeOneway: 'One way',
    tripTypeRoundtrip: 'Round trip',
    tripTypeSelectA11y: (label) => `Select ${label}`,
    fromLabel: 'From',
    toLabel: 'To',
    originA11y: 'Select departure station',
    destinationA11y: 'Select arrival station',
    swapA11y: 'Swap origin and destination',
    dateLabelOutbound: 'Depart',
    dateLabelOneway: 'Date',
    returnLabel: 'Return',
    pickDate: 'Select date',
    outboundDateA11y: 'Select departure date',
    returnDateA11y: 'Select return date',
    passengerLabel: 'Passengers',
    passengerCount: (n) => `${n} passenger${n === 1 ? '' : 's'}`,
    editPassengersA11y: 'Edit passenger count',
    noRouteWarning:
      "There's no direct EuroTrain service between these two stations. Please try a different route.",
    quickToday: 'Today',
    quickTomorrow: 'Tomorrow',
    quickWeekend: 'Weekend',
    searchButton: 'Search trains',
    recentSearchesTitle: 'Recent searches',
    recentSearchesClear: 'Clear',
    recentSearchesClearA11y: 'Clear recent searches',
    recentSearchEntryA11y: (route) => `Search again for ${route}`,
    recentSearchesRemoveA11y: (route) => `Remove ${route} from recent searches`,
    popularRoutes: 'Popular routes',
    promoFrom: (price) => `from €${price}`,
    originPickerTitle: 'Departure station',
    destinationPickerTitle: 'Arrival station',
    outboundDatePickerTitle: 'Select departure date',
    returnDatePickerTitle: 'Select return date',
  },

  results: {
    freshnessJustNow: 'just now',
    freshnessMinutesAgo: (n) => `${n} min ago`,
    freshnessHoursAgo: (n) => `${n}h ago`,
    legOutbound: '1. Outbound',
    legReturn: '2. Return',
    editButton: 'Edit',
    editOutboundLink: 'Edit outbound selection',
    liveFreshness: (relative) => `● Live schedule · updated ${relative}`,
    syntheticFreshness: '● Departure times are illustrative (see README)',
    loading: 'Searching for trains…',
    errorTitle: "Couldn't load trains",
    errorText: 'There was a temporary connection issue. Please try again.',
    emptyTodayTitle: 'No more trains today',
    emptyTodayText: "All of today's departures have already left. Try tomorrow or another day.",
    emptyOtherTitle: 'No trains on this date',
    emptyOtherText: 'Try a different date, or pick another day from the date strip.',
    chooseReturn: 'Choose return',
    continueButton: 'Continue',
  },

  checkout: {
    needSelectionText: 'Please select a trip first.',
    backToSearch: 'Back to search',
    needReturnSelectionText: 'Please select a return trip too.',
    backToResults: 'Back to results',
    legOutbound: 'Outbound',
    legReturn: 'Return',
    sectionTitle: 'Price summary',
    priceLabel: (isRoundTrip) => `Estimated ${isRoundTrip ? 'total ' : ''}price shown in this app`,
    priceNote:
      'The final price, seat availability and any promotions may differ on eurotrain.net.',
    infoText: (dateWord) =>
      `This app doesn't process payments or issue tickets. Choosing "Continue on eurotrain.net" takes you to eurotrain.net's real search results for the same route, ${dateWord} and passenger count; the purchase is completed entirely on eurotrain.net's own site, with their own secure payment system.`,
    infoTextDateWordRoundtrip: 'outbound and return dates',
    infoTextDateWordOneway: 'date',
    totalLabel: 'Estimated total',
    continueButton: 'Continue on eurotrain.net',
    cantRedirectTitle: "Couldn't redirect",
    cantRedirectText: "Couldn't build an eurotrain.net link for this route.",
    cantOpenTitle: "Couldn't open",
    cantOpenText: "eurotrain.net couldn't be opened right now. Please try again.",
  },

  confirmation: {
    noSelectionText: 'No selected trip found.',
    title: "You've been redirected to eurotrain.net",
    subtitle:
      'You can check the current price and seat availability, and complete your purchase on eurotrain.net.',
    legOutbound: 'Outbound',
    legReturn: 'Return',
    classLabel: 'Class',
    estimatedPriceLabel: 'Estimated price in this app',
    infoText:
      "This app hasn't taken any payment or issued a ticket. The purchase happens on eurotrain.net, in the tab that opened.",
    reopenButton: 'Reopen eurotrain.net',
    newSearchButton: 'Start a new search',
    cantOpenTitle: "Couldn't open",
    cantOpenText: "eurotrain.net couldn't be opened right now. Please try again.",
  },

  currency: {
    showInA11y: (code) => `Show prices in ${code}`,
    live: '● Live rate',
    fallback: '● Rate unavailable right now, showing cached value',
  },

  journeyCard: {
    live: 'Live',
    durationHoursMinutes: (h, m) => `${h}h ${m}m`,
    durationMinutes: (m) => `${m}m`,
    delayReported: (n) => `+${n} min delay reported`,
    direct: 'Direct',
    connecting: 'Change required',
    selectFareA11y: (fareLabel, priceOrUnavailable) =>
      `Select ${fareLabel}, price ${priceOrUnavailable}`,
    notAvailable: 'not available',
    lowestBadge: 'Lowest',
    seatsLeft: (n) => `${n} seat${n === 1 ? '' : 's'} left`,
    viewConditions: 'View fare conditions',
  },

  networkGate: {
    title: 'No internet connection',
    text:
      "EuroTrain needs an internet connection to search for trains and to continue to purchase on eurotrain.net. Please check your connection and try again.",
  },

  passengerPicker: {
    title: 'Passengers',
    categories: {
      adult: { label: 'Adult', hint: 'ages 26-59' },
      youth: { label: 'Youth', hint: 'ages 12-25' },
      child: { label: 'Child', hint: 'ages 0-11' },
      senior: { label: 'Senior', hint: 'ages 60+' },
      infant: { label: 'Infant', hint: 'ages 0-3, free on lap' },
    },
    decreaseA11y: (label) => `Decrease ${label}`,
    increaseA11y: (label) => `Increase ${label}`,
    wheelchairLabel: 'Wheelchair user',
    wheelchairHint: 'Prioritizes accessible seats and spaces',
    continueButton: (n) => `Continue (${n} passenger${n === 1 ? '' : 's'})`,
  },

  stationPicker: {
    searchPlaceholder: 'Search city or station',
    searchA11y: 'Search station',
    emptyResult: (query) => `No station found for "${query}".`,
  },

  datePicker: {
    defaultTitle: 'Select date',
    dateChipA11y: (dateLabel) => `Select ${dateLabel}`,
  },

  navigation: {
    checkoutTitle: 'Summary',
    confirmationTitle: 'Redirect',
    helpTitle: 'Help',
  },

  fareClasses: {
    standard: {
      label: 'EuroTrain Standard',
      description: 'Great value for a comfortable, no-frills journey.',
      perks: [
        'Exchange free up to 1 hour before departure (fare difference may apply)',
        'Refundable up to 7 days before departure for a small fee',
        '2 pieces of luggage + 1 small bag',
        'Buy snacks and drinks on board',
        'Free on-board wi-fi',
      ],
    },
    plus: {
      label: 'EuroTrain Plus',
      description: 'Extra legroom, a bigger seat and a light meal included.',
      perks: [
        'Everything in Standard',
        'Wider, more spacious seating',
        'Light meal and drink served at your seat',
        'Priority boarding',
      ],
    },
    premier: {
      label: 'EuroTrain Premier',
      description: 'The most flexible, most comfortable way to travel.',
      perks: [
        'Everything in Plus',
        'Fully flexible: free exchanges and refunds',
        'Full at-seat meal service',
        'Access to partner lounges where available',
      ],
    },
    chooseButton: (shortLabel) => `Choose ${shortLabel} fare`,
  },

  language: {
    toggleA11y: (code) => `Switch app language to ${code}`,
  },

  help: {
    intro:
      "This is a demo app that doesn't process real bookings. Below are answers to common questions about the app itself; for questions about an actual booking, use the links at the bottom of this page.",
    faqTitle: 'Frequently asked questions',
    faqs: [
      {
        q: 'Are the prices in this app real?',
        a: "No. The prices you see while browsing come from this app's own estimated pricing model. You'll see the exact, current price — and be able to actually buy — only once you're redirected to eurotrain.net.",
      },
      {
        q: 'Can I pay inside this app?',
        a: 'No. This app never takes a payment or issues a ticket. Choosing "continue" on Checkout takes you to eurotrain.net\'s real search results for the same route, date and passenger count you configured; the purchase happens entirely there.',
      },
      {
        q: 'What does the "Live" badge mean?',
        a: 'For some routes and dates, departure times come from a real, continuously-updated open source and are marked with a "Live" badge. Outside that coverage, a clearly-labelled estimated schedule is shown instead.',
      },
      {
        q: 'How do round-trip searches work?',
        a: "You pick the outbound trip first, then the return trip. Both selections are combined into a single price summary and a single redirect link to eurotrain.net on the Checkout screen.",
      },
      {
        q: 'How do I change the app language?',
        a: 'Tap the TR/EN toggle in the top right of the Home screen to switch instantly.',
      },
      {
        q: 'Why am I seeing a "No internet connection" screen?',
        a: "Searching for trains and continuing to purchase on eurotrain.net both need an active internet connection on your device. The app detects a dropped connection automatically and recovers on its own once it's back.",
      },
    ],
    faqToggleA11y: (question, expanded) => `${question} — ${expanded ? 'hide answer' : 'show answer'}`,
    contactTitle: 'Still need help?',
    contactText:
      "For questions about a booking, payment or ticket, visit eurotrain.net's Help Centre or use their contact form directly — this app itself doesn't have a support team.",
    helpCenterButton: "Open eurotrain.net's Help Centre",
    contactFormButton: 'Open the contact form',
    cantOpenTitle: "Couldn't open",
    cantOpenText: "That link couldn't be opened right now. Please try again.",
  },
};

export const TRANSLATIONS: Record<Language, Strings> = { tr, en };

export const LANGUAGE_LABELS: Record<Language, string> = { tr: 'TR', en: 'EN' };
