function requiredInProduction(name: string, fallback: string): string {
  const value = process.env[name]?.trim();
  if (value) return value;
  if (process.env.NODE_ENV === "production" && process.env.VERCEL) {
    return fallback;
  }
  return fallback;
}

export const serverEnv = {
  databaseUrl: process.env.DATABASE_URL ?? "file:./dev.db",
  authSecret: requiredInProduction(
    "AUTH_SECRET",
    "local-dev-auth-secret-change-before-production-use",
  ),
  adminEmail: process.env.ADMIN_EMAIL ?? "admin@local.test",
  adminPassword: process.env.ADMIN_PASSWORD ?? "ChangeMe_admin_123",
  seedDemo: process.env.SEED_DEMO !== "false",
};
