export type TimelineLabGuardInput = {
  nodeEnv: string | undefined;
  vercelEnv?: string | undefined;
  flag: string | undefined;
  reviewMode: boolean;
};

/**
 * The Timeline design lab is deliberately unavailable on production deploys.
 * Preview deploys run production builds, so deployment posture is evaluated
 * separately from NODE_ENV and always wins when Vercel marks the deployment.
 */
export function isTimelineDesignLabEnabled(
  input: TimelineLabGuardInput,
): boolean {
  if (input.flag !== "true" || !input.reviewMode) return false;
  if (input.vercelEnv === "production") return false;

  const isPreview = input.vercelEnv === "preview";
  const isLocalDevelopment =
    input.nodeEnv === "development" &&
    (input.vercelEnv === undefined ||
      input.vercelEnv === "" ||
      input.vercelEnv === "development");

  return isPreview || isLocalDevelopment;
}
