#!/usr/bin/env node
/**
 * Writes ./.env with EXPO_PUBLIC_API_URL before Expo starts (npm hooks).
 * Port: API_PORT from ../elmorad-api/.env, else docker-compose default (3000).
 * Host: LAN (npm start), 10.0.2.2 (npm run android), 127.0.0.1 (npm run ios).
 */
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.join(__dirname, "..");
const REPO_ROOT = path.join(APP_ROOT, "..");
const API_ENV = path.join(REPO_ROOT, "elmorad-api", ".env");
const DOCKER_COMPOSE = path.join(REPO_ROOT, "elmorad-api", "docker-compose.yml");
const MOBILE_ENV = path.join(APP_ROOT, ".env");
const MOBILE_ENV_EXAMPLE = path.join(APP_ROOT, ".env.example");

function parseArgs(argv) {
  const out = { preset: null, host: null, port: null, help: false };
  for (const a of argv) {
    if (a.startsWith("--preset=")) out.preset = a.slice("--preset=".length);
    else if (a.startsWith("--host=")) out.host = a.slice("--host=".length);
    else if (a.startsWith("--port=")) out.port = a.slice("--port=".length);
    else if (a === "--help" || a === "-h") out.help = true;
  }
  return out;
}

function readEnvFileKey(filePath, key) {
  if (!fs.existsSync(filePath)) return null;
  const text = fs.readFileSync(filePath, "utf8");
  const re = new RegExp(`^${key}=(.*)$`, "m");
  const m = text.match(re);
  if (!m) return null;
  return m[1].trim().replace(/^["']|["']$/g, "");
}

function readComposeDefaultApiPort() {
  if (!fs.existsSync(DOCKER_COMPOSE)) return 3000;
  const text = fs.readFileSync(DOCKER_COMPOSE, "utf8");
  const m = text.match(/\$\{API_PORT:-(\d+)\}\s*:\s*3000/);
  if (m) {
    const n = parseInt(m[1], 10);
    if (!Number.isNaN(n) && n > 0) return n;
  }
  return 3000;
}

function readPublishedApiPort() {
  const fromEnv = readEnvFileKey(API_ENV, "API_PORT");
  if (fromEnv) {
    const n = parseInt(fromEnv, 10);
    if (!Number.isNaN(n) && n > 0) return n;
  }
  return readComposeDefaultApiPort();
}

function getLanIPv4() {
  const nets = os.networkInterfaces();
  const candidates = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      const isV4 = net.family === "IPv4" || net.family === 4;
      if (!isV4 || net.internal) continue;
      if (!net.address) continue;
      candidates.push({ name, address: net.address });
    }
  }
  const scored = candidates.map((c) => {
    const n = c.name.toLowerCase();
    let score = 0;
    if (/^en|^eth|^wlan|^wi-fi|^wifi|^wlp|^wl/.test(n)) score += 10;
    if (n.includes("docker") || n.includes("br-") || n.includes("veth")) score -= 5;
    return { ...c, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.length ? scored[0].address : "127.0.0.1";
}

function resolveHost(preset, explicitHost) {
  if (explicitHost) return explicitHost;
  switch (preset) {
    case "android-emulator":
      return "10.0.2.2";
    case "ios":
      return "127.0.0.1";
    default:
      return getLanIPv4();
  }
}

function upsertExpoPublicApiUrl(envText, url) {
  const line = `EXPO_PUBLIC_API_URL=${url}`;
  if (/^EXPO_PUBLIC_API_URL=/m.test(envText)) {
    return envText.replace(/^EXPO_PUBLIC_API_URL=.*$/m, line);
  }
  const trimmed = envText.replace(/\s+$/, "");
  if (!trimmed) return `${line}\n`;
  return `${trimmed}\n${line}\n`;
}

function resolvePresetFromNpm(args) {
  if (args.preset) return args.preset;
  const ev = process.env.npm_lifecycle_event;
  if (ev === "preandroid") return "android-emulator";
  if (ev === "preios") return "ios";
  return "lan";
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log("sync-api-env.mjs — see .env.example");
    process.exit(0);
  }
  const preset = resolvePresetFromNpm(args);
  const port =
    (process.env.SYNC_API_PORT && parseInt(process.env.SYNC_API_PORT, 10)) ||
    (args.port && parseInt(args.port, 10)) ||
    readPublishedApiPort();
  const host =
    process.env.SYNC_API_HOST ||
    args.host ||
    resolveHost(preset, null);
  const url = `http://${host}:${port}`;

  let base = "";
  if (fs.existsSync(MOBILE_ENV)) base = fs.readFileSync(MOBILE_ENV, "utf8");
  else if (fs.existsSync(MOBILE_ENV_EXAMPLE)) base = fs.readFileSync(MOBILE_ENV_EXAMPLE, "utf8");

  fs.writeFileSync(MOBILE_ENV, upsertExpoPublicApiUrl(base, url), "utf8");
  console.log(`[sync-api-env] EXPO_PUBLIC_API_URL=${url} (preset=${preset})`);
}

main();
