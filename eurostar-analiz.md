# Eurostar.com — Ürün Analizi (Mobil Uygulama Case Study İçin)

**Kaynak:** https://www.eurostar.com/rw-en
**Analiz tarihi:** 18 Ağustos 2026
**Yöntem:** Site canlı olarak gezilerek (ana sayfa → bilet arama → fiyat/koltuk seçimi → ekstra hizmetler → ödeme → hesap/sadakat sayfaları) uçtan uca incelendi.

Eurostar, Londra–Paris–Brüksel–Amsterdam gibi şehirler arasında yüksek hızlı tren bileti satan bir seyahat platformu. Aşağıda, benzer bir mobil uygulama (case study) tasarlarken referans alınabilecek tüm özellikler, akışın adımlarına göre gruplanmış şekilde listelenmiştir.

---

## 1. Ana Sayfa ve Genel Navigasyon

- **Üç ayrı arama modu (tab yapısı):** Trains / Train + Hotel / Hotels — tek bir arama kutusunda birden fazla ürün tipi arasında geçiş.
- **Global/dil-ülke seçici:** Sağ üstte "Global" ikonu ile ülke ve dil değiştirme (çoklu pazar desteği).
- **"Get the app" çağrısı:** Header'da her sayfada sabit, mobil uygulamayı indirmeye yönlendiren link.
- **Yapay zekâ destekli sohbet asistanı ("Ask AI"):** Sağ üstte sabit buton; tıklanınca sohbet paneli açılıyor. Karşılama mesajı + hazır kısayol butonları sunuyor: "Find cheap tickets", "Manage booking", "Train disruptions", "My train was delayed" ve serbest metin soru sorma alanı. Ayrıca sağ altta sürekli görünen ayrı bir canlı destek/chat ikonu da var (iki farklı chat girişi: AI asistan + insan destek).
- **Promosyon/kampanya kartları:** Güncel fiyatlı rota kartları (ör. "Paris to Amsterdam from €35").
- **İlham/keşif bölümü ("Ideas for your next trip"):** Şehir tanıtım kartları (Bruges, Disneyland, İsviçre bağlantıları, Bordeaux, Lille, Rotterdam) — SEO ve çapraz satış amaçlı içerik pazarlaması.
- **İnteraktif rota haritası:** "100+ destinasyon" vurgusu ile tıklanabilir harita sayfasına link.
- **Tren durumu/saatler:** Ayrı, göze çarpan "Train status & timetables" kısayolu.
- **Hızlı erişim linkleri:** Manage your booking, Travel information, Check train status.
- **Sadakat/kurumsal tanıtım blokları:** Club Eurostar (sadakat), Eurostar for Business, Accessible travel, Sign up for offers (bülten), Train + Hotel paketleri — her biri kendi mini-CTA'sı ile.
- **Sürdürülebilirlik mesajı:** "%100 yenilenebilir enerji 2030 hedefi" gibi marka değeri vurguları.
- **Sepet/basket ikonu kalıcılığı:** Sayfalar arası gezinirken sepette bırakılan bilet sayısı (badge) korunuyor — yarım kalan rezervasyonu hatırlatma.

## 2. Bilet Arama

- **Akıllı otomatik tamamlama:** İstasyon adı yazarken anlık öneriler (şehir + istasyon adı + ülke), "Disneyland Paris" gibi özel destinasyonlar da istasyon gibi aranabiliyor.
- **Kalkış/varış swap butonu:** Tek tıkla güzergâhı ters çevirme.
- **Tarih seçici:** Tekil veya gidiş-dönüş ("Add return") seçimi.
- **Yolcu seçici (detaylı yaş kategorileri):** Adult (26-59), Youth (12-25), Child (0-11), Senior (60+), Infant (0-3, kucakta ücretsiz) — her biri ayrı sayaç. Ayrıca **tekerlekli sandalye kullanıcısı** toggle'ı (erişilebilirlik, arama sonucunu buna göre filtreliyor).
- **Alternatif giriş noktaları:** "Explore all trains", "Find lowest fares" (en ucuz günü bulma), "Groups 16+" (grup rezervasyonu için ayrı akış).

## 3. Arama Sonuçları ve Fiyatlandırma

