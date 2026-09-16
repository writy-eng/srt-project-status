// @ts-check
/**
 * The sign-out sequence used by `src/lib/auth/client.ts`, kept here as a pure
 * module so its effects can be unit-tested (`node --test` only covers
 * `scripts/`), the same split `migration-plan.mjs` uses for the two appliers.
 */

export const PREVIEW_SIGN_OUT_TIMEOUT_MS = 1500;
export const DEPLOYED_SIGN_OUT_TIMEOUT_MS = 10_000;

/**
 * How long to wait for a sign-out in this environment.
 * @param {boolean} livePreview
 * @returns {number}
 */
export function signOutTimeoutMs(livePreview) {
  return livePreview ? PREVIEW_SIGN_OUT_TIMEOUT_MS : DEPLOYED_SIGN_OUT_TIMEOUT_MS;
}

/**
 * Run `start()` but give up after `timeoutMs`, reporting which happened.
 * @param {() => unknown} start
 * @param {number} timeoutMs
 * @returns {Promise<"ok" | "failed" | "timeout">}
 */
export function settleWithin(start, timeoutMs) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve("timeout"), timeoutMs);
    /** @param {"ok" | "failed"} outcome */
    const done = (outcome) => {
      clearTimeout(timer);
      resolve(outcome);
    };
    try {
      Promise.resolve(start()).then(
        () => done("ok"),
        () => done("failed"),
      );
    } catch {
      done("failed");
    }
  });
}

/**
 * End the session, then clear the local token and redirect.
 * @param {object} steps
 * @returns {Promise<void>}
 */
export async function runSignOut({
  livePreview,
  hasBearer,
  requestSignOut,
  clearToken,
  redirect,
  timeoutMs,
}) {
  if (livePreview) {
    if (hasBearer) {
      await settleWithin(requestSignOut, timeoutMs ?? signOutTimeoutMs(livePreview));
    }
    clearToken();
    redirect();
    return;
  }

  const outcome = await settleWithin(requestSignOut, timeoutMs ?? signOutTimeoutMs(livePreview));
  if (outcome !== "ok") {
    throw new Error(
      outcome === "timeout"
        ? "Sign-out timed out — you are still signed in. Please try again."
        : "Sign-out failed — you are still signed in. Please try again.",
    );
  }
  clearToken();
  redirect();
}

/**
 * Drop any prior session before a new sign-in starts.
 * @param {object} steps
 * @returns {Promise<void>}
 */
export async function runPreSignInSignOut({
  livePreview,
  hasBearer,
  requestSignOut,
  clearToken,
  timeoutMs,
}) {
  if (hasBearer || !livePreview) {
    await settleWithin(requestSignOut, timeoutMs ?? signOutTimeoutMs(livePreview));
  }
  clearToken();
}
