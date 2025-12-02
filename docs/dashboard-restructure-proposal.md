# Dashboard Yeniden Yapılandırma Önerileri

Bu doküman, kullanıcı ana sayfasının (dashboard) test kitabı tabanlı bir yapıya dönüştürülmesi için detaylı önerileri içermektedir.

## **Genel Bakış**

Kullanıcı ana sayfası, admin paneldeki yaklaşıma benzer şekilde test kitabı odaklı bir yapıya dönüştürülecektir. Kullanıcılar ana sayfada kitapları görüntüleyip filtreleyebilecek, kitap detay sayfasında testleri görebilecek ve çözebilecekler.

---

## **1. Ana Sayfa (Dashboard) Yapısı**

### **1.1 Üst Bölüm - Hoş Geldiniz ve İstatistikler**

#### **Hoş Geldiniz Mesajı**
- Kullanıcı adı ile kişiselleştirilmiş hoş geldin mesajı
- Kısa açıklama metni: "Deneme testlerinizi çözün ve sonuçlarınızı takip edin"

#### **İstatistik Kartları (Opsiyonel)**
- **Toplam Çözülen Test Sayısı**: Tüm zamanlar boyunca çözülen test sayısı
- **Bu Ay Çözülen Test Sayısı**: Mevcut ay içinde çözülen test sayısı
- **Ortalama Net Puan**: Genel ortalama net puan
- **Son Aktiviteler**: Son çözülen testlerin kısa listesi

#### **Hızlı Erişim Butonları**
- "Sonuçlarım" butonu (mevcut `/results` sayfasına yönlendirme)
- "Favorilerim" butonu (gelecekte eklenecek)
- "Son Çözülenler" butonu (hızlı erişim için)

---

### **1.2 Filtreleme Bölümü**

#### **Filtre Kontrolleri**
- **Sınav Türü Dropdown**:
  - Varsayılan: "Tümü" seçeneği
  - Tüm sınav türlerini listele
  - Seçim yapıldığında ders dropdown'unu aktif et

- **Ders Dropdown**:
  - Başlangıçta disabled (sınav türü seçilmeden aktif olmamalı)
  - Seçilen sınav türüne göre dersleri filtrele
  - Varsayılan: "Tümü" seçeneği

- **Arama Kutusu**:
  - Kitap adında arama yapma
  - Real-time arama (yazarken filtreleme)
  - Arama ikonu ile görsel destek

#### **Filtre Yönetimi**
- **Filtreleri Temizle Butonu**: Tüm filtreleri sıfırla
- **Aktif Filtre Badge'leri**: 
  - Seçili filtreleri görsel olarak göster
  - Her badge'de X butonu ile kaldırma özelliği
  - Badge renkleri: Sınav türü (mavi), Ders (yeşil)

#### **Filtre Durumu Gösterimi**
- Aktif filtre sayısını göster
- "X sonuç bulundu" mesajı
- Filtre yoksa "Tüm kitaplar gösteriliyor" mesajı

---

### **1.3 Görünüm Seçici**

#### **Toggle Butonları**
- **Grid Görünümü**: Kart bazlı görünüm (varsayılan)
- **Liste Görünümü**: Tablo bazlı görünüm
- Admin paneldeki gibi toggle butonları kullan
- Aktif görünüm vurgulanmalı

#### **Tercih Kaydetme**
- Kullanıcı tercihi localStorage'a kaydedilmeli
- Sonraki ziyarette tercih hatırlanmalı
- Mobil cihazlarda varsayılan grid görünümü

---

### **1.4 Grid Görünümü**

#### **Layout Yapısı**
- **Responsive Grid**:
  - Mobil: 1 sütun
  - Tablet: 2 sütun
  - Desktop: 3-4 sütun
  - Büyük ekranlar: 4 sütun

#### **Kitap Kartı Tasarımı**
Her kart şu öğeleri içermelidir:

1. **Kapak Resmi Alanı**:
   - Yükseklik: ~200px (mobilde daha küçük)
   - Placeholder gradient arka plan
   - Kitap ikonu (SVG)
   - Hover efekti: hafif zoom veya overlay