- **Tarih şeridi (date carousel):** Seçili tarihin ±birkaç günü için o günün en düşük fiyatı küçük kartlarda önceden gösteriliyor — kullanıcı takvime girmeden ucuz günü görebiliyor.
- **Sefer/saat listesi:** Her sefer için kalkış-varış saati, toplam süre, aktarmasız/aktarmalı bilgisi ("Direct").
- **Üç sınıf yan yana karşılaştırma:** Eurostar Standard / Eurostar Plus / Eurostar Premier — aynı satırda fiyat karşılaştırması, dolu olan sınıflar "Not available" olarak devre dışı gösteriliyor.
- **Kalan koltuk uyarısı ve "en ucuz fiyat" rozeti:** "25 seats left", "Lowest fare" gibi aciliyet/güven rozetleri.
- **Fare (bilet kuralı) detay paneli:** Seçilen bilet için değişiklik/iade koşulları, bagaj hakkı, wifi, priz gibi maddeler otomatik açılıyor.
- **Canlı özet paneli (sağ sidebar):** Seçim yaptıkça güncellenen "Trip summary" — toplam tutar, seçilen sefer detayları; "Continue" butonu seçim tamamlanana kadar pasif.

## 4. Ekstra Hizmetler (Upsell) Adımı

- **Ayrı bir "Travel extras" adımı:** Bilet seçiminden sonra, ödemeden önce upsell ekranı (ör. Standard'dan Plus'a yükseltme, ek ücret gösterimi ve "Add to trip" ile sepete ekleme).
- **Adım göstergesi (breadcrumb):** Outbound → Extras → Checkout şeklinde ilerleme çubuğu, kullanıcı her an nerede olduğunu görüyor.

## 5. Ödeme (Checkout) Akışı

- **Rezervasyon zaman kilidi:** "Your ticket is reserved until 17:33" — koltuğun belirli bir süre için tutulduğunu gösteren geri sayım/uyarı, aciliyet hissi yaratıyor.
- **Giriş seçenekleri ekranı:** Kullanıcıya üç seçenek: e-posta/şifre ile giriş, "Checkout as a guest" (misafir ödeme) veya "ödemeden sonra hesap oluşturabilirsin" bilgisi — kayıt zorunluluğu satın almayı engellemiyor.
- **Yolcu bilgileri formu:** Ad, soyad, e-posta, telefon (ülke koduyla), opsiyonel "Club Eurostar number" alanı (mevcut sadakat üyeleri için).
- **İletişim bilgileri (ayrı bölüm):** Sadece seyahatle ilgili bildirimler için kullanılacağı belirtiliyor (gizlilik güveni).
- **Seyahat amacı seçimi:** Business / Holiday / Visiting family or friends — muhtemelen segmentasyon ve pazarlama verisi için.
- **İndirim kodu / kupon alanı:** Kod ve birden fazla voucher birlikte kullanılabiliyor.
- **Çoklu ödeme yöntemi:** Apple Pay, Kredi/Banka kartı, PayPal.
- **Fatura adresi formu:** Adres, şehir, posta kodu, ülke.
- **Pazarlama izni ve sözleşme onayı ayrı checkbox'lar:** Kişiselleştirilmiş iletişim izni (opt-in, varsayılan kapalı) ve zorunlu Şartlar & Koşullar / Fare Conditions onayı ayrı ayrı sunuluyor (KVKK/GDPR uyumlu tasarım).
- **Sipariş özeti her adımda sabit:** Sağda sürekli güncel tutar ve yolculuk detayı.

## 6. Hesap / Rezervasyon Yönetimi

- **Giriş yapmadan rezervasyon sorgulama:** Sadece "Booking reference" (PNR) + yolcu soyadı ile "View booking" — hesap açmadan bilete erişim.
- **Hesaplı kullanıcılar için:** "Log in to view all your bookings" ile tüm geçmiş/gelecek rezervasyonları tek yerden görme.
- **Kendi kendine hizmet (self-service) linkleri:** Exchanges, e-vouchers and refunds — değişiklik/iade işlemlerini kullanıcı kendi başına yapabiliyor.
- **Giriş/Kayıt modalı:** Login formu ile yan yana "Register now" teşviki — kayıt olmanın somut faydası (puan kazanma, özel avantajlar) vurgulanıyor.

## 7. Sadakat Programı — Club Eurostar

