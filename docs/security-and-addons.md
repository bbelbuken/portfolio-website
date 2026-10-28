# Güvenlik ve eklentiler — yapılacaklar

Hepsi ücretsiz. Önerilen sıra yukarıdan aşağıya; her adım diğerlerinden
bağımsız, istediğin yerde ara verebilirsin.

- [x] 1. Hesaplarda 2FA
- [x] 2. DNSSEC
- [x] 3. Güvenlik başlıkları (`public/_headers`)
- [x] 4. HSTS
- [x] 5. Email Routing'i geri almak (domain'de mail kullanılmıyor)
- [x] 6. Sahte mail koruması (domain mail göndermiyor)
- [x] 7. Web Analytics
- [x] 8. Paylaşım görseli (`og:image`)
- [x] 9. www → kök domain yönlendirmesi
- [x] 10. `robots.txt` ve `sitemap.xml`
- [ ] 11. "Batuhan Belbüken" aramasında Google'da üstte çıkmak (11c kod tarafı yapıldı; 11a ve 11b sende)

> **Panel yolları:** "zone" dediğim yer, Cloudflare ana sayfasında
> **bbelbuken.com**'a tıklayınca açılan domain paneli. Menü adları Cloudflare
> arayüz güncellemeleriyle biraz değişebiliyor; bulamazsan panelin üstündeki
> arama kutusuna adını yaz.

---

## 1. Hesaplarda 2FA (en önemlisi)

Domain, R2 ve site Cloudflare'de; kod GitHub'da. Bu iki hesap ele geçirilirse
her şey gider. Şifreye ek olarak telefondaki bir kodu da isteyelim.

**Önce:** Telefona bir authenticator uygulaması kur — Google Authenticator,
Microsoft Authenticator, Authy ya da 1Password.

**Cloudflare**
1. Sağ üstteki profil ikonu → **My Profile** → **Authentication**.
2. **Two-Factor Authentication** → **Enable** / **Set up**.
3. Ekrandaki QR kodu authenticator uygulamasıyla okut, uygulamanın verdiği
   6 haneli kodu gir.
4. Verdiği **backup kodlarını** indir ve güvenli bir yerde sakla (şifre
   yöneticisi ya da kâğıt). Telefonu kaybedersen hesaba tek giriş yolu bunlar.

**GitHub**
1. Sağ üst profil → **Settings** → **Password and authentication**.
2. **Two-factor authentication** → **Enable two-factor authentication**.
3. **Authenticator app** seçeneğiyle QR kodu okut, kodu gir.
4. **Recovery codes**'u indir ve sakla.
5. İstersen aynı sayfadan bir **Passkey** de ekle (parmak izi / Windows Hello
   ile giriş).

✅ Bitti mi: Çıkış yapıp tekrar girince kod soruyorsa tamam.

---

## 2. DNSSEC

DNS cevaplarına imza ekler; biri ziyaretçileri sahte bir `bbelbuken.com`'a
yönlendiremez. Domain Cloudflare'de alındığı için tek tık.

1. zone → **DNS** → **Settings**.
2. **DNSSEC** → **Enable DNSSEC**.
3. Registrar da Cloudflare olduğu için gerekli DS kaydı otomatik eklenir;
   ayrıca bir şey yapma.

✅ Bitti mi: Birkaç saat içinde durum **Active** olur. (Saatlerce "Pending"
kalması normal.)

---

## 3. Güvenlik başlıkları (`public/_headers`)

Cloudflare Pages, projede `public/_headers` adında bir dosya görürse içindeki
başlıkları her sayfaya ekler. Bunlar tarayıcıya şunları söyler:

- Site başka bir sitenin içine gömülemez (clickjacking koruması).
- Sayfa sadece izin verilen yerlerden script, font, görsel, video ve iframe
  yükleyebilir; araya sokulmaya çalışılan yabancı script çalışmaz.
- Kamera, mikrofon, konum izni istenemez.

