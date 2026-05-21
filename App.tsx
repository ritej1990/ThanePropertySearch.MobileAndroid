import React from 'react';
import { Platform } from 'react-native';
import { AppBootGate } from './src/components/launch/AppBootGate';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ToastProvider } from './src/context/ToastContext';
import type { RootStackParamList } from './src/navigation/types';
import { colors } from './src/theme';
import { isOwnerRole } from './src/utils/roles';
import LoginScreen from './src/screens/LoginScreen';
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
import PolicyScreen from './src/screens/PolicyScreen';
import { linking } from './src/navigation/linking';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { token, profile } = useAuth();

  const isAuthed = token != null;
  const isOwner = isOwnerRole(profile?.role);

  return (
    <AppBootGate>
    <Stack.Navigator
      key={isAuthed ? (isOwner ? 'authed-owner' : 'authed-user') : 'guest'}
      initialRouteName={
        isAuthed ? (isOwner ? 'OwnerDashboard' : 'Home') : 'Login'
      }
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
            name="Policy"
            component={PolicyScreen}
            options={{ headerShown: false }}
          />
        </>
      ) : (
        <>
          {isOwner ? (
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
          {isOwner ? (
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
        </>
      )}
    </Stack.Navigator>
    </AppBootGate>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ToastProvider>
          <NavigationContainer linking={linking}>
            <StatusBar style="auto" />
            <AppNavigator />
          </NavigationContainer>
        </ToastProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
