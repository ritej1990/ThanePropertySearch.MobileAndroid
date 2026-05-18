let shownVerifyToastThisSession = false;

export function resetEmailVerificationToastSession() {
  shownVerifyToastThisSession = false;
}

export function markEmailVerificationToastShown() {
  shownVerifyToastThisSession = true;
}

export function wasEmailVerificationToastShown() {
  return shownVerifyToastThisSession;
}
