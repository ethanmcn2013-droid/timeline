/**
 * Next.js 16 instrumentation hook. Runs once at server boot.
 *
 * Used here to validate the environment at boot so a misconfigured
 * production fails loudly and visibly rather than 500ing every request
 * that touches the database (production-readiness audit, env validation).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { validateEnv } = await import("@/env");
    validateEnv();
  }
}
