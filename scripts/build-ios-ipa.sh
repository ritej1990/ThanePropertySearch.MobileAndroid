#!/usr/bin/env bash
# Build a signed .ipa from the iOS workspace (requires Apple Developer signing in Xcode).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
IOS="$ROOT/ios"
ARCHIVE="$IOS/build/ThaneFlats.xcarchive"
EXPORT_DIR="$HOME/Desktop/ThaneFlats-ipa-export"
SCHEME="ThaneFlats"
WORKSPACE="$IOS/ThaneFlats.xcworkspace"

if [[ ! -d "$WORKSPACE" ]]; then
  echo "Missing $WORKSPACE — run: npx expo prebuild --platform ios"
  exit 1
fi

if [[ -z "${DEVELOPMENT_TEAM:-}" ]]; then
  echo "Set DEVELOPMENT_TEAM to your Apple Team ID (10 chars), e.g.:"
  echo "  export DEVELOPMENT_TEAM=AB12CD34EF"
  echo ""
  echo "Find it in Xcode → ThaneFlats target → Signing & Capabilities → Team."
  exit 1
fi

echo "Exporting JS bundle with production env from .env ..."
cd "$ROOT"
npx expo export --platform ios --output-dir dist

echo "Archiving Release build ..."
xcodebuild \
  -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath "$ARCHIVE" \
  archive \
  DEVELOPMENT_TEAM="$DEVELOPMENT_TEAM" \
  CODE_SIGN_STYLE=Automatic \
  -allowProvisioningUpdates

rm -rf "$EXPORT_DIR"
mkdir -p "$EXPORT_DIR"

echo "Exporting .ipa ..."
xcodebuild \
  -exportArchive \
  -archivePath "$ARCHIVE" \
  -exportPath "$EXPORT_DIR" \
  -exportOptionsPlist "$IOS/ExportOptions.plist" \
  -allowProvisioningUpdates

IPA="$(find "$EXPORT_DIR" -name '*.ipa' -print -quit)"
if [[ -n "$IPA" ]]; then
  echo ""
  echo "IPA built:"
  echo "  $IPA"
else
  echo "Export finished but no .ipa was found in $EXPORT_DIR"
  exit 1
fi
