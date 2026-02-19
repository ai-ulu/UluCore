# 🗺 UluCore Enterprise Roadmap

Bu yol haritası, UluCore'un MVP aşamasından **Enterprise-Grade** seviyesine geçişi için kritik öncelikleri belirler. Odak noktamız daha fazla özellik değil, **daha fazla güvenlik ve garanti** sağlamaktır.

---

## 🏗 Faz 1: Safety Core (Kritik Garantiler)
**Hedef:** "UluCore güvenilir bir karar motorudur" sözünü teknik olarak kanıtlamak.
**Tahmini Süre:** 2-3 Hafta

- [ ] **Idempotency Key (X-Idempotency-Key):** Aynı isteğin iki kez işlenmesini engelleme.
- [ ] **DB Transaction Sınırları:** Karar verme ve olay günlüğüne kaydetme işlemlerinin atomik olması.
- [ ] **Policy Versioning (Immutable):** Politikaların değiştirilemez olması ve her kararın belirli bir versiyona bağlanması.
- [ ] **Async AI / Non-Blocking:** AI danışmanlığının karar yolunu tıkamaması (Fire-and-forget veya async task).

---

## 🚀 Faz 2: Scale Without Identity Loss (Ölçeklenebilirlik)
**Hedef:** "1000 müşteri aynı anda kullanabilir" garantisi vermek.
**Tahmini Süre:** 2-3 Hafta

- [ ] **SQL Aggregation:** Metrik hesaplamalarının veritabanı seviyesinde yapılması.
- [ ] **Cursor Pagination:** Büyük veri setlerinde performanslı listeleme.
- [ ] **Read Models (CQRS-Lite):** Okuma ve yazma yüklerini optimize etme.

---

## 💎 Faz 3: Enterprise Polish (Satış & Uyum)
**Hedef:** Kurumsal satış süreçlerini (SOC2, ISO, GDPR) kolaylaştırmak.
**Tahmini Süre:** Satış geldikçe

- [ ] **Refresh Token:** Güvenli oturum yönetimi.
- [ ] **Webhook Idempotency:** Ödeme ve entegrasyon akışlarında tutarlılık.
- [ ] **PII Masking:** Kişisel verilerin loglarda korunması.
- [ ] **Correlation ID:** Dağıtık sistemlerde izlenebilirlik.

---

## 🔑 Enterprise Prensiplerimiz
1. **Tutarlılık:** Aynı girdi her zaman aynı sonucu (ve tek bir kaydı) üretir.
2. **Bozulmazlık:** Audit log (denetim günlüğü) sistemin en kutsal parçasıdır.
3. **Fail-Safe:** Dış servisler (AI vb.) kopsa bile temel karar mekanizması çalışmaya devam eder.
