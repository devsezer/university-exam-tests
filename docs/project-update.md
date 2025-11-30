# Proje Yönetimi Planı

**Proje Adı:** Üniversite Sınavına Hazırlık Deneme Testi Platformu

## 1. Proje Özeti

Bu proje, öğrencilerin üniversite sınavına hazırlanırken çözmüş olduğu deneme testlerinin suçlarını sisteme girip, sistemin test sonucunu hesaplayarak kaydedilmesini ve böylece öğrencinin başarı durumunu ve gelişimini takip etmesini sağlamak amacı ile oluşturulacaktır. Kullanıcılar sınav türüne ve ders konusuna göre sınıflandırılmış test kitapları içinden yer alan deneme testini seçerek bu testin cevaplarını sisteme girebilecek ve sistem doğru cevaplarla karşılaştırarak test sonucunu anında bildirecektir. Ayrıca, kullanıcılar aynı testi farklı zamanlarda tekrar çözebilecek ve geçmiş sonuçlarını görüntüleyebilecektir. Proje, modern web teknolojileri olan Angular (frontend), Rust (backend - Axum), PostgreSQL (veritabanı) ve sqlx (Rust veritabanı kütüphanesi) kullanılarak geliştirilecektir.

## 2. Proje Amaçları

* Üniversite sınavına hazırlanan öğrencilerin deneme sınavı çözme ve sonuçlarını takip etme süreçlerini kolaylaştırmak.
* Öğrencilere, çözdükleri deneme testlerinin sonuçlarını detaylı bir şekilde görme ve performanslarını analiz etme imkanı sunmak.
* Öğrencilerin aynı deneme testini tekrar çözerek gelişimlerini takip etmelerine olanak sağlamak.
* Kullanıcı dostu ve modern bir web arayüzü sunmak.
* Yüksek performanslı ve güvenilir bir platform oluşturmak.

## 3. Proje Kapsamı

Bu projenin kapsamı aşağıdaki ana özellikleri içermektedir:

* **Kullanıcı Yönetimi:**
    * Kullanıcı kaydı ve girişi.
    * Kullanıcı profil yönetimi (ileride eklenebilir).
* **Test ve Kitap Yönetimi:**
    * Sınav türlerinin (TYT, AYT vb.) ve ders konularının (Matematik, Türkçe vb.) tanımlanması.
    * Sınav türü ve ders konusuna göre sınıflandırılmış test kitaplarının (ad, sınav türü, ders konusu) sisteme eklenmesi.
    * Test kitaplarına ait deneme testlerinin (ad, test numarası, soru sayısı, doğru cevaplar) sisteme eklenmesi.
* **Test Çözme:**
    * Kullanıcıların sınav türüne, ders konusuna ve test kitabına göre deneme testi seçebilmesi.
    * Seçilen deneme testine ait soruların (soru metinleri frontend'de statik olarak veya ayrı bir kaynaktan yönetilebilir) kullanıcıya sunulması.
    * Kullanıcıların seçilen deneme testindeki her soru için yer alan soru numarasına göre cevaplarını işaretleyebilmesi.
    * Testi bitirme ve cevapları gönderme işlevi.
* **Sonuç Yönetimi:**
    * Gönderilen cevapların doğru cevaplarla karşılaştırılması.
    * Doğru, yanlış ve boş cevap sayılarının hesaplanması.
    * Test sonucunun (puan) hesaplanması.
    * Test sonuçlarının kullanıcıya anında gösterilmesi.
* **Geçmiş Sonuçlar:**
    * Kullanıcıların daha önce çözdükleri testlerin sonuçlarını listeleyebilmesi.
    * Her bir geçmiş sonuca ait detayları görüntüleyebilmesi.
* **Tekrar Çözme:**
    * Kullanıcıların daha önce çözdükleri bir testi tekrar seçip çözebilmesi.
    * Tekrar çözülen testlerin sonuçlarının ayrı kayıtlar olarak saklanması.
    * Kullanıcının çözdüğü testi tekrar çözebilmesi için aradan en az 24 saat geçmesi gerekmesi.

**Proje Kapsamı Dışı:**

* Detaylı performans analizleri ve raporlama (ileride eklenebilir).