**Yapılacak:** Proje kökünde `public/_headers` dosyasını oluştur ve şunu
yapıştır:

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; script-src 'self' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https://media.bbelbuken.com https://i.ytimg.com; media-src https://media.bbelbuken.com; frame-src https://open.spotify.com https://www.youtube-nocookie.com; connect-src 'self' https://cloudflareinsights.com; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
```

`Content-Security-Policy` satırı tek satır olmalı; bölme.

Neye izin veriyor, neden:

| Kaynak | Neden |
|---|---|
| `fonts.googleapis.com`, `fonts.gstatic.com` | Fira Code fontu |
| `media.bbelbuken.com` | Video ve posterler |
| `i.ytimg.com`, `www.youtube-nocookie.com` | YouTube'da kalan videolar için |
| `open.spotify.com` | tracks.wav içindeki Spotify player |
| `static.cloudflareinsights.com`, `cloudflareinsights.com` | 7. adımdaki Web Analytics |

Commit + push → Pages yeniden yayınlar.

✅ Bitti mi:
1. Siteyi aç, tarayıcıda **F12 → Console**. Kırmızı
   `Refused to load ... Content Security Policy` hatası olmamalı.
2. tracks.wav'da bir albüm, ads.mp4'te bir video oynat; çalışmalı.
3. <https://securityheaders.com> adresine `https://bbelbuken.com` yaz →
   **A** ya da üstü not görmelisin.

Siteye ileride yeni bir dış kaynak eklersen (ör. AI chatbot'un API'si), onu da
bu satıra eklemek gerekecek; yoksa tarayıcı engeller.

---

## 4. HSTS

Tarayıcıya "bu siteye bundan sonra hep HTTPS ile gel" der. "Always Use HTTPS"
zaten açık; HSTS bunu tarayıcı seviyesinde kalıcı yapar.

1. zone → **SSL/TLS** → **Edge Certificates**.
2. **HTTP Strict Transport Security (HSTS)** → **Enable HSTS**.
3. Uyarıyı okuyup onayla, sonra şu ayarlar:
   - **Enable HSTS:** açık
   - **Max Age:** `6 months`
   - **Apply HSTS policy to subdomains (includeSubDomains):** açık
     (`media.` ve `www.` de HTTPS)
   - **Preload:** **kapalı bırak.** Tarayıcıların kalıcı listesine girer ve
     geri almak aylar sürer; bize gerekmiyor.
   - **No-Sniff Header:** açık
4. **Save**.

⚠️ HSTS açıkken siteyi HTTPS'siz yayınlamak 6 ay boyunca mümkün olmaz. Biz
hep Cloudflare üzerinden HTTPS kullanacağız, sorun değil.

✅ Bitti mi: <https://securityheaders.com> sonucunda
`Strict-Transport-Security` yeşil görünür.

---

## 5. Email Routing'i geri almak

Domain'de mail adresi kullanmamaya karar verdik; iletişim adresi
`bbelbuken@gmail.com` olarak kalıyor. Kurulumda yapılanları geri al:

**Cloudflare**
1. Sol menü → **Compute** → **Email Service** → **Email Routing** →
   `bbelbuken.com`.
2. **Routing rules**: `hi@bbelbuken.com` satırındaki **⋯ → Delete**.
3. Sağ üst **Destination addresses**: `bbelbuken@gmail.com` → **⋯ → Delete**.
4. **Settings** sekmesi → **Disable Email Routing**. Cloudflare eklediği DNS
   kayıtlarını silmeyi teklif ederse **onayla**.
5. zone → **DNS → Records**'ta şu kayıtlar kaldıysa tek tek sil:
   - 3 × **MX** (`route1/2/3.mx.cloudflare.net`)
   - **TXT** `cf2024-1._domainkey` (DKIM)
   - **TXT** `bbelbuken.com` → `v=spf1 include:_spf.mx.cloudflare.net ~all`
     (6. adımda yerine yenisini koyacağız)

**Gmail**
6. ⚙️ **Tüm ayarları gör** → **Hesaplar ve İçe Aktarma** → **Postayı farklı
   adresten gönder** → `hi@bbelbuken.com` satırında **sil**. Varsayılan
   gönderen `bbelbuken@gmail.com` kalmalı.
7. `hi@bbelbuken.com` için bir filtre/etiket oluşturduysan: **Filtreler ve
   Engellenen Adresler** → ilgili filtreyi **sil**.

