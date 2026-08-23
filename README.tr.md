# EuroTrain — Mobil Deneyim MVP'si

Odamigo'nun **AI Product Development Case: EuroTrain Mobile Experience** görevi için hazırlanmış bir başvuru teslimidir.

React Native (Expo) + TypeScript ile geliştirildi. Tek bir kod tabanından iOS, Android ve web'de çalışır.

📍 **Yol haritasını mı arıyorsun?** Kısa, madde işaretli bir MVP / Post-MVP / Gelecek dökümü için [`ROADMAP.md`](./ROADMAP.md)'ye bak — bu README'nin [§9](#9-yol-haritası) bölümü aynı içeriği, her maddenin gerekçesiyle birlikte uzun anlatım halinde kapsıyor.

## Canlı önizleme

Kurulum ya da hesap gerekmiyor — ücretsiz **Expo Go** uygulaması kurulu bir telefondan tarat ya da aç ([App Store](https://apps.apple.com/app/expo-go/id982107779) / [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)):

**[expo.dev/preview/update?...](https://expo.dev/preview/update?message=Runtime+version+d%C3%BCzeltmesi&updateRuntimeVersion=1.0.0&createdAt=2026-08-23T14%3A20%3A41.726Z&slug=exp&projectId=9d76b6ad-204e-478b-aacd-6ce673db112e&group=34f3308b-5ae8-47dc-bfa5-0d60f55738e1)**

Bu link, cihazda gerçekten native olarak çalışan uygulamayı EAS Update üzerinden `preview` branch'inden açıyor — web önizlemesi ya da mockup değil, bu reponun gerçek `journeyGenerator`/`bookingLink`/`liveScheduleService` kodu. Linki açmak için giriş yapmaya ya da Expo hesabına gerek yok — herkese açık bir önizleme sayfası, QR kod ve "Open in Expo Go" seçeneğiyle; çıkış yapılmış bir oturumda hem Android hem iOS'ta çalıştığı doğrulandı. (Tarayıcı tabanlı bir önizleme istersen, yerel `expo export --platform web` build'i için [§2 Hızlı başlangıç](#2-hızlı-başlangıç)'a bakın.)

---

## 1. Neler yaptım

Case'in açıkça işaret ettiği tek yolculuğu — *"keşfet, planla ve satın almaya yönlendir"* — uçtan uca kapsayan, mobil öncelikli bir MVP:

**Açılış** — birkaç saniyelik animasyonlu bir giriş (bir tren rozetinin etrafında kehribar rengi bir halka çiziliyor, wordmark belirir, sonra tamamı kayboluyor); alttaki gerçek uygulama zaten yüklenirken bunun üzerine bindirilir, onu bekletmez — bkz. [§7](#7-apiler-ve-veri-stratejisi).

**Ana ekran (Home)** — gerçek bir istasyon listesiyle kalkış/varış araması, tek yön/gidiş-dönüş geçişi, tam tarih seçici(ler)in yanında "Bugün / Yarın / Hafta sonu" hızlı seçim kutucukları (gidiş-dönüşte, gidiş tarihinden önce olamayacak şekilde sınırlanmış bir dönüş tarihi alanı belirir), yaş bantlarıyla yolcu sayıları (Eurostar/Rail Europe'un fiyatlandırmayı gerçekte nasıl yaptığına uygun), tekerlekli sandalye erişilebilirlik bayrağı, hızlı seçilebilir popüler güzergahlar, ve yalnızca etiketleri değil tüm arayüz metnini kapsayan tam bir Türkçe/İngilizce dil geçişi — bkz. [§6](#6-teknoloji-yığını). Bir arama yaptıktan sonra, en fazla 5 tanesi burada da hatırlanır — aşağıdaki **Son aramalarım**'a bakın.

**Son aramalarım** — son 5 farklı güzergah + yolculuk tipi araması, yalnızca bellekte değil cihazda kalıcı olarak saklanır (uygulamayı kapatınca kaybolmaz), Ana ekranda güzergah, yolculuk tipi ve yolcu sayısıyla gösterilir; birine dokunmak, aramanın orijinal olarak yapıldığı tarihi tekrarlamak yerine onu bugüne tarihlenmiş şekilde yeniden çalıştırır; her giriş (veya tüm liste) kaldırılabilir. Bkz. [§7](#7-apiler-ve-veri-stratejisi).

**Sonuçlar (Results)** — yakın günlerdeki en düşük fiyatı gösteren bir tarih şeridi (kullanıcı taahhüt etmeden önce tarihe göre alışveriş yapabilsin diye; görünen günler arasından en ucuz olanın kutucuğu yeşille vurgulanır), üç ücret sınıfının (Standard / Plus / Premier) yan yana gösterildiği sefer bazlı bir liste, doluluk/az yer kaldı sinyalleri, canlı EUR→TRY/USD/GBP para birimi geçişi ve ücret koşulları detay sayfaları. Kalkış saatleri, o güzergah/tarih için canlı bir besleme mevcutsa Eurostar'ın kendi gerçek, planlanmış saatleridir ("Canlı" rozetiyle işaretlenir, varsa bildirilen gecikmeyle birlikte); aksi halde açıkça etiketlenmiş sentetik bir yedek kullanılır — bkz. [§7](#7-apiler-ve-veri-stratejisi). Gidiş-dönüş için bu ekran iki kez kullanılır — Gidiş, sonra Dönüş — bu da araştırma sırasında gerçek eurostar.com rezervasyon akışında gözlemlediğim adım desenini yansıtıyor; devam etmeden önce gidiş seçimine dönmek için bir bağlantı da mevcut.

**Ödeme özeti / yönlendirme (Checkout)** — bir yolculuk özeti (gidiş-dönüşte her iki bacak ve birleşik tahmini toplam) ve kullanıcıyı, yapılandırdığı aynı kalkış, varış, tarih(ler) ve yolcu sayısıyla eurotrain.net'in gerçek, canlı arama sonuçları sayfasına yönlendiren bir "Eurotrain.net'te devam et" eylemi — böylece yolcu güncel, gerçek fiyatları görür ve satın alma işlemini o gerçek sitede tamamlar; gidiş-dönüş tek bir bağlantıda dahil. Bu uygulamaya asla bir ödeme formu, kart bilgisi veya hesap girmiyor. Bu checkout modelinin neden bir sahte ödeme formu yerine bu şekilde olduğu ve yönlendirme hedefinin neden eurostar.com değil eurotrain.net olduğu için bkz. [§7](#7-apiler-ve-veri-stratejisi).

**Onay / yönlendirme özeti (Confirmation)** — yolculuğu tekrar özetler (gidiş-dönüşte her iki bacak), uygulama içinde herhangi bir rezervasyon veya ücretlendirme yapılmadığını açıkça belirtir ve eurotrain.net'i tekrar açma veya yeni bir arama başlatma seçeneği sunar.

**Yardım ve iletişim** — Ana ekrandaki bir "?" düğmesinden ulaşılan, bir değerlendiricinin en çok merak edeceği şeyleri (fiyatların neden demo verisi gibi göründüğü, neden uygulama içi ödeme olmadığı, "Canlı" rozetinin ne anlama geldiği, gidiş-dönüşün nasıl çalıştığı, dilin nasıl değiştirileceği, bağlantı-yok ekranının ne anlama geldiği) kapsayan uygulama içi bir SSS'ye sahip özel bir ekran, artı eurotrain.net'in kendi gerçek yardım merkezine ve iletişim formuna bağlantılar — bu uygulamanın hiç sahip olmadığı bir destek kutusunu uydurmak yerine. Bkz. [§7](#7-apiler-ve-veri-stratejisi).

**Bağlantı yok ekranı** — cihazın kullanılabilir bir bağlantısı olmadığı her an (hem açılışta hem de oturum sırasında bağlantı koptuğunda), "İnternet bağlantısı yok" tam ekran durumu tüm uygulamayı kaplar; "Tekrar dene" eylemi ve bağlantı geri geldiğinde otomatik kurtarma ile birlikte. Bkz. [§7](#7-apiler-ve-veri-stratejisi).

Yükleniyor, boş ("doğrudan güzergah yok" / "o gün sefer yok") ve hata (yeniden deneme seçenekli simüle edilmiş ağ hatası) durumları, en çok önem taşıdıkları iki ekranda uygulanmış durumda — sadece mutlu senaryo değil.

**Yapmadıklarım**: kimlik doğrulama/hesaplar, bir "Rezervasyonlarım" alanı, çok bacaklı/aktarmalı yolculuklar, koltuk haritaları veya uygulama içi ödeme toplama. Nedeni için bkz. [§3](#3-ürün-kapsamı-ve-önceliklendirme).

## 2. Hızlı başlangıç

```bash
npm install
npx expo start          # ardından web için "w" tuşuna basın, ya da QR kodu Expo Go ile okutun
```

Geliştirme sırasında otomatik testler için kullanılan web derlemesi:

```bash
EXPO_OFFLINE=1 npx expo export --platform web   # -> dist/, herhangi bir statik sunucuyla servis edilebilir
```

(`EXPO_OFFLINE=1` yalnızca Expo'nun kendi güncelleme kontrolü çağrısının engellendiği, ağı kısıtlı CI/sandbox ortamlarında gerekiyor — bkz. §7.)

**Gerçek canlı kalkış saatlerini açmak için isteğe bağlı, tek seferlik adım (§7):** uygulama bunu yapmadan da hemen çalışır — sadece siz bu adımı tamamlayana kadar açıkça etiketlenmiş sentetik programı gösterir.

1. Bu repoyu kendi GitHub reponuza push edin (sıradan bir `git push`, özel bir şey yok).
2. `src/services/liveScheduleService.ts` dosyasını açın ve şu satırı değiştirin:
   ```ts
   const LIVE_SCHEDULE_REPO = 'YOUR_GITHUB_USERNAME/YOUR_REPO_NAME';
   ```
   gerçek `kullanıcı-adı/repo-adı` değerinizle, örn. `'kullaniciadiniz/eurotrain-mvp'`.
3. Bu kadar — deploy edilecek veya kayıt olunacak bir şey yok. `refresh-schedules` GitHub Actions iş akışı, workflow dosyası GitHub'a ulaşır ulaşmaz kendi zamanlamasında (her 15 dakikada bir) otomatik olarak çalışmaya başlar. İlerlemeyi reponun **Actions** sekmesinden takip edebilirsiniz; beklemeden hemen bir çalıştırma tetiklemek için oradan "Refresh live schedules" iş akışını açıp **Run workflow**'a tıklayın.
4. İlk çalıştırma tamamlandığında `https://raw.githubusercontent.com/<kullanıcı>/<repo>/data/live-schedules.json` yayında olur ve Sonuçlar ekranı, beslemenin kapsadığı güzergah/tarihler için gerçek kalkış saatlerini ("Canlı" rozetiyle) göstermeye başlar.

## 3. Ürün kapsamı ve önceliklendirme

Brief kasıtlı olarak bir özellik listesi vermiyor, o yüzden neyin neden içeride/dışarıda olduğunun gerekçesi burada.

**Kapsamda**, çünkü bu tam olarak temel değer önerisinin kendisi ("keşfet, planla, satın almaya yönlendir"): gerçek bir istasyon kümesi ve makul yolcu/erişilebilirlik girdileriyle arama; tek yön **ve gidiş-dönüş** arama, çünkü dönüş bacağı en yaygın gerçek dünya yolculuk şekillerinden biri ve gerçek eurostar.com bunu bir ek özellik değil, çekirdek bir şey olarak ele alıyor (araştırma sırasında canlı "Dönüş ekle" akışını yürüterek doğruladım); tarihler ve ücret sınıfları arasında fiyat karşılaştırması (gerçek eurostar.com'daki tek en büyük UX ayrıştırıcısı bu — bu MVP'yi tasarlamadan önce canlı sitelerini gezerek doğruladım, bkz. `eurostar-analiz.md`); yalnızca gösterim amaçlı zaman dilimleri değil, Eurostar'ın kendi açık GTFS beslemesinden alınan gerçek, canlı yenilenen kalkış/varış saatleri ve gecikme durumu (§7); yolcuyu, yapılandırdığı tam yolculuk için *gerçek, canlı* bir eurostar.com aramasına teslim eden bir checkout/yönlendirme adımı — böylece "satın almaya yönlendir" sahte bir başarı ekranı yerine gerçek, rezerve edilebilir bir sayfada sona eriyor.

**Kasıtlı olarak dışarıda bırakılanlar** ve nedenleri:

- **Hesaplar / giriş / sadakat programı (Club Eurostar benzeri puanlar)** — gerçek bir değer, ama çekirdek rezervasyon yolculuğunun çalıştığını kanıtlamakla dolaylı bir ilişkisi var. Misafir, tıkla-çık akışı zaten "satın alma" adımını uçtan uca gösteriyor.
- **Koltuk seçimi / koltuk haritaları** — yüksek uygulama maliyeti, bir ürün-düşüncesi egzersizi için düşük sinyal; Standard/Plus/Premier sınıf seçimi zaten fiyatlandırma katmanı UX'ini gösteriyor.
- **Çok bacaklı / aktarmalı yolculuklar** (örn. Brüksel üzerinden Londra → Köln) — gerçek Rail Europe ağı bunu destekliyor, ama odaklanmayı ödüllendiren bir case için fiyatlandırma modeli karmaşıklığını kabaca ikiye katlıyor.
- **Uygulama içi ödemeler** — brief'e göre (case §4/§6) açıkça kapsam dışı; sahte bir ödeme formu taklit etmek yerine, MVP eurotrain.net'in kendi gerçek, güvenli checkout'una yönlendiriyor (§7).
- **Canlı tren durumu için push bildirimleri** — gerçekten değerli (Eurostar'ın kendi pazarlama metnine göre kendi uygulamasının var olmasının #1 nedeni bu), ama burada ürün-kararı sinyali eklemeyen bir backend/bildirim servisi gerektiriyor.

## 4. Temel kullanıcı yolculuğu

Tek yön: Ana ekran → Sonuçlar → (ücret seç) → Checkout (özet + yönlendirme) → Onay (yönlendirme özeti), her ekranda tam olarak bir zorunlu karar ile (nereye, ne zaman/hangi ücret, eurotrain.net'te devam et). Gidiş-dönüş: aynı akış, bir ek kararla — Checkout'tan önce Sonuçlar ekranı önce Gidiş, sonra Dönüş için kullanılır — bu da araştırma sırasında eurostar.com'un kendi rezervasyon akışında bulduğum Gidiş → Dönüş → Checkout breadcrumb'ını yansıtıyor, farklı bir desen icat etmek yerine. Bir ücret seçildiğinde yolculuk özeti her zaman görünür durumda kalır (yapışkan bir alt çubuk), eurostar.com'da etkili olduğunu gözlemlediğim deseni yansıtarak — kullanıcı, uygulamadan ayrılmadan önce hangi yolculukla devam edeceğini her zaman biliyor.

## 5. UX/UI düşüncesi

- **Bilgi hiyerarşisi**: fiyat ve saat, bir tren yolcusunun ilk taradığı iki şey, bu yüzden sonuç listesinde en büyük tipografiyi alıyorlar; geri kalan her şey (süre, bagaj kuralları, kalan koltuk) ikincil.
- **Geri bildirim**: her asenkron eylemin (arama, ödeme) görünür bir yükleniyor durumu var; sonuçlardaki tarih şeridi dokunmada anında güncelleniyor, böylece tarihe göre alışveriş anlık hissettiriyor.
- **Boş/hata durumları birinci sınıf**, sonradan akla gelen bir şey değil: geçersiz bir kalkış/varış çifti arama düğmesini devre dışı bırakır *ve* nedenini açıklar (geçersiz bir istek asla ulaşılabilir olmamalı); Sonuçlar'da simüle edilmiş bir ağ hatası boş bir ekran yerine bir yeniden deneme eylemi gösterir; sefer olmayan bir tarih, boş bir liste göstermek yerine bunu söyler.
- **Para birimi yedeği görünür, sessiz değil**: canlı FX çağrısı başarısız olduğunda arayüz bunu söyler ("canlı" vs "önbellek" rozeti) sayının taze olduğunu iddia etmek yerine.

## 6. Teknoloji yığını

| Katman | Seçim | Neden |
|---|---|---|
| Framework | React Native + Expo (TypeScript) | Tek kod tabanı → iOS/Android/web; Expo'nun yönetilen iş akışı native derleme yükünü ortadan kaldırıyor, bu da 4-6 saatlik bir case için önemli; JS/TS ağırlıklı bir ürün organizasyonuyla büyük işe alım havuzu örtüşmesi. |
| Navigasyon | React Navigation (native-stack) | Fiili standart, native performans, 4 ekran için küçük API yüzeyi. |
| State | React Context (`AppState`) | Paylaşılan state (arama kriterleri, seçilen ücret) küçük ve sığ — bu ölçekte Redux/Zustand haksız bir ek yük olurdu. Bir gözden kaçırma değil, bilinçli bir seçim olarak belgelendi. |
| Stil | `StyleSheet` + küçük, elle yazılmış bir token sistemi (`src/theme`) | Kurulacak/öğrenilecek bir tasarım sistemi bağımlılığı yok; token'lar renkleri/boşlukları tutarlı ve değiştirilebilir tutuyor. |
| Veri | Yerel TypeScript modülleri (`src/data`, `src/services`) | Bkz. §7. |
| Bağlantı | `expo-network` (`NetworkGate`, `useNetworkStatus`) | Resmi Expo modülü, yönetilen iş akışında sıfır native yapılandırma; simüle edilmek yerine gerçek cihaz/tarayıcı bağlantısını yansıtır. Bkz. §7. |
| Yerelleştirme | Elle yazılmış i18n (`src/i18n/translations.ts`, `useTranslation`) | Hem `tr` hem `en` sözlüğünün uyması gereken tek bir `Strings` TypeScript arayüzü, böylece eksik bir çeviri çalışma zamanında sessizce yanlış dile düşmek yerine bir derleme hatası oluyor; 2 dil için bir kütüphaneye gerek yok. |
| Yerel kalıcılık | `@react-native-async-storage/async-storage` (`src/services/recentSearches.ts`) | Uygulamanın gerçekten kalıcı olan tek durumu (son aramalar, §7) `AppState`'in bellek-içi context'ine karışmak yerine kendi depolama-destekli servisine izole edilmiş — çünkü uygulama yeniden başlatmasına hayatta kalması gereken tek şey bu. |
| Canlı sefer besleme hattı | GitHub Actions zamanlamasında düz bir Node.js betiği (`scripts/fetch-live-schedules.mjs`), çıktısı `raw.githubusercontent.com` üzerinden bir `data` dalından servis ediliyor | Çalıştırılacak veya ücret ödenecek bir sunucu yok; bir GTFS-zip ayrıştırma işinin fazlasıyla aşacağı Cloudflare Workers'ın ücretsiz katman 10ms-CPU-başına-çağrı sınırını dolanıyor. Bkz. §7. |

## 7. API'ler ve veri stratejisi

Brief özellikle bunu istediği için en açık olmak istediğim karar bu.

**Rail Europe'un gerçek rezervasyon/fiyatlandırma API'sine bu case için erişilemiyor** — bu bir B2B ortaklık entegrasyonu, kendi kendine kayıt olunabilecek bir şey değil. eurostar.com'un canlı aramasını scrape etmek düşünüldü ve reddedildi: kullanım şartlarını ihlal eder, kırılgandır, ve brief'in uyardığı production-hazırlığı kırmızı bayrağının tam örneğidir.

**Bunun yerine bir hibrit:**

1. **Gerçek, statik referans verisi** (`src/data/stations.ts`, `src/data/routes.ts`) — eurostar.com'a manuel göz atılarak toplanan gerçek istasyon isimleri, şehirler, koordinatlar, güzergah süreleri ve ücret aralıkları (bkz. `eurostar-analiz.md`). Canlı veri değil, öyle olduğunu iddia etmiyor.
2. **Deterministik fiyatlandırma** (`src/services/journeyGenerator.ts`) — ücretler `Math.random()` değil, güzergah+tarih+saat-diliminin seed'lenmiş bir hash'inden türetiliyor. Aynı arama her zaman aynı sonucu döndürür; yine de gerçek sitede gözlemlenen desenlere benzer biçimde çeşitlenir (hafta sonu/son dakika zammı, ara sıra dolu ücret sınıfları).
3. **Gerçekten canlı tek bir API** (`src/services/currencyService.ts`) — `frankfurter.app` (ücretsiz, anahtarsız, ECB destekli) ile EUR→TRY/USD/GBP dönüşümü, 4s zaman aşımı ve başarısızlıkta etiketlenmiş bir yedek kur. Odamigo'nun TR/CY/AZ pazarları için gerçek ürün değeri, bir demo süsü değil.
4. **Checkout'ta gerçek derin bağlantı** (`src/services/bookingLink.ts`) — kullanıcının gerçek kalkış/varış/tarih(ler)/yolcu sayısıyla eurotrain.net'in gerçek arama sonuçları sayfasına bir URL oluşturur (gidiş-dönüş tek bağlantıda), `Linking.openURL` ile açılır. İstasyon id'leri eurotrain.net'in kendi `bookingSlug`'ları, canlı site gezilerek elle yakalandı. Bu uygulamaya asla ödeme formu, kart bilgisi veya hesap girmiyor — Skyscanner/Google Flights'ın metasearch/tıkla-çık deseni. (Build sırasında yönlendirme hedefi eurostar.com'dan eurotrain.net'e değiştirildi; aynı araştırma-önce doğrulama süreci yeni site için tekrarlandı.)
5. **Gerçek bağlantı kapısı** (`src/hooks/useNetworkStatus.ts`, `src/components/NetworkGate.tsx`) — cihazın gerçek bildirilen ağ durumuna dayanarak, manuel yeniden deneme ve otomatik kurtarma ile tüm uygulamayı tam ekran bir "internet yok" durumunun arkasına kilitler. Bilinen sınırlama: "bir ağa bağlı"yı yansıtır, "internet gerçekten erişilebilir"i değil (örn. gerçek interneti olmayan bir Wi-Fi captive portal çevrimiçi olarak okunur).
6. **Gerçek, canlı yenilenen kalkışlar** (`scripts/fetch-live-schedules.mjs`, `src/services/liveScheduleService.ts`) — Eurostar/Thalys'in resmi açık GTFS + GTFS-RT beslemesi (ücretsiz, anahtarsız, Fransa'nın Licence Ouverte 2.0'ı altında). Zamanlanmış bir GitHub Actions iş akışı (`refresh-schedules.yml`) besleyip ayrıştırıyor ve `live-schedules.json`'ı bir `data` dalına yayınlıyor; uygulama onu zaman aşımı ve bellek içi önbellekle okuyor. (Başta Cloudflare Worker olarak planlandı; Cloudflare'in ücretsiz plan 10ms-CPU sınırının GTFS ayrıştırmayı kaldıramayacağı görülünce GitHub Actions'a geçildi.) Canlı kalkışlar "Canlı" rozeti alır; kapsanmayan güzergahlar sentetik üreticiye döner, arayüz hangisinin gösterildiğini dürüstçe etiketler. Tek seferlik kurulum: `LIVE_SCHEDULE_REPO`'yu kendi reponuza yönlendirin (§2).
7. **Cihaz üzerinde son aramalar** (`src/services/recentSearches.ts`, `@react-native-async-storage/async-storage`) — bir yeniden başlatmaya hayatta kalan tek durum; geri kalan her şey (`AppState`) tasarım gereği yalnızca bellekte. Son 5, güzergah + yolculuk-tipine göre tekilleştirilmiş, yeniden çalıştırmada bayat bir tarihi tekrarlamak yerine bugüne tarihlenmiş (§1), her okuma/yazma try/catch içine sarılmış.

**Ödünleşim**: ücret *fiyatları* gösterim amaçlı kalıyor (1–2. maddeler); kalkış *saatleri* beslemenin kapsadığı yerlerde gerçek (6. madde). Checkout, gerçek, canlı, rezerve edilebilir bir eurotrain.net sayfasına yönlendiriyor — huninin "bu gerçek mi" sorusunun en çok önem taşıdığı tek yer — ve uygulamanın ödemeyle ilgili hiçbir sır/API anahtarı yönetimine ihtiyacı yok.

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
  state/                    AppState — ekranlar arası arama/seçim context'i (yalnızca bellekte, §7)
  hooks/                    useExchangeRates, useNetworkStatus, useRecentSearches, useTranslation
  i18n/                     translations.ts — TR/EN metin sözlüğü (§6)
  data/                     stations.ts, routes.ts, fareClasses.ts — tohum veri kümesi
  theme/                    tasarım token'ları
  types/                    paylaşılan TypeScript arayüzleri
scripts/                    fetch-live-schedules.mjs (+ gtfs-lib.mjs, testi) — düz Node.js, uygulama paketinin
                             tamamen dışında; uygulama tarafından değil GitHub Actions tarafından çalıştırılır (§7)
.github/workflows/          refresh-schedules.yml — scripts/ içindekini çalıştıran ve live-schedules.json'ı
                             `data` dalına yayınlayan zamanlanmış hat
```

Ekranlar düzeni ve kullanıcı etkileşimini sahiplenir; bileşenler yeniden kullanılabilir ve sunum amaçlıdır; servisler tüm iş/veri mantığını sahiplenir ve gerçek bir backend'in daha sonra takılacağı dikiş yeridir. Bu ayrım, "mock veriyi gerçek bir API ile değiştirmeyi" bir ekran yeniden yazımı yerine bir servis-katmanı değişikliği yapan ana şey — `liveScheduleService.ts`, tam olarak bu değişimin programlar için zaten gerçekleştiğinin çalışan bir örneği; gerçek bir ücret API'sine erişilebildiğinde `journeyGenerator.ts`'in fiyatlandırması için de aynı desen hazır.

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
- Mevcut `services/` dikişinin arkasında gerçek Rail Europe fiyatlandırma/rezervasyon API'si — sadece saatler değil, gerçekten canlı *fiyatlar*
- Canlı kapsamın aktarmalı/interline yolculuklara genişletilmesi (şu anda yalnızca tek-doğrudan-tren)
- Gerçek beslemeye ulaşılabildiğinde peron/gecikme verisinin ona karşı doğrulanması (şu anda yalnızca sentetik bir fixture'a karşı test edildi)
- Hesaplar + cihazlar arasında senkronize kayıtlı aramalar (bugünkü son aramalar, §7.7, yalnızca cihazda)
- Mevcut 9-istasyonluk tohumun ötesinde genişletilmiş istasyon/güzergah tablosu
- eurotrain.net'e sınıf-farkında derin bağlantı (URL şemasının desteklediği henüz doğrulanmadı)
- Daha güçlü bir bağlantı kontrolü — yalnızca `navigator.onLine`/OS durumu değil, aktif bir erişilebilirlik probu
- Açık-çeneli (open-jaw) yolculuklar (vardığınızdan farklı bir şehirden dönmek)
- Zaten var olan gerçek zamanlı gecikme verisi (§7.6) üzerine inşa edilen canlı tren durumu push bildirimleri
- Huni terk oranı analitiği (arama → sonuçlar → checkout → yönlendirme-tıklaması)
- Daha geniş otomatik test kapsamı: `journeyGenerator`, `bookingLink`, `recentSearches` üzerinde birim testleri; tam akış üzerinde e2e

**Gelecek**
- Sadakat/puan programı
- Son-kullanıcı özelliği olarak bir yapay zeka gezi planlama asistanı (örn. "4 günlük Benelux gezisi planla" → önceden doldurulmuş çok-şehirli arama) — bu MVP'den kasıtlı olarak dışarıda bırakıldı
- Odamigo'nun mevcut müşteri tabanı için B2B/seyahat-acentesi rezervasyon modu
- TR/CY/AZ pazarlarını tam kapsamak için Rusça dil desteği
- Kullanım verisi gerektirdiğini gösterirse, bugünkü statik SSS + bağlantı-verme yerine Yardım ekranında uygulama içi destek sohbeti
- MVP'de zaten var olan tekerlekli sandalye-kullanıcısı arama bayrağının ötesinde tam bir erişilebilirlik denetimi

---

*Bu dosya, `README.md`'nin (İngilizce) Türkçe çevirisidir; başvuru sahibinin okuması için hazırlanmıştır ve uygulamanın mevcut durumunu İngilizce sürümle birebir yansıtacak şekilde güncel tutulmuştur. Asıl teslim edilecek `README.md` İngilizce kalmalı; bu dosya yalnızca referans içindir.*
