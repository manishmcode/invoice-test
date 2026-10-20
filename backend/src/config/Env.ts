import "dotenv/config";

function readString(name: string, fallback = ""): string {
  const value = process.env[name];
  return value === undefined ? fallback : value;
}

function readPort(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) {
    return fallback;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 65535) {
    throw new Error(`${name} must be a TCP port between 1 and 65535`);
  }
  return parsed;
}

function readPoolSize(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) {
    return fallback;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${name} must be a non-negative integer`);
  }
  return parsed;
}

function readEnv() {
  const databaseUrl = readString("DATABASE_URL");
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const allowlistRaw = readString("MAIL_ALLOWLIST");
  const mailAllowlist = allowlistRaw
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  const databasePoolMin = readPoolSize("DATABASE_POOL_MIN", 2);
  const databasePoolMax = readPoolSize("DATABASE_POOL_MAX", 10);
  if (databasePoolMin > databasePoolMax) {
    throw new Error("DATABASE_POOL_MIN cannot exceed DATABASE_POOL_MAX");
  }

  return {
    port: readPort("PORT", 3001),
    frontendOrigin: readString("FRONTEND_ORIGIN", "http://localhost:3000"),
    databaseUrl,
    databasePoolMin,
    databasePoolMax,
    smtpHost: readString("SMTP_HOST"),
    smtpPort: readPort("SMTP_PORT", 587),
    smtpUser: readString("SMTP_USER"),
    smtpPass: readString("SMTP_PASS"),
    mailFrom: readString("MAIL_FROM"),
    mailAllowlist,
  };
}

export const env = readEnv();
