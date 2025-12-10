import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { router, Stack } from 'expo-router';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AudioProvider } from '@/contexts/PlayerContext';
import { PortalHost } from "@rn-primitives/portal";
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';


export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <AudioProvider>
        <RootLayoutNav />
      </AudioProvider>
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const { loading, token } = useAuth();
  
  useEffect(() => {
    if (!loading) {
      if (!token) {
        router.replace("/auth/login");
      } else {
        router.replace("/(tabs)");
      }
    }
  }, [token, loading]);

  if (loading) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center',backgroundColor: DarkTheme.colors.background }}>
          <ActivityIndicator size="large" color="#4b7cbbff" />
        </View>
    );
  }

  return (
    <ThemeProvider value={DarkTheme}>
      <View style={{ flex: 1 }}>
        <Stack>
          <Stack.Screen name="auth/login" options={{ headerShown: false }}/>
          
          <Stack.Screen name="(tabs)" options={{ headerShown: false }}/>
        </Stack>
      </View>
      <PortalHost />
    </ThemeProvider>
  );
}