**Google hesabı**
8. <https://myaccount.google.com/apppasswords> → `bbelbuken mail` uygulama
   şifresini **sil** (çöp kutusu ikonu). Kullanılmayan uygulama şifresi
   bırakmamak gerekiyor.

✅ Bitti mi: Email Routing sayfası "disabled" diyor, DNS'te MX kaydı yok,
Gmail'de sadece kendi adresin var.

---

## 6. Sahte mail koruması (domain mail göndermiyor)

Domain'de mail yok ama biri yine de `kimse@bbelbuken.com` adına sahte mail
göndermeye çalışabilir. Üç DNS kaydıyla "bu domain hiç mail göndermez,
gelirse reddet" diyoruz. zone → **DNS → Records → Add record**:

| Type | Name | İçerik | Ne yapar |
|---|---|---|---|
| `TXT` | `@` | `v=spf1 -all` | Hiçbir sunucu bu domain adına gönderemez |
| `TXT` | `_dmarc` | `v=DMARC1; p=reject;` | SPF'yi geçemeyen mail reddedilsin |
| `MX` | `@` | Mail server: `.` (tek nokta), Priority: `0` | "Null MX": bu domain mail **almaz** |

Null MX'i eklerken Cloudflare noktayı kabul etmezse bu kaydı atla; ilk iki
kayıt asıl korumayı sağlıyor.

İleride domain'de mail kullanmaya karar verirsen bu üç kaydı silip mail
servisinin istediği kayıtları eklemen yeterli.

✅ Bitti mi: <https://mxtoolbox.com/SuperTool.aspx> → `bbelbuken.com` için
**SPF Record Lookup** `-all`, **DMARC Lookup** `p=reject` gösteriyor.

---

## 7. Web Analytics

Cookie kullanmadığı için çerez banner'ı gerekmiyor. Kaç ziyaretçi, hangi
ülke, hangi cihaz, sayfa hızı gibi bilgileri gösterir.

1. **Workers & Pages** → portfolio projen → **Metrics** sekmesi.
2. **Web Analytics** → **Enable**.
3. Pages script'i siteye kendisi ekler; kod değişikliği gerekmez. (3. adımdaki
   `_headers` dosyası bu script'e zaten izin veriyor.)

✅ Bitti mi: Siteyi birkaç kez açtıktan sonra aynı sayfada veriler görünür
(gelmesi birkaç dakika sürebilir).

---

## 8. Paylaşım görseli (`og:image`)

Link LinkedIn, WhatsApp, X'te paylaşılınca görünen büyük kart görseli.

1. **1200 × 630 piksel** bir PNG hazırla. Öneri: sitenin bir ekran görüntüsü
   (about.md + branch'ler) ya da Canva'da adın + "software developer & sound
   engineer" yazan, sitenin renklerinde (açık mor zemin `#e8e0ec`, gül rengi
   vurgu `#e05a6a`, siyah kenarlık) sade bir kart. Yazılar büyük olsun;
   telefonda küçük görünüyor.
2. Dosyayı `public/og-image.png` olarak kaydet.
3. `index.html` içinde `<meta name="twitter:card" content="summary" />`
   satırını şu satırlarla değiştir:

   ```html
   <meta property="og:image" content="https://bbelbuken.com/og-image.png" />
   <meta property="og:image:width" content="1200" />
   <meta property="og:image:height" content="630" />
   <meta property="og:image:alt" content="Batuhan Belbüken — software developer and sound engineer" />
   <meta name="twitter:card" content="summary_large_image" />
   ```

4. Commit + push.

✅ Bitti mi:
- <https://www.linkedin.com/post-inspector/> → `https://bbelbuken.com` →
  görsel görünüyor mu.
- <https://www.opengraph.xyz> → farklı platformlardaki önizlemeler.

LinkedIn önizlemeyi önbellekte tutar; görseli değiştirirsen Post Inspector'da
tekrar "Inspect" de.

---

## 9. www → kök domain yönlendirmesi

`www.bbelbuken.com` yazan herkes `bbelbuken.com`'a gitsin; Google da sitenin
tek adresini görsün.

