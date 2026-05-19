import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { propertiesApi } from '../api/singleton';
import type { PropertyInquirySummary } from '../api/inquiryTypes';
import { AuthenticatedScreenLayout } from '../components/layout/AuthenticatedScreenLayout';
import { BrandLoading } from '../components/ui/BrandLoading';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'PropertyInquiries'>;

export default function PropertyInquiriesScreen({ navigation, route }: Props) {
  const { propertyId, title } = route.params;
  const [rows, setRows] = useState<PropertyInquirySummary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await propertiesApi.getPropertyInquiries(propertyId);
      setRows(data);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  return (
    <AuthenticatedScreenLayout showBack onBack={() => navigation.goBack()}>
      <View style={styles.wrap}>
        {loading ? (
          <BrandLoading fullScreen={false} message="Loading requests…" />
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(r) => String(r.id)}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={styles.empty}>No requests yet for this listing.</Text>
            }
            renderItem={({ item }) => (
              <Pressable
                style={styles.row}
                onPress={() =>
                  navigation.navigate('PropertyChat', {
                    propertyId,
                    inquiryId: item.id,
                    title: item.requestBy,
                  })
                }
              >
                <Text style={styles.rowTitle}>{item.requestBy}</Text>
                <Text style={styles.rowMeta}>
                  {item.status} · {new Date(item.createdAtUtc).toLocaleDateString('en-IN')}
                </Text>
              </Pressable>
            )}
          />
        )}
      </View>
    </AuthenticatedScreenLayout>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.surfaceMuted },
  loader: { marginTop: spacing.xxxl },
  list: { padding: spacing.lg },
  row: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  rowTitle: { fontSize: 16, fontWeight: '800', color: colors.navy },
  rowMeta: { fontSize: 13, color: colors.slateLight, marginTop: 4 },
  empty: { textAlign: 'center', color: colors.slateLight, marginTop: 40 },
});
