import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const PHONE_VIEWPORT = {
  width: 430,
  height: 932,
};

function WebPhoneFrame({ children }: React.PropsWithChildren) {
  const { width, height } = useWindowDimensions();
  const shouldFrame = Platform.OS === 'web' && width >= 768;

  if (!shouldFrame) {
    return <View style={styles.appSurface}>{children}</View>;
  }

  const availableHeight = Math.max(height - 40, 560);
  const availableWidth = Math.max(width - 48, 320);
  const frameHeight = Math.min(availableHeight, 880);
  const frameWidth = Math.min(
    Math.round(frameHeight * (PHONE_VIEWPORT.width / PHONE_VIEWPORT.height)),
    availableWidth - 24
  );
  const scale = Math.min(
    frameWidth / PHONE_VIEWPORT.width,
    frameHeight / PHONE_VIEWPORT.height
  );

  return (
    <View style={styles.desktopCanvas}>
      <View style={[styles.phoneShadow, { width: frameWidth + 24, height: frameHeight + 24 }]}>
        <View style={[styles.phoneShell, { width: frameWidth, height: frameHeight }]}>
          <View pointerEvents="none" style={styles.phoneMask} />
          <View
            style={[
              styles.appViewport,
              {
                width: PHONE_VIEWPORT.width,
                height: PHONE_VIEWPORT.height,
                transform: [{ scale }],
              },
            ]}
          >
            <View style={styles.appSurface}>{children}</View>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <WebPhoneFrame>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="trips/[id]" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="trips/calendar" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="trips/new" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="trips/report-expense" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="notifications" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="support/chat" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="support/faq" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="profile/feedback" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="profile/language" options={{ headerShown: false, presentation: 'modal' }} />
        </Stack>
      </WebPhoneFrame>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  desktopCanvas: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: 'transparent',
  },
  phoneShadow: {
    borderRadius: 52,
    backgroundColor: '#1B1F2A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#020617',
    shadowOffset: { width: 0, height: 30 },
    shadowOpacity: 0.38,
    shadowRadius: 46,
    elevation: 24,
  },
  phoneShell: {
    overflow: 'hidden',
    borderRadius: 40,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  phoneMask: {
    ...StyleSheet.absoluteFillObject,
    top: -1,
    right: -1,
    bottom: -1,
    left: -1,
    borderRadius: 41,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    backgroundColor: '#F0F4F8',
  },
  appViewport: {
    transformOrigin: 'top center',
  },
  appSurface: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderRadius: 40,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    backgroundColor: '#F0F4F8',
  },
});
