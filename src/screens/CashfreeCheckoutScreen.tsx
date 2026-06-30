import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';
import { WebView, type WebViewNavigation } from 'react-native-webview';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  cashfreeReturnUrlForProduct,
  isCashfreeReturnNavigation,
  parseCashfreeReturnUrl,
  resolveReturnUrl,
} from '../api/paymentReturnUrls';
import {
  clearPendingPayment,
  savePendingPayment,
} from '../storage/pendingPaymentStorage';
import type { RootStackParamList } from '../navigation/types';
import { AuthenticatedScreenLayout } from '../components/layout/AuthenticatedScreenLayout';
import { BrandLoading } from '../components/ui/BrandLoading';
import { useTranslation } from '../context/LocaleContext';
import type { TranslateFn } from '../i18n';
import {
  isPaymentAppDeepLink,
  openPaymentAppDeepLink,
} from '../utils/paymentDeepLinks';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'CashfreeCheckout'>;

function buildCheckoutHtml(
  paymentSessionId: string,
  environment: string,
  returnUrl: string,
  t: TranslateFn
): string {
  const mode = environment === 'production' ? 'production' : 'sandbox';
  const escapedSession = paymentSessionId.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const escapedReturn = returnUrl.replace(/'/g, "\\'");
  const title = t('checkout.secureCheckoutTitle').replace(/'/g, "\\'");
  const opening = t('checkout.openingCashfree').replace(/'/g, "\\'");
  const couldNotStart = t('checkout.couldNotStartPayment').replace(/'/g, "\\'");
  const goBackTryAgain = t('checkout.goBackTryAgain').replace(/'/g, "\\'");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <title>${title}</title>
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
    <h1>${title}</h1>
    <p id="status">${opening}</p>
    <p class="err" id="err"></p>
  </div>
  <script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>
  <script>
    (function () {
      var status = document.getElementById('status');
      var errEl = document.getElementById('err');
      function notifyNative(payload) {
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify(payload));
        }
      }
      function fail(msg, cancelled) {
        status.textContent = '${couldNotStart}';
        errEl.textContent = msg || '${goBackTryAgain}';
        if (cancelled) {
          notifyNative({ type: 'checkout_cancelled', message: msg || 'Payment cancelled.' });
        }
      }
      function start() {
        if (typeof Cashfree === 'undefined') {
          fail('Cashfree SDK failed to load. Check your connection.', false);
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
              fail(result.error.message || 'Payment cancelled.', true);
            }
          }).catch(function (e) {
            fail(e && e.message ? e.message : String(e), true);
          });
        } catch (e) {
          fail(e && e.message ? e.message : String(e), false);
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
  const { t } = useTranslation();
  const {
    paymentSessionId,
    orderId,
    environment,
    product,
    tierCode,
    amountInr,
    returnPropertyId,
  } = route.params;
  const handledRef = useRef(false);
  const leavingRef = useRef(false);

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
    () => buildCheckoutHtml(paymentSessionId, environment, returnUrl, t),
    [paymentSessionId, environment, returnUrl, t]
  );

  const exitCheckout = useCallback(
    (message?: string) => {
      if (handledRef.current || leavingRef.current) return;
      leavingRef.current = true;
      void clearPendingPayment();
      navigation.goBack();
      if (message) {
        setTimeout(() => {
          Alert.alert(t('checkout.notCompleted'), message);
        }, 200);
      }
    },
    [navigation, t]
  );

  const handleReturn = useCallback(
    (url?: string) => {
      if (handledRef.current || leavingRef.current) return;
      handledRef.current = true;

      const parsed = url ? parseCashfreeReturnUrl(url) : null;
      navigation.replace('PaymentReturn', {
        orderId: parsed?.orderId ?? orderId,
        product: parsed?.product ?? product,
        tierCode: parsed?.tierCode ?? tierCode,
        amountInr,
        returnPropertyId,
      });
    },
    [navigation, orderId, product, tierCode, amountInr, returnPropertyId]
  );

  const shouldWebViewLoad = useCallback(
    (url: string): boolean => {
      if (!url || url === 'about:blank') return true;

      if (url.startsWith('thaneproperty://') || isCashfreeReturnNavigation(url)) {
        handleReturn(url);
        return false;
      }

      if (isPaymentAppDeepLink(url)) {
        void openPaymentAppDeepLink(url).then((opened) => {
          if (!opened) {
            Alert.alert(
              t('checkout.paymentAppNotFound'),
              t('checkout.paymentAppNotFoundBody')
            );
          }
        });
        return false;
      }

      return true;
    },
    [handleReturn, t]
  );

  function onNavigationChange(nav: WebViewNavigation) {
    shouldWebViewLoad(nav.url ?? '');
  }

  function confirmLeaveCheckout() {
    Alert.alert(t('checkout.leaveCheckoutTitle'), t('checkout.leaveCheckoutBody'), [
      { text: t('checkout.stay'), style: 'cancel' },
      {
        text: t('checkout.leave'),
        style: 'destructive',
        onPress: () => {
          exitCheckout(t('checkout.leftEarly'));
        },
      },
    ]);
  }

  return (
    <AuthenticatedScreenLayout
      showBack
      onBack={confirmLeaveCheckout}
      showFloatingActions={false}
      showLegalFooter={false}
    >
      <View style={styles.wrap}>
        <WebView
          originWhitelist={['*']}
          source={{ html, baseUrl: 'https://thaneflats.com' }}
          onNavigationStateChange={onNavigationChange}
          onLoadStart={(e) => {
            shouldWebViewLoad(e.nativeEvent.url ?? '');
          }}
          onShouldStartLoadWithRequest={(req) => shouldWebViewLoad(req.url ?? '')}
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data) as {
                type?: string;
                message?: string;
              };
              if (data.type === 'checkout_cancelled') {
                exitCheckout(data.message || t('checkout.leftEarly'));
              }
            } catch {
              /* ignore malformed messages */
            }
          }}
          onError={() => {
            Alert.alert(t('checkout.checkoutError'), t('checkout.checkoutErrorBody'), [
              { text: t('common.ok'), onPress: () => navigation.goBack() },
            ]);
          }}
          style={styles.webview}
          javaScriptEnabled
          domStorageEnabled
          setSupportMultipleWindows={false}
          thirdPartyCookiesEnabled
          sharedCookiesEnabled={Platform.OS === 'android'}
          startInLoadingState
          renderLoading={() => (
            <BrandLoading
              fullScreen={false}
              message={t('checkout.loading')}
            />
          )}
        />
      </View>
    </AuthenticatedScreenLayout>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.surfaceMuted },
  webview: { flex: 1 },
});
