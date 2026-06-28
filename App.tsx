import React from 'react';
import { Platform, View } from 'react-native';
import { AppBootGate } from './src/components/launch/AppBootGate';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LocaleProvider } from './src/context/LocaleContext';
import { ToastProvider } from './src/context/ToastContext';
import { SiteMaintenanceProvider } from './src/context/SiteMaintenanceContext';
import { UnreadMessagesProvider } from './src/context/UnreadMessagesContext';
import { MessageNotificationsListener } from './src/context/MessageNotificationsContext';
import { MaintenanceBanner } from './src/components/layout/MaintenanceBanner';
import { navigationRef } from './src/navigation/navigationRef';
import type { RootStackParamList } from './src/navigation/types';
import { colors } from './src/theme';
import { isBuilderRole, isOwnerRole, isAgentRole } from './src/utils/roles';
import { BUILDER_PORTAL_ENABLED } from './src/config/env';
import LoginScreen from './src/screens/LoginScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import OwnerDashboardScreen from './src/screens/OwnerDashboardScreen';
import PostPropertyScreen from './src/screens/PostPropertyScreen';
import PropertyDetailsScreen from './src/screens/PropertyDetailsScreen';
import EssentialServiceScreen from './src/screens/EssentialServiceScreen';
import ContactPackPurchaseScreen from './src/screens/ContactPackPurchaseScreen';
import CashfreeCheckoutScreen from './src/screens/CashfreeCheckoutScreen';
import PaymentReturnScreen from './src/screens/PaymentReturnScreen';
import PropertyChatScreen from './src/screens/PropertyChatScreen';
import PropertyInquiriesScreen from './src/screens/PropertyInquiriesScreen';
import MyChatsScreen from './src/screens/MyChatsScreen';
import SupportTicketsScreen from './src/screens/SupportTicketsScreen';
import SupportTicketDetailsScreen from './src/screens/SupportTicketDetailsScreen';
import BuilderProjectsScreen from './src/screens/BuilderProjectsScreen';
import BuilderProjectDetailsScreen from './src/screens/BuilderProjectDetailsScreen';
import BuilderDashboardScreen from './src/screens/BuilderDashboardScreen';
import MyPaymentsScreen from './src/screens/MyPaymentsScreen';
import VisitRequestsScreen from './src/screens/VisitRequestsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import BuilderLeadsScreen from './src/screens/BuilderLeadsScreen';
import AgentDashboardScreen from './src/screens/AgentDashboardScreen';
import AiAdvisorScreen from './src/screens/AiAdvisorScreen';
import HomeLoanAdvisorScreen from './src/screens/HomeLoanAdvisorScreen';
import AreaExplorerScreen from './src/screens/AreaExplorerScreen';
import AgentPendingApprovalScreen from './src/screens/AgentPendingApprovalScreen';
import AgentPaymentsScreen from './src/screens/AgentPaymentsScreen';
import AgentLeadsScreen from './src/screens/AgentLeadsScreen';
import BuilderPaymentsScreen from './src/screens/BuilderPaymentsScreen';
import BuilderProjectFormScreen from './src/screens/BuilderProjectFormScreen';
import InvoiceViewerScreen from './src/screens/InvoiceViewerScreen';
import PolicyScreen from './src/screens/PolicyScreen';
import { linking } from './src/navigation/linking';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { token, profile } = useAuth();

  const isAuthed = token != null;
  const isOwner = isOwnerRole(profile?.role);
  const isBuilder = BUILDER_PORTAL_ENABLED && isBuilderRole(profile?.role);
  const isAgent = isAgentRole(profile?.role);

  const authedKey = isAgent
    ? 'authed-agent'
    : isBuilder
      ? 'authed-builder'
      : isOwner
        ? 'authed-owner'
        : 'authed-user';
  const initialAuthedRoute = isAgent
    ? 'AgentDashboard'
    : isBuilder
      ? 'BuilderDashboard'
      : isOwner
        ? 'OwnerDashboard'
        : 'Home';

  return (
    <AppBootGate>
    <Stack.Navigator
      key={isAuthed ? authedKey : 'guest'}
      initialRouteName={isAuthed ? initialAuthedRoute : 'Login'}
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.navy,
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.surfaceMuted },
      }}
    >
      {!isAuthed ? (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              headerShown: false,
              ...(Platform.OS === 'ios'
                ? { keyboardHandlingEnabled: true }
                : { keyboardHandlingEnabled: false }),
            }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Policy"
            component={PolicyScreen}
            options={{ headerShown: false }}
          />
        </>
      ) : (
        <>
          {isAgent ? (
            <Stack.Screen
              name="AgentDashboard"
              component={AgentDashboardScreen}
              options={{ headerShown: false }}
            />
          ) : isBuilder ? (
            <Stack.Screen
              name="BuilderDashboard"
              component={BuilderDashboardScreen}
              options={{ headerShown: false }}
            />
          ) : isOwner ? (
            <Stack.Screen
              name="OwnerDashboard"
              component={OwnerDashboardScreen}
              options={{ headerShown: false }}
            />
          ) : (
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false }}
            />
          )}
          <Stack.Screen
            name="PostProperty"
            component={PostPropertyScreen}
            options={{ headerShown: false }}
          />
          {isBuilder ? (
            <>
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ headerShown: false, title: 'Browse properties' }}
              />
              <Stack.Screen
                name="OwnerDashboard"
                component={OwnerDashboardScreen}
                options={{ headerShown: false, title: 'Owner listings' }}
              />
            </>
          ) : isOwner ? (
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false, title: 'Browse properties' }}
            />
          ) : isAgent ? (
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false, title: 'Browse properties' }}
            />
          ) : (
            <Stack.Screen
              name="OwnerDashboard"
              component={OwnerDashboardScreen}
              options={{ headerShown: false, title: 'My listings' }}
            />
          )}
          {BUILDER_PORTAL_ENABLED && (
            <>
              <Stack.Screen
                name="BuilderProjects"
                component={BuilderProjectsScreen}
                options={{ headerShown: false, title: 'Builder projects' }}
              />
              <Stack.Screen
                name="BuilderProjectDetails"
                component={BuilderProjectDetailsScreen}
                options={{ headerShown: false }}
              />
              {!isBuilder && (
                <Stack.Screen
                  name="BuilderDashboard"
                  component={BuilderDashboardScreen}
                  options={{ headerShown: false, title: 'Builder dashboard' }}
                />
              )}
            </>
          )}
          <Stack.Screen
            name="PropertyDetails"
            component={PropertyDetailsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="EssentialService"
            component={EssentialServiceScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ContactPackPurchase"
            component={ContactPackPurchaseScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CashfreeCheckout"
            component={CashfreeCheckoutScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PaymentReturn"
            component={PaymentReturnScreen}
            options={{
              headerShown: false,
              gestureEnabled: false,
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="PropertyChat"
            component={PropertyChatScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PropertyInquiries"
            component={PropertyInquiriesScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="MyChats"
            component={MyChatsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SupportTickets"
            component={SupportTicketsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SupportTicketDetails"
            component={SupportTicketDetailsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Policy"
            component={PolicyScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="MyPayments"
            component={MyPaymentsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="VisitRequests"
            component={VisitRequestsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AiAdvisor"
            component={AiAdvisorScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="HomeLoanAdvisor"
            component={HomeLoanAdvisorScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AreaExplorer"
            component={AreaExplorerScreen}
            options={{ headerShown: false }}
          />
          {BUILDER_PORTAL_ENABLED && (
            <>
              <Stack.Screen
                name="BuilderLeads"
                component={BuilderLeadsScreen}
                options={{ headerShown: false }}
              />
              {isBuilder ? (
                <Stack.Screen
                  name="BuilderProjectForm"
                  component={BuilderProjectFormScreen}
                  options={{ headerShown: false }}
                />
              ) : null}
            </>
          )}
          <Stack.Screen
            name="AgentPendingApproval"
            component={AgentPendingApprovalScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AgentPayments"
            component={AgentPaymentsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AgentLeads"
            component={AgentLeadsScreen}
            options={{ headerShown: false }}
          />
          {BUILDER_PORTAL_ENABLED && (
            <Stack.Screen
              name="BuilderPayments"
              component={BuilderPaymentsScreen}
              options={{ headerShown: false }}
            />
          )}
          <Stack.Screen
            name="InvoiceViewer"
            component={InvoiceViewerScreen}
            options={{ headerShown: false }}
          />
          {!isAgent && (
            <Stack.Screen
              name="AgentDashboard"
              component={AgentDashboardScreen}
              options={{ headerShown: false, title: 'Agent dashboard' }}
            />
          )}
        </>
      )}
    </Stack.Navigator>
    </AppBootGate>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <LocaleProvider>
        <AuthProvider>
          <SiteMaintenanceProvider>
            <UnreadMessagesProvider>
              <ToastProvider>
                <View style={{ flex: 1 }}>
                  <NavigationContainer ref={navigationRef} linking={linking}>
                    <StatusBar style="auto" />
                    <AppNavigator />
                  </NavigationContainer>
                  <MaintenanceBanner />
                  <MessageNotificationsListener />
                </View>
              </ToastProvider>
            </UnreadMessagesProvider>
          </SiteMaintenanceProvider>
        </AuthProvider>
      </LocaleProvider>
    </SafeAreaProvider>
  );
}