2. **Kitap Bilgileri**:
   - **Kitap Adı**: 
     - Font: Semibold, 16-18px
     - Maksimum 2 satır, overflow ellipsis
     - Hover'da tam adı göster (tooltip)
   
   - **Badge'ler**:
     - Sınav türü badge (mavi)
     - Ders badge (yeşil)
     - Yayın yılı badge (gri)
     - Badge'ler wrap olabilmeli

3. **İstatistikler**:
   - **Toplam Test Sayısı**:
     - İkon: Kitap ikonu
     - Format: "X test"
     - Font: Medium, 14px
   
   - **Çözülen Test Sayısı**:
     - İkon: Checkmark ikonu
     - Format: "Y çözüldü"
     - Renk: Yeşil (çözülmüşse)
   
   - **İlerleme Göstergesi** (Opsiyonel):
     - Progress bar (0-100%)
     - Yüzde değeri gösterimi
     - Renk: Primary color

4. **Hover Efektleri**:
   - Shadow artışı (shadow-md → shadow-xl)
   - Border rengi değişimi (primary-300)
   - Hafif yukarı kaldırma (translateY)
   - Geçiş animasyonu: 0.3s ease

5. **Tıklanabilirlik**:
   - Tüm kart tıklanabilir olmalı
   - Cursor: pointer
   - Router link ile kitap detay sayfasına yönlendirme

#### **Boş Durum (Grid)**
- Merkezi konumlandırılmış mesaj
- İkon: Kitap ikonu (büyük, gri)
- Mesaj: "Henüz kitap bulunmuyor" veya "Bu kriterlere uygun kitap bulunamadı"
- Filtreleri temizle butonu

---

### **1.5 Liste Görünümü**

#### **Tablo Yapısı**
- Responsive tablo tasarımı
- Scroll desteği (overflow-x-auto)

#### **Tablo Kolonları**
1. **Kapak** (60px genişlik):
   - Küçük thumbnail görüntü
   - Placeholder ikon

2. **Kitap Adı**:
   - Font: Medium, 16px
   - Tıklanabilir (link)

3. **Sınav Türü**:
   - Badge formatında
   - Mavi renk

4. **Ders**:
   - Badge formatında
   - Yeşil renk

5. **Toplam Test Sayısı**:
   - Sayısal değer
   - İkon ile desteklenmiş

6. **Çözülen Test Sayısı**:
   - Sayısal değer
   - Progress bar veya yüzde
   - Yeşil renk (çözülmüşse)

7. **Yayın Yılı**:
   - Sayısal değer
   - Gri renk

8. **İşlemler** (Opsiyonel):
   - "Detay" butonu
   - Sağa hizalı

#### **Satır Özellikleri**
- Hover efekti: Arka plan rengi değişimi (gray-50)
- Tıklanabilir satır (tüm satır)
- Cursor: pointer
- Border-bottom ile ayrım

#### **Mobil Uyumluluk**
- Mobilde tablo kart görünümüne dönüşmeli
- Her satır bir kart olarak gösterilmeli
- Responsive breakpoint: < 768px

#### **Boş Durum (Liste)**
- Tablo içinde merkezi mesaj
- İkon + mesaj
- Filtreleri temizle butonu

---

### **1.6 Yükleme Durumları**

#### **Skeleton Loader**
- Grid görünümü için: Kart şeklinde skeleton
- Liste görünümü için: Satır şeklinde skeleton
- Pulse animasyonu
- 6-8 adet placeholder göster

#### **Loading Spinner**
- İlk yüklemede merkezi spinner
- "Kitaplar yükleniyor..." mesajı

---

## **2. Kitap Detay Sayfası**

### **2.1 Route Yapısı**
- Route: `/dashboard/books/:id` veya `/books/:id`
- Parametre: Kitap ID'si
- Breadcrumb: Ana Sayfa > Kitap Adı

### **2.2 Üst Bilgi Bölümü**

#### **Geri Dön Butonu**
- Sol üst köşede
- İkon: Sol ok (←)
- Text: "Geri Dön" veya sadece ikon
- Router ile ana sayfaya dönüş

#### **Kitap Kapağı**
- Sol tarafta büyük görüntü
- Genişlik: 200-250px
- Yükseklik: 300-350px
- Placeholder gradient + ikon
- Rounded corners
- Shadow efekti

#### **Kitap Bilgileri**
Sağ tarafta veya altında:

1. **Kitap Adı**:
   - Font: Bold, 28-32px
   - Renk: Gray-900

