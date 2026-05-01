# AmanPay Mobile (Frontend)

Language: [English](#english) | [العربية](#العربية)

---

## English

Expo React Native app for AmanPay.

### Local setup

1. Install dependencies:
```bash
npm install
```

2. Prepare env file:
```bash
cp .env.example .env
```

`EXPO_PUBLIC_API_URL` is auto-managed before app start by `scripts/sync-api-env.mjs`.

3. Start backend first (`AmanPay-back`):
```bash
cd ../elmorad-api
docker compose up --build -d
npm run seed
```

4. Start frontend:
```bash
npm start
```

Or directly:
- `npm run android`
- `npm run ios`
- `npm run web`

### API auto-sync behavior

Before `start/android/ios`, the app:
- reads backend port from `../elmorad-api/.env` (`API_PORT`) or docker-compose default
- writes `EXPO_PUBLIC_API_URL` to local `.env`
- host presets:
  - `npm start` -> LAN IP
  - `npm run android` -> `10.0.2.2`
  - `npm run ios` -> `127.0.0.1`

Manual run:
```bash
npm run sync:api-env
```

### Product behavior notes (current)

- First launch: onboarding -> language -> login
- Login with email or phone; biometric login appears after first successful sign-in
- Envelope behavior:
  - flexible envelope balance can move to main wallet
  - strict envelope balance stays locked in current mobile UI
- Reports:
  - month filter
  - branded PDF export (report + transaction receipt)

### Useful scripts

- `npm start`
- `npm run android`
- `npm run ios`
- `npm run web`
- `npm run sync:api-env`

---

## العربية

تطبيق AmanPay للموبايل مبني بـ Expo React Native.

### التشغيل المحلي

1) تثبيت الحزم:
```bash
npm install
```

2) تجهيز ملف البيئة:
```bash
cp .env.example .env
```

قيمة `EXPO_PUBLIC_API_URL` يتم تحديثها تلقائيًا عبر سكربت `sync-api-env.mjs`.

3) تشغيل الـ Backend أولًا (`AmanPay-back`):
```bash
cd ../elmorad-api
docker compose up --build -d
npm run seed
```

4) تشغيل التطبيق:
```bash
npm start
```

أو مباشرة:
- `npm run android`
- `npm run ios`
- `npm run web`

### آلية مزامنة API تلقائيًا

قبل `start/android/ios` يقوم التطبيق بـ:
- قراءة `API_PORT` من `../elmorad-api/.env` أو الافتراضي
- كتابة `EXPO_PUBLIC_API_URL` في `.env` المحلي
- اختيار المضيف حسب نوع التشغيل:
  - `npm start` -> عنوان LAN
  - `npm run android` -> `10.0.2.2`
  - `npm run ios` -> `127.0.0.1`

### ملاحظات الإصدار الحالي

- أول تشغيل: شاشة البداية -> اختيار اللغة -> تسجيل الدخول
- تسجيل الدخول بالإيميل أو الهاتف
- المغلفات:
  - الرصيد المرن يمكن نقله للمحفظة الرئيسية
  - الرصيد الصارم يبقى مقفلاً في واجهة الموبايل الحالية
- التقارير:
  - فلترة بالشهر
  - تصدير PDF مع هوية AmanPay