1. Önce **DNS → Records**'ta `www` için bir kayıt olduğundan ve bulutun
   **turuncu (Proxied)** olduğundan emin ol. Pages'e `www`'yu eklediysen
   kayıt zaten vardır.
   - Yoksa: **Add record** → Type `CNAME`, Name `www`, Target
     `bbelbuken.com`, **Proxied** açık → Save.
2. zone → **Rules** → **Redirect Rules** → **Create rule**.
   - Hazır şablon varsa **Redirect from WWW to root** seç; aşağıdakileri
     kendisi doldurur.
3. Elle doldurulacaksa:
   - **Rule name:** `www to root`
   - **Custom filter expression:** Field `Hostname`, Operator `equals`,
     Value `www.bbelbuken.com`
   - **Then → URL redirect:**
     - Type: **Dynamic**
     - Expression:
       ```
       concat("https://bbelbuken.com", http.request.uri.path)
       ```
     - Status code: **301**
     - **Preserve query string:** açık
4. **Deploy**.
5. Pages'te `www.bbelbuken.com`'u custom domain olarak eklediysen orada kalabilir;
   yönlendirme kuralı önce çalışır.

✅ Bitti mi: `http://www.bbelbuken.com/abc` açınca adres çubuğu
`https://bbelbuken.com/abc` olmalı.

---

## 10. `robots.txt` ve `sitemap.xml`

Arama motorlarına "siteyi tarayabilirsin, sayfalar bunlar" der.

1. `public/robots.txt` oluştur:

   ```
   User-agent: *
   Allow: /

   Sitemap: https://bbelbuken.com/sitemap.xml
   ```

2. `public/sitemap.xml` oluştur:

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>https://bbelbuken.com/</loc>
     </url>
   </urlset>
   ```

   (Site tek sayfa olduğu için tek adres yeterli.)

3. Commit + push.
4. İsteğe bağlı: <https://search.google.com/search-console> → **Add property**
   → **Domain** → `bbelbuken.com` → verdiği TXT kaydını Cloudflare DNS'e ekle
   → doğrula → **Sitemaps** bölümüne `sitemap.xml` yaz → **Submit**. Google'ın
   siteyi ne zaman indekslediğini ve hangi aramalarda göründüğünü buradan
   takip edersin.

✅ Bitti mi: `https://bbelbuken.com/robots.txt` ve
`https://bbelbuken.com/sitemap.xml` tarayıcıda açılıyor.

---

## 11. "Batuhan Belbüken" aramasında Google'da üstte çıkmak

Adın benzersiz olduğu için rekabet yok; Google'ın siteyi bulması ve
"Batuhan Belbüken'in resmi sitesi" olduğunu anlaması yeterli.

| Adım | Ne sağlar | Gerekli mi |
|---|---|---|
| 11a. Search Console | Google siteyi bulur ve indeksler | **Evet** |
| 11b. Profillerden link | Google siteyi LinkedIn/Instagram'daki sana bağlar; sıralamada en etkili adım | **Evet** |
| 11c. Kod değişiklikleri | Sayfada adın ve profillerin net işaretlenir | Faydalı |

**Ne zaman sonuç verir:** İndeksleme isteğinden sonra genelde birkaç gün ile
2 hafta içinde aramada çıkar; en üste yerleşmesi profil linkleriyle birkaç
hafta sürebilir.

### 11a. Google Search Console
**Önce 10. adımı yap** (sitemap gerekli).

1. <https://search.google.com/search-console> → Google hesabınla gir →
   **Add property**.
2. **Domain** seçeneğini seç (URL prefix değil) → `bbelbuken.com` →
   **Continue**.
3. Google bir TXT kaydı verir (`google-site-verification=...`):
   - Ekranda **"Verify with Cloudflare" / "Start verification"** gibi bir seçenek
     varsa ona bas; Cloudflare'e girip onay verince kaydı kendisi ekler.
   - Yoksa: Cloudflare → zone → **DNS → Records → Add record** → Type `TXT`,
     Name `@`, Content: Google'ın verdiği değer → **Save**. Search Console'a
     dönüp **Verify**. (Doğrulama bazen birkaç dakika sürer.)
