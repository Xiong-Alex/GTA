import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="trips/[id]" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="trips/new" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="notifications" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="support/chat" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="support/faq" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="profile/feedback" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="profile/language" options={{ headerShown: false, presentation: 'modal' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
