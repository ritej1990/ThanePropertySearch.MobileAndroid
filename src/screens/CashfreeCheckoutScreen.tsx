import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { WebView, type WebViewNavigation } from 'react-native-webview';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  cashfreeReturnUrlForProduct,
  isCashfreeReturnNavigation,
  parseCashfreeReturnUrl,
  resolveReturnUrl,
} from '../api/paymentReturnUrls';
import { savePendingPayment } from '../storage/pendingPaymentStorage';
import type { RootStackParamList } from '../navigation/types';
import { AuthenticatedScreenLayout } from '../components/layout/AuthenticatedScreenLayout';
import { BrandLoading } from '../components/ui/BrandLoading';
import { colors, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'CashfreeCheckout'>;

function buildCheckoutHtml(
  paymentSessionId: string,
  environment: string,
  returnUrl: string
): string {
  const mode = environment === 'production' ? 'production' : 'sandbox';
  const escapedSession = paymentSessionId.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const escapedReturn = returnUrl.replace(/'/g, "\\'");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <title>Secure checkout</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 24px; background: #f8fafc; color: #0f172a; text-align: center; }
    .box { max-width: 360px; margin: 40px auto; padding: 24px; background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; }
    h1 { font-size: 18px; margin: 0 0 8px; }
    p { font-size: 14px; color: #64748b; line-height: 1.5; }
    .err { color: #b91c1c; margin-top: 12px; font-size: 13px; }
  </style>
</head>
<body>
  <div class="box">
    <h1>Thane Flats — Secure checkout</h1>
    <p id="status">Opening Cashfree payment…</p>
    <p class="err" id="err"></p>
  </div>
  <script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>
  <script>
    (function () {
      var status = document.getElementById('status');
      var errEl = document.getElementById('err');
      function fail(msg) {
        status.textContent = 'Could not start payment';
        errEl.textContent = msg || 'Please go back and try again.';
      }
      function start() {
        if (typeof Cashfree === 'undefined') {
          fail('Cashfree SDK failed to load. Check your connection.');
          return;
        }
        try {
          var cashfree = Cashfree({ mode: '${mode}' });
          cashfree.checkout({
            paymentSessionId: '${escapedSession}',
            returnUrl: '${escapedReturn}',
            redirectTarget: '_self'
          }).then(function (result) {
            if (result && result.error) {
              fail(result.error.message || 'Payment cancelled.');
            }
          }).catch(function (e) {
            fail(e && e.message ? e.message : String(e));
          });
        } catch (e) {
          fail(e && e.message ? e.message : String(e));
        }
      }
      if (document.readyState === 'complete') start();
      else window.addEventListener('load', start);
    })();
  </script>
</body>
</html>`;
}

export default function CashfreeCheckoutScreen({ navigation, route }: Props) {
  const {
    paymentSessionId,
    orderId,
    environment,
    product,
    tierCode,
    amountInr,
    returnPropertyId,
  } = route.params;
  const [handlingReturn, setHandlingReturn] = useState(false);
  const handledRef = useRef(false);

  useEffect(() => {
    void savePendingPayment({
      product,
      orderId,
      tierCode,
      amountInr,
      returnPropertyId,
    });
  }, [product, orderId, tierCode, amountInr, returnPropertyId]);

  const returnUrlTemplate = cashfreeReturnUrlForProduct(product, tierCode);
  const returnUrl = resolveReturnUrl(returnUrlTemplate, orderId);
  const html = useMemo(
    () => buildCheckoutHtml(paymentSessionId, environment, returnUrl),
    [paymentSessionId, environment, returnUrl]
  );

  function handleReturn(url?: string) {
    if (handledRef.current) return;
    handledRef.current = true;
    setHandlingReturn(true);

    const parsed = url ? parseCashfreeReturnUrl(url) : null;
    navigation.replace('PaymentReturn', {
      orderId: parsed?.orderId ?? orderId,
      product: parsed?.product ?? product,
      tierCode: parsed?.tierCode ?? tierCode,
      amountInr,
      returnPropertyId,
    });
  }

  function interceptReturnUrl(url: string): boolean {
    if (!isCashfreeReturnNavigation(url)) return false;
    handleReturn(url);
    return true;
  }

  function onNavigationChange(nav: WebViewNavigation) {
    interceptReturnUrl(nav.url ?? '');
  }

  return (
    <AuthenticatedScreenLayout showBack onBack={() => navigation.goBack()}>
      <View style={styles.wrap}>
        {handlingReturn ? (
          <BrandLoading fullScreen={false} message="Confirming your payment…" />
        ) : (
          <WebView
            originWhitelist={['*']}
            source={{ html, baseUrl: 'https://thaneflats.com' }}
            onNavigationStateChange={onNavigationChange}
            onLoadStart={(e) => {
              interceptReturnUrl(e.nativeEvent.url);
            }}
            onShouldStartLoadWithRequest={(req) => {
              const url = req.url ?? '';
              if (url.startsWith('thaneproperty://')) {
                handleReturn(url);
                return false;
              }
              if (isCashfreeReturnNavigation(url)) {
                handleReturn(url);
                return false;
              }
              return true;
            }}
            onError={() => {
              Alert.alert(
                'Checkout error',
                'Could not load secure payment page. Try again.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            }}
            style={styles.webview}
            javaScriptEnabled
            domStorageEnabled
            setSupportMultipleWindows={false}
            thirdPartyCookiesEnabled
            sharedCookiesEnabled={Platform.OS === 'android'}
            startInLoadingState
            renderLoading={() => (
              <BrandLoading fullScreen={false} message="Opening secure checkout…" />
            )}
          />
        )}
      </View>
    </AuthenticatedScreenLayout>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.surfaceMuted },
  webview: { flex: 1 },
});
