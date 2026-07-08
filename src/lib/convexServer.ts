import { ConvexHttpClient } from "convex/browser";

let cached: ConvexHttpClient | null = null;

export function getConvex(): ConvexHttpClient {
  const url =
    process.env.CONVEX_DEPLOYMENT_URL ??
    (process.env.CONVEX_DEPLOYMENT
      ? `https://${process.env.CONVEX_DEPLOYMENT}.convex.cloud`
      : process.env.NEXT_PUBLIC_CONVEX_URL);
  if (!url) {
    throw new Error(
      "Convex is not configured. Set CONVEX_DEPLOYMENT_URL (or CONVEX_DEPLOYMENT / NEXT_PUBLIC_CONVEX_URL).",
    );
  }
  if (!cached) cached = new ConvexHttpClient(url);
  return cached;
}
