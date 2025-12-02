<!-- 1fc1783c-65d1-40b1-b727-88c902006284 cab29556-80c7-47e4-afb7-22276e80b6d8 -->
# Cevap Anahtarı Görsel Sayaç Bileşeni

## Genel Bakış

Yeni test eklerken cevap anahtarı girişi için görsel geri bildirim sağlayan bir bileşen oluşturulacak. Bileşen, soru sayısına göre her soru için görsel göstergeler ve genel ilerleme çubuğu gösterecek.

## Yapılacaklar

### 1. Yeni Bileşen Oluşturma

- **Dosya**: `frontend/src/app/shared/components/answer-key-counter/answer-key-counter.component.ts`
- Standalone Angular bileşeni olarak oluşturulacak
- Input'lar:
  - `questionCount: number` - Toplam soru sayısı
  - `answerKey: string` - Cevap anahtarı metni
- Her soru için küçük kutu göstergeleri (dolu/boş durumuna göre renk değişimi)
- Genel ilerleme çubuğu ve sayaç (örn: "5/16 cevaplandı")
- Her kutunun içinde soru numarası ve cevap harfi gösterimi

### 2. Form Bileşenine Entegrasyon

- **Dosya**: `frontend/src/app/features/admin/components/practice-tests/practice-test-form.component.ts`
- Yeni bileşeni import edip template'e ekleme
- Cevap anahtarı textarea'sının altına yerleştirme
- `question_count` ve `answer_key` form kontrollerini bileşene bağlama
- Form değişikliklerini dinleyerek gerçek zamanlı güncelleme

### 3. Görsel Tasarım Özellikleri

- Her soru için küçük kutu göstergeleri (grid layout)
- Dolu sorular: Yeşil arka plan + cevap harfi
- Boş sorular: Gri arka plan + soru numarası
- İlerleme çubuğu: Primary renk tonları
- Responsive tasarım (mobil uyumlu)
- Smooth animasyonlar (transition effects)

### 4. Mantık ve Hesaplamalar

- Cevap anahtarı metnini parse ederek her soru için durum belirleme
- Geçerli cevapları sayma (A, B, C, D, E harfleri)
- Boş soruları tespit etme (eksik veya _ karakteri)
- İlerleme yüzdesi hesaplama

## Teknik Detaylar

### Bileşen Yapısı

```typescript
@Component({
  selector: 'app-answer-key-counter',
  standalone: true,
  imports: [CommonModule],
  // Template ve styles
})
export class AnswerKeyCounterComponent {
  @Input() questionCount: number = 0;
  @Input() answerKey: string = '';
  
  // Computed properties for progress calculation
  // Methods for parsing answer key
}
```

### Form Entegrasyonu

- `form.get('question_count')?.value` ve `form.get('answer_key')?.value` değerlerini bileşene aktarma
- `valueChanges` observable'ını dinleyerek otomatik güncelleme

## Dosya Değişiklikleri

1. **Yeni Dosya**: `frontend/src/app/shared/components/answer-key-counter/answer-key-counter.component.ts`
2. **Güncellenecek**: `frontend/src/app/features/admin/components/practice-tests/practice-test-form.component.ts`

### To-dos

- [ ] Answer key counter bileşenini oluştur (görsel göstergeler + ilerleme çubuğu)
- [ ] Bileşeni practice-test-form'a entegre et ve form değerlerini bağla
- [ ] Cevap anahtarı parse etme ve ilerleme hesaplama mantığını ekle
- [ ] Responsive tasarım ve animasyonlar ekle