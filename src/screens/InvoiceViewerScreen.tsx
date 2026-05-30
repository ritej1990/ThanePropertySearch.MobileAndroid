import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { invoicesApi } from '../api/singleton';
import { ApiError } from '../api/client';
import { AuthenticatedScreenLayout } from '../components/layout/AuthenticatedScreenLayout';
import { BrandLoading } from '../components/ui/BrandLoading';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'InvoiceViewer'>;

export default function InvoiceViewerScreen({ navigation, route }: Props) {
  const { paymentTransactionId, invoiceNumber } = route.params;
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const content = await invoicesApi.getMyInvoiceHtml(paymentTransactionId);
      setHtml(content);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not load invoice');
    }
  }, [paymentTransactionId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <AuthenticatedScreenLayout
      showBack
      onBack={() => navigation.goBack()}
      showLegalFooter={false}
    >
      <View style={styles.wrap}>
        {!html && !error ? (
          <BrandLoading message="Loading invoice…" />
        ) : error ? (
          <BrandLoading fullScreen={false} message={error} />
        ) : html ? (
          <WebView
            originWhitelist={['*']}
            source={{ html }}
            style={styles.web}
            startInLoadingState
          />
        ) : null}
      </View>
    </AuthenticatedScreenLayout>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.surface },
  web: { flex: 1, margin: spacing.sm },
});