- **Ücretsiz üyelik, puan bazlı sistem:** Harcanan her €1 için 1 puan.
- **Çok katmanlı seviye sistemi (tier):** Classique (ücretsiz) → Avantage (500 puan, +%25 bonus) → Carte Blanche (2900 puan, +%50) → Étoile (5000 puan, +%75).
- **Puan kullanım seçenekleri:** Ücretsiz bilet (1000 puan+), bilet indirimi (170 puan+), koltuk yükseltme (600 puan+), partner programına puan transferi (Accor/ALL), puanları arkadaşla paylaşma, Train+Hotel paketinde kullanma.
- **Seviyeye özel ayrıcalıklar:** Ücretsiz yükseltme kuponu, erken/geç trene binebilme esnekliği, özel lounge erişimi (Premier Lounge, Railteam), hızlı geçiş turnikeleri, öncelikli çağrı merkezi, özel etkinlik davetleri.
- **Partner ortaklıkları:** Hertz (araç kiralama), Accor/ALL (otel sadakat programı) ile puan entegrasyonu.
- **Durum takibi:** Hem "reward points" (harcanabilir) hem "status points" (seviye ilerlemesi) ayrı ayrı takip ediliyor.

## 8. Mobil Uygulamaya Özel Tanıtılan Özellikler (Eurostar App sayfası)

Şirketin kendi app'i için öne çıkardığı 5 temel fayda — bizim case study için doğrudan bir "must-have" listesi niteliğinde:

1. **Canlı seyahat bilgisi:** Tren durumu hakkında gerçek zamanlı push bildirimleri.
2. **En iyi fiyattan bilet alma:** Hızlı/basit rezervasyon, tercih edilen ödeme yöntemleriyle.
3. **Tüm rezervasyonları tek ekranda görme ve yönetme:** Tek dokunuşla tren/seyahat değişikliği.
4. **Mobil bilete hızlı erişim:** Biletler uygulama içinde veya Apple Wallet'ta saklanabiliyor (kağıtsız/offline erişim).
5. **Kişiye özel Club Eurostar avantajları:** Anlık özel teklif bildirimleri, puanları uygulama üzerinden harcama.
6. Çoklu dil desteği (EN/FR/NL/DE).

## 9. Diğer Ürün Modülleri

- **Train + Hotel paketleri:** Tren + otel birleşik rezervasyon, ayrı puan kazanım oranı.
- **Hotels:** Bağımsız otel arama sekmesi.
- **Eurostar Snap:** Esnek/belirsiz saatli yolculara özel indirimli "last-minute" bilet ürünü — farklı bir fiyatlandırma/ürün modeli.
- **Erişilebilir seyahat:** Tekerlekli sandalye kullanıcıları için özel destek sayfası ve arama filtresi.
- **Business hesabı:** Kurumsal kullanıcılar için ayrı avantaj programı.
- **Bülten kaydı:** E-posta ile kampanya/duyuru aboneliği, ayrı CTA.

---

## Mobil Uygulama Case Study İçin Öneriler

Eurostar'ın akışını bir mobil uygulamaya uyarlarken öne çıkan tasarım prensipleri şöyle özetlenebilir: arama formu az adımda, çok seçenekli (istasyon otomatik tamamlama + yolcu tipi + erişilebilirlik); fiyat/tarih karşılaştırmasını kullanıcıya arama sonucuna girmeden önce göstermek (tarih şeridi); satın alma öncesi net bir sepet/özet paneli ile her adımda toplam tutarı görünür tutmak; misafir olarak ödemeye izin verip hesabı satın alma sonrasına ertelemek; sadakat programını uygulama içinde puan bakiyesi + kolay harcama seçenekleriyle öne çıkarmak; ve bilet erişimini offline/cüzdan entegrasyonlu hale getirmek.

Bir mobil case study MVP'si için önceliklendirme önerisi: (1) arama + sonuç listesi + fiyat karşılaştırma, (2) sepet/checkout akışı (misafir + üye), (3) "My bookings" / PNR sorgulama, (4) push bildirimli canlı tren durumu, (5) basit bir sadakat/puan modülü. AI sohbet asistanı ve Club Eurostar'ın çok katmanlı seviye sistemi gibi özellikler ise "nice-to-have" / ileri faz olarak planlanabilir.
