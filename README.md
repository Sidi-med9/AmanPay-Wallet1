# AmanPay Mobile (Frontend)

Expo React Native app for AmanPay.

## Step-by-step local setup

### 1) Install dependencies

```bash
npm install
```

### 2) Prepare env file

```bash
cp .env.example .env
```

`EXPO_PUBLIC_API_URL` is auto-managed by the sync script before app start.

## 3) Start backend first

The mobile app expects the API running from `../elmorad-api`.

From repo root:

```bash
cd elmorad-api
docker compose up --build -d
npm run seed
```

## 4) Start the mobile app

From `AmanPay-Wallet1`:

```bash
npm start
```

Or directly:

- `npm run android`
- `npm run ios`
- `npm run web`

## API URL auto-sync behavior

Before `start/android/ios`, this project runs `scripts/sync-api-env.mjs`:

- reads API port from `../elmorad-api/.env` (`API_PORT`) or docker-compose default
- writes `EXPO_PUBLIC_API_URL` into local `.env`
- picks host by preset:
  - `npm start` -> LAN IP
  - `npm run android` -> `10.0.2.2`
  - `npm run ios` -> `127.0.0.1`

Manual run:

```bash
npm run sync:api-env
```

## Login/testing notes

- First login: email/phone + password
- Biometric login becomes available after first successful login on that device
- For Face ID / fingerprint native config changes, rebuild the app/dev client

## Useful scripts

- `npm start`: Expo start (LAN)
- `npm run android`: Expo Android launch
- `npm run ios`: Expo iOS launch
- `npm run web`: Expo web launch
- `npm run sync:api-env`: manually refresh API URL in `.env`
