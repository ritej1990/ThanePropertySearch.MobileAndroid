# Maestro E2E flows — Thane Flats mobile

End-to-end UI flows that drive the **real built app** against the **real backend**.
They are authored here but must be **run by you** on an emulator/device — this
repo's CI does not (yet) execute them.

## Prerequisites

1. Install Maestro: https://maestro.mobile.dev/getting-started/installing-maestro
2. A running Android emulator (or connected device) with the app installed:
   ```bash
   npm run android        # build + install a dev/debug build
   ```
   The app id is `com.thaneflats.app`.
3. The app must point at a reachable backend (`.env` → `EXPO_PUBLIC_API_BASE_URL`,
   currently `https://tpsapi.azurewebsites.net`).

## Running

```bash
maestro test flows/login.yaml                                   # single flow
maestro test flows/login.yaml -e USERNAME=Agent2 -e PASSWORD=Ritesh123
maestro test flows/                                             # whole suite
maestro studio                                                  # interactive inspector
```

## Flows

| File | Covers | Notes |
|------|--------|-------|
| `login.yaml` | Login → enter app | Parametrised (`-e USERNAME=… -e PASSWORD=…`) for Ritesh1990 / Tejashri1991 / Agent2 |
| `register.yaml` | Registration UI, Agent-role fields | Final submit is **commented out** so runs don't create real accounts |
| `agent-plan.yaml` | Plan configurator → order summary → checkout | **Stops at the Cashfree hand-off — no real payment** (the "bypass payment" boundary) |
| `post-property.yaml` | Owner post-listing wizard, step 1 | Targets inputs by placeholder text |
| `search.yaml` | Property search + filters + sort | |

## Test credentials

| Username | Password | Role |
|----------|----------|------|
| Ritesh1990 | Ritesh123 | (owner — used for post-property) |
| Tejashri1991 | Ritesh123 | (user — used for search) |
| Agent2 | Ritesh123 | agent — used for the plan flow |

## Stable selectors (testIDs added for these flows)

Authored against `testID`s where they exist (robust), and visible text elsewhere
(may need tweaks after the first run — text matchers break if a label changes):

- `login-username`, `login-password`, `login-submit`, `login-create-account`
- `register-submit`
- `agent-plan-pay`
- Plan sliders expose accessibility actions: `Increase Total properties`,
  `Increase Total days`, `Increase Total leads` (and `Decrease …`).

If a text-matched step fails on your build, open `maestro studio`, inspect the
element, and either adjust the matcher or add a `testID` to that element.

## Payment safety

`agent-plan.yaml` deliberately stops at the checkout hand-off and never completes
a Cashfree payment. To test the *post-payment* path without real money, use a
backend sandbox/test mode for the activation endpoint rather than completing a
live transaction in these flows.
