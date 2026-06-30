import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { builderProjectsApi } from '../api/singleton';
import type { BuilderLead } from '../api/builderTypes';
import { ApiError } from '../api/client';
import { AuthenticatedScreenLayout } from '../components/layout/AuthenticatedScreenLayout';
import { PageHero } from '../components/ui/PageHero';
import { BrandLoading } from '../components/ui/BrandLoading';
import { useTranslation } from '../context/LocaleContext';
import { localeToCulture } from '../i18n/types';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'BuilderLeads'>;

export default function BuilderLeadsScreen({ navigation, route }: Props) {
  const { projectId, projectName } = route.params;
  const { t, locale } = useTranslation();
  const [rows, setRows] = useState<BuilderLead[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await builderProjectsApi.getLeads(projectId);
      setRows(data);
    } catch (e) {
      Alert.alert(
        t('builder.couldNotLoadLeads'),
        e instanceof ApiError ? e.message : t('shared.tryAgain')
      );
    } finally {
      setLoading(false);
    }
  }, [projectId, t]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  const subtitle = projectName
    ? t('builder.projectLeadsSubNamedEnquiries', { name: projectName })
    : t('builder.projectLeadsSub');

  return (
    <AuthenticatedScreenLayout showBack onBack={() => navigation.goBack()}>
      <View style={styles.wrap}>
        <View style={styles.pad}>
          <PageHero
            variant="builder"
            icon="people-outline"
            title={t('builder.projectLeads')}
            subtitle={subtitle}
          />
        </View>

        {loading ? (
          <BrandLoading fullScreen={false} message={t('builder.loadingLeads')} />
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(r) => String(r.id)}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="mail-open-outline" size={40} color={colors.slateLight} />
                <Text style={styles.emptyTitle}>{t('builder.noLeads')}</Text>
                <Text style={styles.emptySub}>{t('builder.noLeadsSub')}</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>
                  {new Date(item.createdAtUtc).toLocaleString(localeToCulture(locale))}
                </Text>
                {item.email ? (
                  <Pressable onPress={() => Linking.openURL(`mailto:${item.email}`)}>
                    <Text style={styles.link}>✉ {item.email}</Text>
                  </Pressable>
                ) : null}
                {item.phone ? (
                  <Pressable onPress={() => Linking.openURL(`tel:${item.phone}`)}>
                    <Text style={styles.link}>📞 {item.phone}</Text>
                  </Pressable>
                ) : null}
                {item.message ? (
                  <Text style={styles.message}>{item.message}</Text>
                ) : null}
              </View>
            )}
          />
        )}
      </View>
    </AuthenticatedScreenLayout>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.surfaceMuted },
  pad: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.builderBorder,
  },
  name: { fontSize: 16, fontWeight: '800', color: colors.navy },
  meta: { fontSize: 12, color: colors.slateLight, marginTop: 4 },
  link: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.builder,
    marginTop: spacing.sm,
  },
  message: {
    fontSize: 13,
    color: colors.slateMuted,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  empty: { alignItems: 'center', padding: spacing.xxxl },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.navy,
    marginTop: spacing.lg,
  },
  emptySub: {
    fontSize: 14,
    color: colors.slateLight,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