2. **Badge'ler**:
   - Sınav türü badge (mavi, büyük)
   - Ders badge (yeşil, büyük)
   - Yayın yılı badge (gri, büyük)
   - Konu badge'leri (mor, küçük)

3. **İstatistikler Kartları**:
   - **Toplam Test Sayısı**:
     - Büyük sayı + label
     - İkon ile desteklenmiş
   
   - **Çözülen Test Sayısı**:
     - Büyük sayı + label
     - Yeşil renk
   
   - **Genel İlerleme**:
     - Progress bar (geniş)
     - Yüzde değeri
     - Renk: Primary
   
   - **Ortalama Net Puan** (Opsiyonel):
     - Bu kitaptan çözülen testlerin ortalaması
     - Büyük sayı + label

---

### **2.3 Test Listesi Bölümü**

#### **Başlık ve Kontroller**
- Başlık: "Testler" (Bold, 20-24px)
- Görünüm toggle: Grid/List seçeneği (opsiyonel)
- Test sayısı: "X test bulundu"

#### **Konu Filtresi**
- Dropdown menü
- Label: "Konuya Göre Filtrele"
- Varsayılan: "Tüm Konular"
- Kitaptaki tüm konuları listele
- Filtreleme anında gerçekleşmeli

#### **Test Listesi - Grid Görünümü**

Her test kartı:

