# Güvenlik ve eklentiler — yapılacaklar

Hepsi ücretsiz. Önerilen sıra yukarıdan aşağıya; her adım diğerlerinden
bağımsız, istediğin yerde ara verebilirsin.

- [x] 1. Hesaplarda 2FA
- [x] 2. DNSSEC
- [x] 3. Güvenlik başlıkları (`public/_headers`)
- [ ] 4. HSTS
- [ ] 5. Email Routing (`hi@bbelbuken.com`)
- [ ] 6. Sahte mail koruması (SPF + DMARC)
- [ ] 7. Web Analytics
- [ ] 8. Paylaşım görseli (`og:image`)
- [ ] 9. www → kök domain yönlendirmesi
- [ ] 10. `robots.txt` ve `sitemap.xml`

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

## 5. Email Routing (`hi@bbelbuken.com`)

`hi@bbelbuken.com`'a gelen mailler Gmail'ine düşer. Kutu açmana, ücret
ödemene gerek yok.

### 5a. Gelen mail
1. zone → **Email** → **Email Routing** → **Get started** (ya da **Enable**).
2. **Custom address:** `hi` (istersen `contact`, `batuhan` vb.)
3. **Action:** Send to an email → **Destination:** `bbelbuken@gmail.com`
4. Gmail'ine Cloudflare'den bir doğrulama maili gelir → içindeki linke tıkla.
5. Cloudflare "gerekli DNS kayıtlarını ekleyelim mi" diye sorar →
   **Add records and enable**. (MX ve SPF kayıtları otomatik eklenir.)

✅ Test: Başka bir adresten `hi@bbelbuken.com`'a mail at; Gmail'e düşmeli.
(İlk mail spam klasörüne düşebilir; "Spam değil" de.)

### 5b. Bu adresten cevap vermek (isteğe bağlı)
Cloudflare mail göndermez; göndermeyi Gmail yapar.

1. Google hesabında 2 adımlı doğrulama açık olmalı (1. adımın Google
   versiyonu): <https://myaccount.google.com/security>.
2. <https://myaccount.google.com/apppasswords> → ad olarak
   `bbelbuken mail` yaz → **Create** → çıkan **16 haneli şifreyi** kopyala.
3. Gmail → ⚙️ **Tüm ayarları gör** → **Hesaplar ve İçe Aktarma** →
   **Postayı farklı adresten gönder** → **Başka bir e-posta adresi ekle**.
4. Ad: `Batuhan Belbüken`, adres: `hi@bbelbuken.com`,
   "Takma ad olarak kabul et" işaretli kalsın → **Sonraki adım**.
5. SMTP ayarları:
   - SMTP sunucusu: `smtp.gmail.com`
   - Bağlantı noktası: `587`
   - Kullanıcı adı: `bbelbuken@gmail.com`
   - Şifre: 2. adımdaki 16 haneli uygulama şifresi
   - **TLS kullanarak güvenli bağlantı** seçili
6. **Hesap ekle** → `hi@bbelbuken.com`'a doğrulama kodu gelir (Email Routing
   sayesinde Gmail'ine düşer) → kodu gir.
7. Artık Gmail'de yeni mail yazarken **Kimden** kısmında `hi@bbelbuken.com`
   seçebilirsin.

### 5c. Sitede göster
`src/components/desktop/ContactTerminal.tsx` içinde en üstteki satırı değiştir:

```ts
const EMAIL = 'hi@bbelbuken.com';
```

Commit + push.

---

## 6. Sahte mail koruması (SPF + DMARC)

Başkasının `@bbelbuken.com` adına sahte mail göndermesini zorlaştırır.
**5. adımdan sonra** yap; 5. adım SPF'nin bir kısmını zaten ekliyor.

1. zone → **DNS** → **Records**.
2. **SPF:** Türü `TXT`, adı `bbelbuken.com` (ya da `@`), değeri
   `v=spf1 include:_spf.mx.cloudflare.net ...` ile başlayan kaydı bul →
   **Edit**:
   - 5b'yi yaptıysan (Gmail'den gönderiyorsan):
     ```
     v=spf1 include:_spf.mx.cloudflare.net include:_spf.google.com ~all
     ```
   - Bu adresten hiç mail göndermeyeceksen olduğu gibi bırak.
3. **DMARC:** **Add record**:
   - Type: `TXT`
   - Name: `_dmarc`
   - Content:
     ```
     v=DMARC1; p=none; rua=mailto:bbelbuken@gmail.com
     ```
   - **Save**.

`p=none` şimdilik sadece "izle ve raporla" der; Gmail'den gönderdiğin
cevapların yanlışlıkla reddedilmesini önler. Gmail'in "farklı adresten
gönder" özelliği maili `gmail.com` imzasıyla yolladığı için daha sıkı
(`p=quarantine`/`p=reject`) bir ayar senin cevaplarını spama düşürebilir.

- Hiç göndermeyeceksen daha güçlü korumayı seçebilirsin:
  `v=DMARC1; p=reject; rua=mailto:bbelbuken@gmail.com`

Alternatif: zone → **Email** → **DMARC Management** sayfası bu kaydı adım
adım kurdurur ve gelen raporları özetler.

✅ Bitti mi: <https://mxtoolbox.com/SuperTool.aspx> → `bbelbuken.com` için
**SPF Record Lookup** ve **DMARC Lookup** yeşil.

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

## Kod değişikliklerini tek seferde yapmak için

3, 5c, 8 ve 10 adımları dosya değişikliği. Hepsini yapıp tek commit atabilirsin:

```bash
git add public/_headers public/robots.txt public/sitemap.xml public/og-image.png index.html src/components/desktop/ContactTerminal.tsx
git commit -m "added-security-headers-and-seo"
git push origin main
```

Push sonrası Pages birkaç dakikada yeni sürümü yayınlar.