4. Sol menü **URL Inspection** → üstteki kutuya `https://bbelbuken.com/` →
   Enter → **Request indexing**.
5. Sol menü **Sitemaps** → `sitemap.xml` yaz → **Submit**.

✅ Bitti mi: Birkaç gün sonra Google'da `site:bbelbuken.com` araması siteyi
gösteriyor. Search Console → **Performance** hangi aramalarda çıktığını
gösterir.

### 11b. Profillerinden siteye link ver
Google seni şu an LinkedIn ve Instagram üzerinden tanıyor; bu profiller
siteye link verirse siteyi de sana bağlar.

- **LinkedIn:** Profil → **Contact info** (kalem ikonu) → **Website** →
  URL `https://bbelbuken.com`, tür **Portfolio** → Kaydet. İstersen
  **Featured / Öne çıkanlar** bölümüne de link olarak ekle.
- **Instagram:** Profili düzenle → **Bağlantılar** → **Harici bağlantı ekle** →
  `https://bbelbuken.com`.
- **GitHub:** Profil → **Edit profile** → **Website** → `https://bbelbuken.com`.
  `portfolio-website` reposunun sağındaki ⚙️ **About** kısmına da aynı adresi
  yaz.
- **Spotify for Artists / SoundCloud:** Sanatçı profilinde web sitesi alanı
  varsa ekle.

### 11c. Kod değişiklikleri (yapıldı)

**1. Sekme ve arama sonucu başlığı** — `index.html`:

```html
<title>Batuhan Belbüken — Software Developer | AI &amp; Cloud</title>
```

ve aynı dosyada:

```html
<meta property="og:title" content="Batuhan Belbüken — Software Developer | AI &amp; Cloud" />
```

**2. Kimlik kartı (JSON-LD)** — `index.html`'de `</head>` satırının hemen
üstüne ekle. Sayfada görünmez; Google'a "bu site bu kişinin, şu profiller de
onun" der. `sameAs` listesine Instagram ve Spotify adreslerini kendin yaz;
olmayanı sil (son satırdan sonra virgül olmamalı).

```html
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Batuhan Belbüken",
    "alternateName": "Batuhan Belbuken",
    "url": "https://bbelbuken.com/",
    "jobTitle": "Software Developer",
    "description": "Software developer and former sound engineer based in Istanbul.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Istanbul",
      "addressCountry": "TR"
    },
    "alumniOf": {
      "@type": "CollegeOrUniversity",
      "name": "Bahçeşehir University"
    },
    "sameAs": [
      "https://www.linkedin.com/in/bbelbuken",
      "https://github.com/bbelbuken",
      "https://www.instagram.com/KULLANICI_ADIN/",
      "https://open.spotify.com/artist/SANATCI_ID"
    ]
  }
</script>
```

Bu bir veri bloğu, çalıştırılan bir script değil; 3. adımdaki güvenlik
başlıkları onu engellemez.

**3. Adını sayfanın ana başlığı yap** —
`src/components/nodes/AboutNode.tsx` içinde:

```tsx
<p>
    <span style={{ color: 'var(--accent)' }}>{'> '}</span>
    <strong>Batuhan Belbüken</strong>
</p>
```

bloğundaki `<p>` ve `</p>`'yi `<h1>` ve `</h1>` yap. Görünüş değişmez (Tailwind
başlıkların yazı boyutunu sıfırlıyor); Google adını sayfanın ana başlığı olarak
okur.

✅ Bitti mi: <https://search.google.com/test/rich-results> → `https://bbelbuken.com`
→ **Person** öğesi hatasız görünüyor.

---

## Kod değişikliklerini tek seferde yapmak için

3, 8, 10 ve 11c adımları dosya değişikliği. Hepsini yapıp tek commit
atabilirsin:

```bash
git add public/_headers public/robots.txt public/sitemap.xml public/og-image.png index.html src/components/nodes/AboutNode.tsx
git commit -m "added-security-headers-and-seo"
git push origin main
```

Push sonrası Pages birkaç dakikada yeni sürümü yayınlar.