1. **Test Bilgileri**:
   - Test adı (Bold, 16px)
   - Test numarası (#X formatında)
   - Konu badge'i

2. **İstatistikler**:
   - Soru sayısı
   - Süre bilgisi (varsa)

3. **Durum Göstergesi**:
   - **Çözülmüş**:
     - Yeşil badge: "Çözüldü"
     - Sonuç linki: "Sonuçları Gör"
     - Son çözülme tarihi (küçük, gri)
   
   - **Çözülebilir**:
     - Primary renkli "Çöz" butonu
     - Hover efekti
   
   - **24 Saat Kuralı**:
     - Gri badge: "Beklemede"
     - Kalan süre bilgisi (örn: "15 saat sonra")
     - Disabled görünüm

4. **Kart Tasarımı**:
   - Beyaz arka plan
   - Border ve shadow
   - Hover efekti
   - Rounded corners

#### **Test Listesi - Liste Görünümü**

Tablo kolonları:

1. **Test Adı**: Bold, tıklanabilir
2. **Test Numarası**: #X formatı
3. **Konu**: Badge formatında
4. **Soru Sayısı**: Sayısal değer
5. **Durum**: Badge veya buton
6. **İşlemler**: "Çöz" butonu veya "Sonuçları Gör" linki

#### **Boş Durum**
- **Filtre sonucu yok**: "Bu konuda test bulunamadı"
- **Kitapta test yok**: "Bu kitapta henüz test bulunmuyor"
- İkon + mesaj + filtreleri temizle butonu

---

### **2.4 Test Çözme Entegrasyonu**

#### **Test Çözme Akışı**
- "Çöz" butonuna tıklandığında:
  - Mevcut `/tests/solve/:id` route'una yönlendirme
  - Veya modal içinde test çözme (gelecekte)

#### **Sonuç Görüntüleme**
- "Sonuçları Gör" linki:
  - `/results/:resultId` route'una yönlendirme
  - Mevcut result detail sayfasını kullan

---

## **3. Ek Özellikler**

### **3.1 Performans Optimizasyonu**

#### **Lazy Loading**
- Görünen kitaplar yüklenmeli
- Scroll edildikçe yeni kitaplar yüklenmeli
- Intersection Observer API kullanımı

#### **Skeleton Loader**
- İlk yüklemede skeleton göster
- Gerçek içerik yüklenene kadar placeholder
- Pulse animasyonu

#### **Infinite Scroll veya Sayfalama**
- Çok sayıda kitap varsa sayfalama
- Veya infinite scroll implementasyonu
- "Daha fazla yükle" butonu

---

### **3.2 Kullanıcı Deneyimi İyileştirmeleri**

#### **Favoriler (Gelecekte)**
- Kitapları favorilere ekleme
- Favori ikonu (kalp veya yıldız)
- Favoriler sayfası
- Filtreleme: "Sadece Favorilerim"

#### **Son Görüntülenenler**
- Son açılan kitapları kaydet
- localStorage'da sakla
- Ana sayfada "Son Görüntülenenler" bölümü

#### **Sıralama Seçenekleri**
- **Ada Göre**: A-Z / Z-A
- **Yıla Göre**: En yeni / En eski
- **Test Sayısına Göre**: En çok / En az
- **İlerlemeye Göre**: En çok çözülen / En az çözülen

Dropdown menü ile sıralama seçeneği

#### **Karşılaştırma (Gelecekte)**
- Birden fazla kitabı seçme
- Karşılaştırma sayfası
- Yan yana istatistikler

---

### **3.3 Görsel İyileştirmeler**

#### **Kapak Placeholder**
- Gradient arka plan
- Kitap ikonu (SVG)
- Renk: Primary color tonları
- Hover'da hafif animasyon

#### **İlerleme Göstergeleri**
- Progress bar'lar
- Yüzde değerleri
- Renk kodlaması:
  - 0-30%: Kırmızı
  - 31-70%: Sarı/Turuncu
  - 71-100%: Yeşil

#### **Renk Kodlaması**
- Derslere göre renk sistemi
- Tutarlı renk paleti
- Badge renkleri standardize edilmeli

#### **Animasyonlar**
- Kart hover animasyonları
- Sayfa geçiş animasyonları
- Loading animasyonları
- Micro-interactions

---

### **3.4 Mobil Optimizasyon**

#### **Responsive Tasarım**
- Mobilde grid varsayılan görünüm
- Filtreler accordion veya drawer içinde
- Touch-friendly buton boyutları (min 44x44px)

#### **Swipe Gestures**
- Swipe ile kitap kartları arasında gezinme
- Pull to refresh
- Swipe to delete (favoriler için)

#### **Mobil Navigasyon**
- Bottom navigation bar (opsiyonel)
- Hamburger menü entegrasyonu
- Mobil breadcrumb

---

## **4. API Entegrasyonu**

### **4.1 Backend Gereksinimleri**

#### **Kitap Listesi Endpoint'i**
Endpoint: `GET /api/test-books` veya benzeri

**Query Parametreleri**:
- `exam_type_id` (opsiyonel)
- `lesson_id` (opsiyonel)
- `search` (opsiyonel, kitap adında arama)
- `page` (opsiyonel, sayfalama)
- `limit` (opsiyonel, sayfa başına kayıt)

**Response Formatı**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Kitap Adı",
      "exam_type_id": "uuid",
      "lesson_id": "uuid",
      "published_year": 2024,
      "subject_ids": ["uuid1", "uuid2"],
      "total_test_count": 25,
      "solved_test_count": 10,
      "progress_percentage": 40.0
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

#### **Kitap Detay Endpoint'i**
Endpoint: `GET /api/test-books/:id`

**Response Formatı**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Kitap Adı",
    "exam_type_id": "uuid",
    "lesson_id": "uuid",
    "published_year": 2024,
    "subject_ids": ["uuid1", "uuid2"],
    "total_test_count": 25,
    "solved_test_count": 10,
    "progress_percentage": 40.0,
    "average_net_score": 35.5,
    "tests": [
      {
        "id": "uuid",
        "name": "Test Adı",
        "test_number": 1,
        "subject_id": "uuid",
        "question_count": 40,
        "status": "available" | "solved" | "waiting",
        "last_solved_at": "2024-01-15T10:30:00Z",
        "result_id": "uuid" // eğer çözülmüşse
      }
    ]
  }
}
```

#### **Test Durumu Hesaplama**
- `status`: "available" | "solved" | "waiting"
- `solved`: Kullanıcının bu testi çözmüş olması
- `waiting`: 24 saat kuralı (son çözülmeden 24 saat geçmemiş)
- `available`: Çözülebilir durumda

---

### **4.2 Frontend Service Gereksinimleri**

#### **TestService Güncellemeleri**
- `getTestBooks(examTypeId?, lessonId?, search?)`: Kitap listesi
- `getTestBook(id)`: Kitap detayı
- `getTestBookTests(id, subjectId?)`: Kitap testleri (filtrelenmiş)

#### **ResultsService Güncellemeleri**
- Kullanıcının çözülen testlerini getirme
- Test bazlı sonuç sorgulama
- İstatistik hesaplamaları

---

## **5. Route Yapısı**

### **5.1 Mevcut Route'lar**
- `/dashboard` → Ana sayfa (test kitapları listesi)
- `/tests` → Test seçme sayfası (mevcut, korunabilir veya kaldırılabilir)
- `/tests/solve/:id` → Test çözme sayfası (mevcut, korunmalı)
- `/results` → Sonuçlar listesi (mevcut, korunmalı)
- `/results/:id` → Sonuç detayı (mevcut, korunmalı)

### **5.2 Yeni Route'lar**
- `/dashboard/books/:id` → Kitap detay sayfası
- `/dashboard/books/:id/tests/:testId` → Test çözme (alternatif route, mevcut `/tests/solve/:id` ile entegre)

### **5.3 Route Yönlendirmeleri**
- Eski `/tests` route'u `/dashboard`'a yönlendirilebilir
- Veya `/tests` route'u korunup sadece yeni yapı eklenebilir

---

## **6. State Yönetimi**

### **6.1 URL Query Parametreleri**
Filtreler URL'de saklanmalı:
- `?exam_type_id=xxx`
- `?lesson_id=xxx`
- `?search=kitap adı`
- `?view=grid|list`
- `?sort=name|year|test_count`

**Avantajlar**:
- Paylaşılabilir linkler
- Sayfa yenilendiğinde filtreler korunur
- Browser geri/ileri butonları çalışır

### **6.2 LocalStorage**
- Görünüm tercihi: `dashboard_view_mode` → "grid" | "list"
- Son görüntülenen kitaplar: `recent_books` → Array<string>
- Favoriler (gelecekte): `favorite_books` → Array<string>

### **6.3 Signal/State Yönetimi**
- Angular Signals kullanımı
- Reactive state yönetimi
- Computed signals ile türetilmiş state'ler

---

## **7. Öncelik Sıralaması**

### **Yüksek Öncelik (İlk Aşama)**
1. ✅ Filtreleme sistemi (Sınav türü + Ders)
2. ✅ Grid/List görünümü toggle
3. ✅ Kitap kartları (grid görünümü)
4. ✅ Kitap detay sayfası
5. ✅ Test listesi ve konu filtresi
6. ✅ Çözülen test sayısı gösterimi
7. ✅ Test durumu göstergeleri (çözülebilir/çözülmüş/beklemede)

### **Orta Öncelik (İkinci Aşama)**
1. ⚠️ İlerleme göstergeleri (progress bar'lar)
2. ⚠️ Arama özelliği
3. ⚠️ Sıralama seçenekleri
4. ⚠️ Liste görünümü detaylandırma
5. ⚠️ Mobil optimizasyon iyileştirmeleri
6. ⚠️ Skeleton loader'lar
7. ⚠️ URL query parametreleri entegrasyonu

### **Düşük Öncelik (Gelecekte)**
1. 🔮 Favoriler özelliği
2. 🔮 Son görüntülenenler
3. 🔮 Karşılaştırma özelliği
4. 🔮 Gelişmiş istatistikler
5. 🔮 Infinite scroll
6. 🔮 Swipe gestures
7. 🔮 Dark mode entegrasyonu

---

## **8. Teknik Detaylar**

### **8.1 Component Yapısı**

#### **Yeni Component'ler**
- `DashboardComponent` → Ana sayfa (yeniden yapılandırılacak)
- `BookCardComponent` → Kitap kartı (reusable)
- `BookDetailComponent` → Kitap detay sayfası
- `TestCardComponent` → Test kartı (reusable)
- `BookFiltersComponent` → Filtreleme bileşeni (reusable)
- `ViewToggleComponent` → Görünüm toggle (reusable)

#### **Mevcut Component'ler**
- `LoadingSpinnerComponent` → Kullanılacak
- `ErrorMessageComponent` → Kullanılacak
- `TestSolverComponent` → Mevcut, korunacak
- `ResultDetailComponent` → Mevcut, korunacak

### **8.2 Service Yapısı**

#### **TestService Güncellemeleri**
```typescript
// Yeni metodlar
getTestBooks(filters?: BookFilters): Observable<ApiResponse<TestBook[]>>
getTestBook(id: string): Observable<ApiResponse<TestBookDetail>>
getTestBookTests(bookId: string, subjectId?: string): Observable<ApiResponse<PracticeTest[]>>
```

#### **Yeni Interface'ler**
```typescript
interface BookFilters {
  exam_type_id?: string;
  lesson_id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface TestBookDetail extends TestBook {
  total_test_count: number;
  solved_test_count: number;
  progress_percentage: number;
  average_net_score?: number;
  tests: PracticeTestWithStatus[];
}

interface PracticeTestWithStatus extends PracticeTest {
  status: 'available' | 'solved' | 'waiting';
  last_solved_at?: string;
  result_id?: string;
}
```

---

## **9. Tasarım Örnekleri**

### **9.1 Grid Kart Boyutları**
- Kart genişliği: ~280-320px (desktop)
- Kart yüksekliği: ~400-450px (içerik boyutuna göre)
- Gap: 24px (1.5rem)
- Padding: 16px (1rem)

### **9.2 Renk Paleti**
- Primary: Mevcut primary color (#8b5cf6)
- Success (çözülmüş): Green (#10b981)
- Warning (beklemede): Yellow/Orange (#f59e0b)
- Info (sınav türü): Blue (#3b82f6)
- Secondary (ders): Green (#10b981)

### **9.3 Typography**
- Başlık (H1): 32px, Bold
- Alt başlık (H2): 24px, Semibold
- Kart başlığı: 18px, Semibold
- Body text: 16px, Regular
- Küçük text: 14px, Regular
- Badge text: 12px, Medium

---

## **10. Test Senaryoları**

### **10.1 Kullanıcı Akışları**

#### **Akış 1: Kitap Bulma ve Test Çözme**
1. Kullanıcı ana sayfaya girer
2. Sınav türü seçer (örn: TYT)
3. Ders seçer (örn: Matematik)
4. Grid görünümünde kitapları görür
5. Bir kitaba tıklar
6. Kitap detay sayfasında testleri görür
7. Konu filtresi uygular (opsiyonel)
8. Bir teste "Çöz" butonuna tıklar
9. Test çözme sayfasına yönlendirilir

#### **Akış 2: Sonuçları Görüntüleme**
1. Kullanıcı kitap detay sayfasında
2. Çözülmüş bir test görür
3. "Sonuçları Gör" linkine tıklar
4. Sonuç detay sayfasına yönlendirilir

#### **Akış 3: Filtreleme ve Arama**
1. Kullanıcı ana sayfada
2. Arama kutusuna "matematik" yazar
3. Sonuçlar anında filtrelenir
4. Sınav türü filtresi ekler
5. Sonuçlar daha da daralır
6. Filtreleri temizler
7. Tüm kitaplar tekrar görünür

---

## **11. Notlar ve Öneriler**

### **11.1 Mevcut Yapı ile Uyumluluk**
- Mevcut `/tests` route'u korunabilir veya kaldırılabilir
- Test çözme sayfası (`/tests/solve/:id`) mutlaka korunmalı
- Sonuçlar sayfası (`/results`) korunmalı
- Yeni yapı mevcut yapıya ek olarak geliştirilebilir

### **11.2 Geriye Dönük Uyumluluk**
- Eski linkler çalışmaya devam etmeli
- Redirect'ler eklenebilir
- Kullanıcılar yeni yapıya yavaşça geçirilebilir

### **11.3 Performans**
- Büyük veri setleri için sayfalama veya infinite scroll
- API response'ları cache'lenebilir
- Lazy loading ile görüntü performansı artırılabilir

### **11.4 Erişilebilirlik**
- ARIA label'ları eklenmeli
- Klavye navigasyonu desteklenmeli
- Ekran okuyucu uyumluluğu sağlanmalı

---

## **12. Sonuç**

Bu yeniden yapılandırma ile kullanıcı ana sayfası daha kullanıcı dostu, organize ve modern bir yapıya kavuşacaktır. Admin paneldeki başarılı yaklaşım kullanıcı tarafına da uygulanarak tutarlı bir deneyim sağlanacaktır.

**Önemli Noktalar**:
- Kullanıcı odaklı tasarım
- Performans optimizasyonu
- Mobil uyumluluk
- Tutarlı UX/UI
- Ölçeklenebilir yapı

---

**Son Güncelleme:** 2024
**Hazırlayan:** AI Assistant
**Versiyon:** 1.0

