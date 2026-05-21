import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PolicyDocumentView } from '../components/policy/PolicyDocumentView';
import { POLICY_DOCUMENTS } from '../content/policies';
import type { RootStackParamList } from '../navigation/types';
import { colors, gradients, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Policy'>;

export default function PolicyScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const document = POLICY_DOCUMENTS[route.params.kind];

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[...gradients.hero]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + spacing.xs }]}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={8}
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={20} color={colors.heroText} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {document.title}
        </Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <PolicyDocumentView document={document} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: colors.heroText,
  },
  content: {
    padding: spacing.lg,
  },
});
