const { withAndroidManifest } = require('expo/config-plugins');

/** Android 11+ package visibility — required for Linking.openURL to UPI apps from WebView. */
const PAYMENT_SCHEMES = [
  'upi',
  'tez',
  'gpay',
  'paytmmp',
  'phonepe',
  'bhim',
  'credpay',
  'amazonpay',
];

/**
 * @param {import('expo/config').ExpoConfig} config
 */
module.exports = function withPaymentAppQueries(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const paymentIntents = PAYMENT_SCHEMES.map((scheme) => ({
      action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
      data: [{ $: { 'android:scheme': scheme } }],
    }));

    const existing = manifest.queries ?? [];
    manifest.queries = [...existing, { intent: paymentIntents }];
    return config;
  });
};
