# EuroTrain: Mobil Deneyim MVP'si

Odamigo'nun **AI Product Development Case: EuroTrain Mobile Experience** görevi için hazırlanmış bir başvuru teslimidir.

React Native (Expo) + TypeScript ile geliştirildi. Tek bir kod tabanından iOS, Android ve web'de çalışır.

📍 **Yol haritasını mı arıyorsun?** Kısa, madde işaretli bir MVP / Post-MVP / Gelecek dökümü için [`ROADMAP.md`](./ROADMAP.md)'ye bak. Bu README'nin [§9](#9-yol-haritası) bölümü aynı içeriği, her maddenin gerekçesiyle birlikte uzun anlatım halinde kapsıyor.

## Canlı önizleme

Kurulum ya da hesap gerekmiyor. Ücretsiz **Expo Go** uygulaması kurulu bir telefondan tarat ya da aç ([App Store](https://apps.apple.com/app/expo-go/id982107779) / [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)):

**[expo.dev/preview/update?...](https://expo.dev/preview/update?message=Fix&updateRuntimeVersion=exposdk%3A57.0.0&createdAt=2026-08-23T21%3A12%3A49.856Z&slug=exp&projectId=9d76b6ad-204e-478b-aacd-6ce673db112e&group=b7b47140-1ff4-47ff-8425-747209d7a2c7)** (sayfada "Development build" değil, **Expo Go**'yu seçin)

Bu link, cihazda gerçekten native olarak çalışan uygulamayı EAS Update üzerinden `preview` branch'inden açıyor: web önizlemesi ya da mockup değil, bu reponun gerçek `journeyGenerator`/`bookingLink`/`liveScheduleService` kodu. Linki açmak için giriş yapmaya ya da Expo hesabına gerek yok; herkese açık bir önizleme sayfası, QR kod ve "Open in Expo Go" seçeneğiyle. Çıkış yapılmış bir oturumda hem Android hem iOS'ta çalıştığı doğrulandı. (Tarayıcı tabanlı bir önizleme istersen, yerel `expo export --platform web` build'i için [§2 Hızlı başlangıç](#2-hızlı-başlangıç)'a bakın.)

Expo Go'ya gerek kalmadan Android'e doğrudan kurulumu mu tercih edersiniz? APK'yı doğrudan EAS build sayfasından indirin: **[expo.dev/.../builds/d6a0faa3-...](https://expo.dev/accounts/nhttt/projects/eurotrain/builds/d6a0faa3-4a37-48ec-b61a-342ad380d9bb)**. Orada da giriş yapmaya gerek yok, projenin internal build'ler için hesapsız erişim ayarı açık. Bu build linki oluşturulduğu tarihten (23 Ağustos 2026) itibaren yaklaşık 30 gün geçerli kalır.

iOS'ta (ya da herhangi bir tarayıcıda): **[nihatcuhaci.github.io/ticket](https://nihatcuhaci.github.io/ticket/)**, deploy edilmiş web export'u. Bu teslimde native bir iOS build'i yok, çünkü fiziksel bir iPhone'a gerçek bir uygulama kurmak ücretli bir Apple Developer Program üyeliği gerektiriyor ve bu projede böyle bir hesap yok.

---

## 1. Neler yaptım

Case'in açıkça işaret ettiği tek yolculuğu ("keşfet, planla ve satın almaya yönlendir") uçtan uca kapsayan, mobil öncelikli bir MVP:

- **Açılış**: gerçek uygulama zaten yüklenirken üzerine bindirilen, birkaç saniyelik animasyonlu bir giriş. Bkz. [§7](#7-apiler-ve-veri-stratejisi).
- **Ana ekran (Home)**: gerçek bir istasyon listesiyle kalkış/varış araması, tek yön/gidiş-dönüş geçişi, hızlı tarih kutucukları, tam tarih seçici(ler), yaş bantlarıyla yolcu sayıları, tekerlekli sandalye erişilebilirlik bayrağı, popüler güzergah kısayolları ve tam bir Türkçe/İngilizce dil geçişi. Bkz. [§6](#6-teknoloji-yığını).
- **Son aramalarım**: son 5 farklı arama, cihazda kalıcı olarak saklanır, Ana ekranda gösterilir; birine dokunmak onu bugüne tarihlenmiş şekilde yeniden çalıştırır, kaldırılabilir. Bkz. [§7](#7-apiler-ve-veri-stratejisi).
- **Sonuçlar (Results)**: en ucuz günün vurgulandığı bir tarih şeridi, üç ücret sınıfı yan yana, doluluk sinyalleri, canlı para birimi geçişi, ücret koşulları detay sayfaları. O güzergah/tarih için canlı besleme varsa "Canlı" rozeti, yoksa açıkça etiketlenmiş sentetik yedek. Bkz. [§7.6](#7-apiler-ve-veri-stratejisi). Gidiş-dönüşte bu ekran Gidiş, sonra Dönüş için iki kez kullanılır.
- **Ödeme özeti / yönlendirme (Checkout)**: bir yolculuk özeti ve kullanıcıyı, yapılandırdığı tam yolculuk için eurotrain.net'in gerçek, canlı arama sonuçları sayfasına yönlendiren bir "Eurotrain.net'te devam et" eylemi. Bu uygulamaya asla ödeme formu, kart bilgisi veya hesap girmiyor. Bkz. [§7](#7-apiler-ve-veri-stratejisi).
- **Onay / yönlendirme özeti (Confirmation)**: yolculuğu tekrar özetler, uygulama içinde herhangi bir rezervasyon veya ücretlendirme yapılmadığını açıkça belirtir, eurotrain.net'i tekrar açma veya yeni arama başlatma seçeneği sunar.
- **Yardım ve iletişim**: bir değerlendiricinin en çok merak edeceği şeyleri kapsayan uygulama içi bir SSS, artı eurotrain.net'in gerçek yardım merkezine ve iletişim formuna bağlantılar. Bkz. [§7](#7-apiler-ve-veri-stratejisi).
- **Bağlantı yok ekranı**: cihazın kullanılabilir bir bağlantısı olmadığı her an tüm uygulamayı kaplayan tam ekran bir durum, "Tekrar dene" eylemi ve otomatik kurtarma ile birlikte. Bkz. [§7.5](#7-apiler-ve-veri-stratejisi).
- Yükleniyor, boş ve hata durumları, en çok önem taşıdıkları iki ekranda uygulanmış durumda.
- **Yapmadıklarım**: kimlik doğrulama/hesaplar, bir "Rezervasyonlarım" alanı, çok bacaklı/aktarmalı yolculuklar, koltuk haritaları, uygulama içi ödeme toplama. Nedeni için bkz. [§3](#3-ürün-kapsamı-ve-önceliklendirme).

## 2. Hızlı başlangıç

```bash
npm install
npx expo start          # ardından web için "w" tuşuna basın, ya da QR kodu Expo Go ile okutun
```

Geliştirme sırasında otomatik testler için kullanılan web derlemesi:

```bash
EXPO_OFFLINE=1 npx expo export --platform web   # -> dist/, herhangi bir statik sunucuyla servis edilebilir
```

(`EXPO_OFFLINE=1` yalnızca Expo'nun kendi güncelleme kontrolü çağrısının engellendiği, ağı kısıtlı CI/sandbox ortamlarında gerekiyor. Bkz. §7.)

**Gerçek canlı kalkış saatlerini açmak için isteğe bağlı, tek seferlik adım (§7):** uygulama bunu yapmadan da hemen çalışır. Sadece siz bu adımı tamamlayana kadar açıkça etiketlenmiş sentetik programı gösterir.

1. Bu repoyu kendi GitHub reponuza push edin (sıradan bir `git push`, özel bir şey yok).
2. `src/services/liveScheduleService.ts` dosyasını açın ve şu satırı değiştirin:
   ```ts
   const LIVE_SCHEDULE_REPO = 'YOUR_GITHUB_USERNAME/YOUR_REPO_NAME';
   ```
   gerçek `kullanıcı-adı/repo-adı` değerinizle, örn. `'kullaniciadiniz/eurotrain-mvp'`.
3. Bu kadar. Deploy edilecek veya kayıt olunacak bir şey yok. `refresh-schedules` GitHub Actions iş akışı, workflow dosyası GitHub'a ulaşır ulaşmaz kendi zamanlamasında (her 15 dakikada bir) otomatik olarak çalışmaya başlar. İlerlemeyi reponun **Actions** sekmesinden takip edebilirsiniz; beklemeden hemen bir çalıştırma tetiklemek için oradan "Refresh live schedules" iş akışını açıp **Run workflow**'a tıklayın.
4. İlk çalıştırma tamamlandığında `https://raw.githubusercontent.com/<kullanıcı>/<repo>/data/live-schedules.json` yayında olur ve Sonuçlar ekranı, beslemenin kapsadığı güzergah/tarihler için gerçek kalkış saatlerini ("Canlı" rozetiyle) göstermeye başlar.

## 3. Ürün kapsamı ve önceliklendirme

Brief kasıtlı olarak bir özellik listesi vermiyor, o yüzden neyin neden içeride/dışarıda olduğunun gerekçesi burada.

**Kapsamda**, çünkü bu tam olarak temel değer önerisinin kendisi ("keşfet, planla, satın almaya yönlendir"): gerçek bir istasyon kümesi ve makul yolcu/erişilebilirlik girdileriyle arama; tek yön **ve gidiş-dönüş** arama, çünkü dönüş bacağı en yaygın gerçek dünya yolculuk şekillerinden biri ve gerçek eurostar.com bunu bir ek özellik değil, çekirdek bir şey olarak ele alıyor (araştırma sırasında canlı "Dönüş ekle" akışını yürüterek doğruladım); tarihler ve ücret sınıfları arasında fiyat karşılaştırması (gerçek eurostar.com'daki tek en büyük UX ayrıştırıcısı bu, bu MVP'yi tasarlamadan önce canlı sitelerini gezerek doğruladım; bkz. `eurostar-analiz.md`); yalnızca gösterim amaçlı zaman dilimleri değil, Eurostar'ın kendi açık GTFS beslemesinden alınan gerçek, canlı yenilenen kalkış/varış saatleri ve gecikme durumu (§7); yolcuyu, yapılandırdığı tam yolculuk için *gerçek, canlı* bir eurostar.com aramasına teslim eden bir checkout/yönlendirme adımı, böylece "satın almaya yönlendir" sahte bir başarı ekranı yerine gerçek, rezerve edilebilir bir sayfada sona eriyor.

**Kasıtlı olarak dışarıda bırakılanlar** ve nedenleri:

- **Hesaplar / giriş / sadakat programı (Club Eurostar benzeri puanlar)**: gerçek bir değer, ama çekirdek rezervasyon yolculuğunun çalıştığını kanıtlamakla dolaylı bir ilişkisi var. Misafir, tıkla-çık akışı zaten "satın alma" adımını uçtan uca gösteriyor.
- **Koltuk seçimi / koltuk haritaları**: yüksek uygulama maliyeti, bir ürün-düşüncesi egzersizi için düşük sinyal; Standard/Plus/Premier sınıf seçimi zaten fiyatlandırma katmanı UX'ini gösteriyor.
- **Çok bacaklı / aktarmalı yolculuklar** (örn. Brüksel üzerinden Londra → Köln): gerçek Rail Europe ağı bunu destekliyor, ama odaklanmayı ödüllendiren bir case için fiyatlandırma modeli karmaşıklığını kabaca ikiye katlıyor.
- **Uygulama içi ödemeler**: brief'e göre (case §4/§6) açıkça kapsam dışı; sahte bir ödeme formu taklit etmek yerine, MVP eurotrain.net'in kendi gerçek, güvenli checkout'una yönlendiriyor (§7).
- **Canlı tren durumu için push bildirimleri**: gerçekten değerli (Eurostar'ın kendi pazarlama metnine göre kendi uygulamasının var olmasının #1 nedeni bu), ama burada ürün-kararı sinyali eklemeyen bir backend/bildirim servisi gerektiriyor.

## 4. Temel kullanıcı yolculuğu

Tek yön: Ana ekran → Sonuçlar → (ücret seç) → Checkout (özet + yönlendirme) → Onay (yönlendirme özeti), her ekranda tam olarak bir zorunlu karar ile (nereye, ne zaman/hangi ücret, eurotrain.net'te devam et). Gidiş-dönüş: aynı akış, bir ek kararla (Checkout'tan önce Sonuçlar ekranı önce Gidiş, sonra Dönüş için kullanılır), bu da araştırma sırasında eurostar.com'un kendi rezervasyon akışında bulduğum Gidiş → Dönüş → Checkout breadcrumb'ını yansıtıyor, farklı bir desen icat etmek yerine. Bir ücret seçildiğinde yolculuk özeti her zaman görünür durumda kalır (yapışkan bir alt çubuk), eurostar.com'da etkili olduğunu gözlemlediğim deseni yansıtarak: kullanıcı, uygulamadan ayrılmadan önce hangi yolculukla devam edeceğini her zaman biliyor.

## 5. UX/UI düşüncesi

- **Bilgi hiyerarşisi**: fiyat ve saat, bir tren yolcusunun ilk taradığı iki şey, bu yüzden sonuç listesinde en büyük tipografiyi alıyorlar; geri kalan her şey (süre, bagaj kuralları, kalan koltuk) ikincil.
- **Geri bildirim**: her asenkron eylemin (arama, ödeme) görünür bir yükleniyor durumu var; sonuçlardaki tarih şeridi dokunmada anında güncelleniyor, böylece tarihe göre alışveriş anlık hissettiriyor.
- **Boş/hata durumları birinci sınıf**, sonradan akla gelen bir şey değil: geçersiz bir kalkış/varış çifti arama düğmesini devre dışı bırakır *ve* nedenini açıklar (geçersiz bir istek asla ulaşılabilir olmamalı); Sonuçlar'da simüle edilmiş bir ağ hatası boş bir ekran yerine bir yeniden deneme eylemi gösterir; sefer olmayan bir tarih, boş bir liste göstermek yerine bunu söyler.
- **Para birimi yedeği görünür, sessiz değil**: canlı FX çağrısı başarısız olduğunda arayüz bunu söyler ("canlı" vs "önbellek" rozeti) sayının taze olduğunu iddia etmek yerine.

## 6. Teknoloji yığını

| Katman | Seçim | Neden |
|---|---|---|
| Framework | React Native + Expo (TypeScript) | Tek kod tabanı iOS/Android/web için; Expo'nun yönetilen iş akışı native derleme yükünü ortadan kaldırıyor, bu da 4-6 saatlik bir case için önemli; JS/TS ağırlıklı bir ürün organizasyonuyla büyük işe alım havuzu örtüşmesi. |
| Navigasyon | React Navigation (native-stack) | Fiili standart, native performans, 4 ekran için küçük API yüzeyi. |
| State | React Context (`AppState`) | Paylaşılan state (arama kriterleri, seçilen ücret) küçük ve sığ, bu ölçekte Redux/Zustand haksız bir ek yük olurdu. Bir gözden kaçırma değil, bilinçli bir seçim olarak belgelendi. |
| Stil | `StyleSheet` + küçük, elle yazılmış bir token sistemi (`src/theme`) | Kurulacak/öğrenilecek bir tasarım sistemi bağımlılığı yok; token'lar renkleri/boşlukları tutarlı ve değiştirilebilir tutuyor. |
| Veri | Yerel TypeScript modülleri (`src/data`, `src/services`) | Bkz. §7. |
| Bağlantı | `expo-network` (`NetworkGate`, `useNetworkStatus`) | Resmi Expo modülü, yönetilen iş akışında sıfır native yapılandırma; simüle edilmek yerine gerçek cihaz/tarayıcı bağlantısını yansıtır. Bkz. §7. |
| Yerelleştirme | Elle yazılmış i18n (`src/i18n/translations.ts`, `useTranslation`) | Hem `tr` hem `en` sözlüğünün uyması gereken tek bir `Strings` TypeScript arayüzü, böylece eksik bir çeviri çalışma zamanında sessizce yanlış dile düşmek yerine bir derleme hatası oluyor; 2 dil için bir kütüphaneye gerek yok. |
| Yerel kalıcılık | `@react-native-async-storage/async-storage` (`src/services/recentSearches.ts`) | Uygulamanın gerçekten kalıcı olan tek durumu (son aramalar, §7) `AppState`'in bellek-içi context'ine karışmak yerine kendi depolama-destekli servisine izole edilmiş, çünkü uygulama yeniden başlatmasına hayatta kalması gereken tek şey bu. |
| Canlı sefer besleme hattı | GitHub Actions zamanlamasında düz bir Node.js betiği (`scripts/fetch-live-schedules.mjs`), çıktısı `raw.githubusercontent.com` üzerinden bir `data` dalından servis ediliyor | Çalıştırılacak veya ücret ödenecek bir sunucu yok; bir GTFS-zip ayrıştırma işinin fazlasıyla aşacağı Cloudflare Workers'ın ücretsiz katman 10ms-CPU-başına-çağrı sınırını dolanıyor. Bkz. §7. |

## 7. API'ler ve veri stratejisi

Brief özellikle bunu istediği için en açık olmak istediğim karar bu.

**Rail Europe'un gerçek rezervasyon/fiyatlandırma API'sine bu case için erişilemiyor.** Bu bir B2B ortaklık entegrasyonu, kendi kendine kayıt olunabilecek bir şey değil. eurostar.com'un canlı aramasını scrape etmek düşünüldü ve reddedildi: kullanım şartlarını ihlal eder, kırılgandır, ve brief'in uyardığı production-hazırlığı kırmızı bayrağının tam örneğidir.

**Bunun yerine bir hibrit:**

1. **Gerçek, statik referans verisi** (`src/data/stations.ts`, `src/data/routes.ts`): eurostar.com'a manuel göz atılarak toplanan gerçek istasyon isimleri, şehirler, koordinatlar, güzergah süreleri ve ücret aralıkları (bkz. `eurostar-analiz.md`). Canlı veri değil, öyle olduğunu iddia etmiyor.
2. **Deterministik fiyatlandırma** (`src/services/journeyGenerator.ts`): ücretler `Math.random()` değil, güzergah+tarih+saat-diliminin seed'lenmiş bir hash'inden türetiliyor. Aynı arama her zaman aynı sonucu döndürür; yine de gerçek sitede gözlemlenen desenlere benzer biçimde çeşitlenir (hafta sonu/son dakika zammı, ara sıra dolu ücret sınıfları).
3. **Gerçekten canlı tek bir API** (`src/services/currencyService.ts`): `frankfurter.app` (ücretsiz, anahtarsız, ECB destekli) ile EUR→TRY/USD/GBP dönüşümü, 4s zaman aşımı ve başarısızlıkta etiketlenmiş bir yedek kur. Odamigo'nun TR/CY/AZ pazarları için gerçek ürün değeri, bir demo süsü değil.
4. **Checkout'ta gerçek derin bağlantı** (`src/services/bookingLink.ts`): kullanıcının gerçek kalkış/varış/tarih(ler)/yolcu sayısıyla eurotrain.net'in gerçek arama sonuçları sayfasına bir URL oluşturur (gidiş-dönüş tek bağlantıda), `Linking.openURL` ile açılır. İstasyon id'leri eurotrain.net'in kendi `bookingSlug`'ları, canlı site gezilerek elle yakalandı. Bu uygulamaya asla ödeme formu, kart bilgisi veya hesap girmiyor. Skyscanner/Google Flights'ın metasearch/tıkla-çık deseni.
5. **Gerçek bağlantı kapısı** (`src/hooks/useNetworkStatus.ts`, `src/components/NetworkGate.tsx`): cihazın gerçek bildirilen ağ durumuna dayanarak, manuel yeniden deneme ve otomatik kurtarma ile tüm uygulamayı tam ekran bir "internet yok" durumunun arkasına kilitler. Bilinen sınırlama: "bir ağa bağlı"yı yansıtır, "internet gerçekten erişilebilir"i değil (örn. gerçek interneti olmayan bir Wi-Fi captive portal çevrimiçi olarak okunur).
6. **Gerçek, canlı yenilenen kalkışlar** (`scripts/fetch-live-schedules.mjs`, `src/services/liveScheduleService.ts`): zamanlanmış bir GitHub Actions işi, Eurostar/Thalys'in ücretsiz açık GTFS beslemesini çekiyor; uygulama da en son sonucu kısa bir önbellekle okuyor. Canlı kalkışlar "Canlı" rozeti alır; kapsanmayan güzergahlar sentetik üreticiye döner, arayüz hangisinin gösterildiğini dürüstçe etiketler. Tek seferlik kurulum: `LIVE_SCHEDULE_REPO`'yu kendi reponuza yönlendirin (§2).
7. **Cihaz üzerinde son aramalar** (`src/services/recentSearches.ts`, `@react-native-async-storage/async-storage`): bir yeniden başlatmaya hayatta kalan tek durum; geri kalan her şey (`AppState`) tasarım gereği yalnızca bellekte. Son 5, güzergah + yolculuk-tipine göre tekilleştirilmiş, yeniden çalıştırmada bayat bir tarihi tekrarlamak yerine bugüne tarihlenmiş (§1), her okuma/yazma try/catch içine sarılmış.

**Ödünleşim**: ücret *fiyatları* gösterim amaçlı kalıyor (1–2. maddeler); kalkış *saatleri* beslemenin kapsadığı yerlerde gerçek (6. madde). Checkout, gerçek, canlı, rezerve edilebilir bir eurotrain.net sayfasına yönlendiriyor, huninin "bu gerçek mi" sorusunun en çok önem taşıdığı tek yer, ve uygulamanın ödemeyle ilgili hiçbir sır/API anahtarı yönetimine ihtiyacı yok.

## 8. Mimari

```
App.tsx                    giriş noktası: sağlayıcılar (gesture handler, safe area, app state) + network gate + navigator,
                             alttaki uygulama zaten yüklenirken üzerine bindirilen SplashIntro ile birlikte (§1)
src/
  navigation/               React Navigation stack + route parametre tipleri
  screens/                  ekran başına bir dosya, bileşenlerden oluşturulmuş (HelpScreen dahil)
  components/               sunum amaçlı + modal bileşenler, iş mantığı yok (NetworkGate, SplashIntro dahil)
  services/                 journeyGenerator (fiyatlandırma), currencyService (FX), bookingLink (checkout derin bağlantısı, §7),
                             liveScheduleService (gerçek GTFS kaynaklı kalkışlar, §7), recentSearches (cihaz üzerinde
                             kalıcılık, §7)
  state/                    AppState: ekranlar arası arama/seçim context'i (yalnızca bellekte, §7)
  hooks/                    useExchangeRates, useNetworkStatus, useRecentSearches, useTranslation
  i18n/                     translations.ts: TR/EN metin sözlüğü (§6)
  data/                     stations.ts, routes.ts, fareClasses.ts: tohum veri kümesi
  theme/                    tasarım token'ları
  types/                    paylaşılan TypeScript arayüzleri
scripts/                    fetch-live-schedules.mjs (+ gtfs-lib.mjs, testi): düz Node.js, uygulama paketinin
                             tamamen dışında; uygulama tarafından değil GitHub Actions tarafından çalıştırılır (§7)
.github/workflows/          refresh-schedules.yml: scripts/ içindekini çalıştıran ve live-schedules.json'ı
                             `data` dalına yayınlayan zamanlanmış hat
```

Ekranlar düzeni ve kullanıcı etkileşimini sahiplenir; bileşenler yeniden kullanılabilir ve sunum amaçlıdır; servisler tüm iş/veri mantığını sahiplenir ve gerçek bir backend'in daha sonra takılacağı dikiş yeridir. Bu ayrım, "mock veriyi gerçek bir API ile değiştirmeyi" bir ekran yeniden yazımı yerine bir servis-katmanı değişikliği yapan ana şey. `liveScheduleService.ts`, tam olarak bu değişimin programlar için zaten gerçekleştiğinin çalışan bir örneği; gerçek bir ücret API'sine erişilebildiğinde `journeyGenerator.ts`'in fiyatlandırması için de aynı desen hazır.

## 9. Yol haritası

*Ayrıca bağımsız bir dosya olarak da mevcut: [`ROADMAP.md`](./ROADMAP.md).*

**MVP (bu teslim)**
- Tam Türkçe/İngilizce arayüzle tek yön ve gidiş-dönüş arama (§6)
- Hızlı tarih ön ayarları ve en-ucuz-gün vurgusu; tarih/ücret sınıfı karşılaştırması
- Uygun olan yerlerde gerçek GTFS kaynaklı kalkış saatleri ve gecikmeler (§7.6), diğer yerlerde sentetik yedek
- Cihaz üzerinde son aramalar, son 5 (§7.7)
- Gerçek eurotrain.net derin bağlantı checkout yönlendirmesi, tek bağlantıda her iki bacak (§7.4)
- eurotrain.net'in gerçek destek sayfalarına bağlantı veren uygulama içi Yardım ve iletişim ekranı
- Gerçek cihaz-bağlantısı kapısı (§7.5)
- Animasyonlu açılış ekranı; temel boş/yükleniyor/hata durumları
- Yedekli canlı FX dönüşümü

**MVP sonrası** (sıradaki, hâlâ lansman öncesi)
- Mevcut `services/` dikişinin arkasında gerçek Rail Europe fiyatlandırma/rezervasyon API'si, sadece saatler değil, gerçekten canlı *fiyatlar* için
- Canlı kapsamın aktarmalı/interline yolculuklara genişletilmesi (şu anda yalnızca tek-doğrudan-tren)
- Gerçek beslemeye ulaşılabildiğinde peron/gecikme verisinin ona karşı doğrulanması (şu anda yalnızca sentetik bir fixture'a karşı test edildi)
- Hesaplar + cihazlar arasında senkronize kayıtlı aramalar (bugünkü son aramalar, §7.7, yalnızca cihazda)
- Daha güçlü bir bağlantı kontrolü: yalnızca `navigator.onLine`/OS durumu değil, aktif bir erişilebilirlik probu
- Açık-çeneli (open-jaw) yolculuklar (vardığınızdan farklı bir şehirden dönmek)
- Zaten var olan gerçek zamanlı gecikme verisi (§7.6) üzerine inşa edilen canlı tren durumu push bildirimleri
- Huni terk oranı analitiği (arama → sonuçlar → checkout → yönlendirme-tıklaması)
- Google hesabıyla bağlanma (hesap eşleme): kayıtlı aramaların ve ileride olası rezervasyon geçmişinin, ayrı bir e-posta/şifre akışı kurmadan cihazlar arasında kullanıcıyı takip edebilmesini sağlar; ayrıca yaygın kullanılan Google Takvim entegrasyonundan yararlanarak planlanan yolculukları kullanıcının takvimine otomatik olarak ekler. Üyelik oluşturmayı kolaylaştırarak kullanıcı memnuniyetini önceliklendiren bir adım.
- Yukarıdaki canlı tren durumu bildirimlerinin yerine değil, üzerine eklenen, teklif ve güncellemeler için push bildirimleri
- Ayrı bir e-posta kanalı kurmadan sezonluk teklifleri veya duyuruları öne çıkarmak için uygulama içi kampanya pop-up'ları
- Gerçek dünya hatalarının manuel QA'ya bağlı kalmadan otomatik olarak ortaya çıkması için, hatalar üzerine bir Firebase entegrasyonu

**Gelecek**
- Sadakat/puan programı
- Son-kullanıcı özelliği olarak bir yapay zeka gezi planlama asistanı (örn. "4 günlük Benelux gezisi planla" → önceden doldurulmuş çok-şehirli arama), bu MVP'den kasıtlı olarak dışarıda bırakıldı
- Odamigo'nun mevcut müşteri tabanı için B2B/seyahat-acentesi rezervasyon modu
- TR/CY/AZ pazarlarını tam kapsamak için Rusça dil desteği
- Kullanım verisi gerektirdiğini gösterirse, bugünkü statik SSS + bağlantı-verme yerine Yardım ekranında uygulama içi destek sohbeti
- MVP'de zaten var olan tekerlekli sandalye-kullanıcısı arama bayrağının ötesinde tam bir erişilebilirlik denetimi
- Kullanıcıların uygulama içinde nereye dokunup nasıl kaydırdığını gösteren heatmap takibi, gelecekteki UX önceliklerini bu veriyle şekillendirmek için
- Arama akışını kesmek yerine olumlu bir andan sonra (örn. bir yönlendirme tamamlandığında) gösterilen bir "uygulamayı değerlendir" pop-up'ı
- Firebase tabanlı satın alma hunisi (funnel) takibi, kullanıcıların hangi adımda (arama, sonuçlar, checkout, yönlendirme) tam olarak vazgeçtiğini tespit etmek için
- A/B test altyapısı (Firebase A/B Testing), fiyatlandırma sunumunu, paket isimlerini veya buton renklerini kullanıcı grupları arasında test etmek için
- Coğrafi konuma veya kullanıcı segmentine göre farklı fiyat/paket sunumu yapan dinamik fiyatlandırma
- Sepeti terk edeni yakalama: kullanıcı Checkout'a girip yönlendirmeyi tamamlamadan çıkarsa, bir süre sonra (örn. 15 dakika ya da 1 saat) Firebase Cloud Messaging ya da OneSignal üzerinden otomatik bir indirim bildirimi tetiklemek
- Geçici koltuk kilitleme: seçilen koltuğu veritabanında birkaç dakika (örn. 5 dakika) için kilitleyip ekranda bir geri sayım göstererek, kullanıcıyı checkout'u daha hızlı tamamlamaya iten bir aciliyet hissi yaratmak
- Checkout'ta Apple Pay ve Google Pay desteği, kullanıcının uzun kredi kartı numarası girmesine gerek kalmadan
- Fiyat/koltuk alarmları: kullanıcının, yer bulamadığı bir arama ya da düşmesini beklediği bir fiyat için alarm kurabilmesi; koltuk açıldığı ya da fiyat düştüğü an [Firebase Cloud Messaging](https://firebase.google.com/products/cloud-messaging) ya da [OneSignal](https://onesignal.com/) üzerinden tetiklenir
- Sonuçlar listesinde, bir seferde son birkaç koltuk kaldığında ("Son 3 koltuk!" gibi) kalın/kırmızı yazıyla vurgulanan bir kalan koltuk sayısı göstergesi
- Checkout'tan hemen önce, seyahat sigortası, tren içi yemek menüsü ya da varış noktasında yerel transfer/araç kiralama (örn. [Uber API](https://developer.uber.com/) ya da Rentalcars API üzerinden) gibi çapraz satış entegrasyonlarının sepet onay kutusu olarak sunulması

---

*Bu dosya, `README.md`'nin (İngilizce) Türkçe çevirisidir; başvuru sahibinin okuması için hazırlanmıştır ve uygulamanın mevcut durumunu İngilizce sürümle birebir yansıtacak şekilde güncel tutulmuştur. Asıl teslim edilecek `README.md` İngilizce kalmalı; bu dosya yalnızca referans içindir.*
