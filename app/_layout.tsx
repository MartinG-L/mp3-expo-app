import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { router, Stack } from 'expo-router';
import 'react-native-reanimated';
import "../global.css";

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AudioProvider } from '@/contexts/PlayerContext';
import { Toaster } from "@/lib/sonner";
import { PortalHost } from "@rn-primitives/portal";
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from "react-native-safe-area-context";




export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <AuthProvider>
      <AudioProvider>
        <View style={{ flex: 1 }}>
          <SafeAreaView
            style={{ flex: 0, backgroundColor: "#000" }}
            edges={["top"]}
          />
            <RootLayoutNav />
          <SafeAreaView
            style={{ flex: 0, backgroundColor: "#111" }}
            edges={["bottom"]}
          />
        </View>
      </AudioProvider>
    </AuthProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const { loading, token, isLoggingIn } = useAuth();
  
  useEffect(() => {
    if (!loading && !isLoggingIn) {
      if (!token) {
        router.replace("/auth/login");
      } else {
        router.replace("/(tabs)");
      }
    }
  }, [token, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center',backgroundColor: "#111" }}>
        <ActivityIndicator size="large" color="white" />
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
     <Toaster
      position="top-center"
    
    />
    </ThemeProvider>
  );
}
