export function appUrl() {
  const configured = process.env.APP_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  const domain = process.env.RAILWAY_PUBLIC_DOMAIN?.trim();
  if (domain) return `https://${domain}`;

  return "http://localhost:3000";
}
