import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider } from "@/context/AppContext";
import { PostCacheProvider } from "@/context/PostCacheContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="home" />
      <Stack.Screen name="search" />
      <Stack.Screen name="following" />
      <Stack.Screen name="add-post" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="history" />
      <Stack.Screen name="saved-posts" />
      <Stack.Screen name="user-following" />
      <Stack.Screen name="user-posts" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="search-results" />
      <Stack.Screen name="user/[userId]" />
      <Stack.Screen name="post/[postId]" />
      <Stack.Screen name="edit-post/[postId]" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "CormorantGaramond-Bold": require("../assets/fonts/CormorantGaramond-Bold.ttf"),
    "CormorantGaramond-BoldItalic": require("../assets/fonts/CormorantGaramond-BoldItalic.ttf"),
    "CormorantGaramond-Italic": require("../assets/fonts/CormorantGaramond-Italic.ttf"),
    "CormorantGaramond-Regular": require("../assets/fonts/CormorantGaramond-Regular.ttf"),
    "IBMPlexMono-Bold": require("../assets/fonts/IBMPlexMono-Bold.ttf"),
    "IBMPlexMono-BoldItalic": require("../assets/fonts/IBMPlexMono-BoldItalic.ttf"),
    "IBMPlexMono-Italic": require("../assets/fonts/IBMPlexMono-Italic.ttf"),
    "IBMPlexMono-Regular": require("../assets/fonts/IBMPlexMono-Regular.ttf"),
    "Inconsolata-Bold": require("../assets/fonts/Inconsolata-Bold.ttf"),
    "Inconsolata-Regular": require("../assets/fonts/Inconsolata-Regular.ttf"),
    "Lato-Bold": require("../assets/fonts/Lato-Bold.ttf"),
    "Lato-BoldItalic": require("../assets/fonts/Lato-BoldItalic.ttf"),
    "Lato-Italic": require("../assets/fonts/Lato-Italic.ttf"),
    "Lato-Regular": require("../assets/fonts/Lato-Regular.ttf"),
    "Montserrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf"),
    "Montserrat-BoldItalic": require("../assets/fonts/Montserrat-BoldItalic.ttf"),
    "Montserrat-Italic": require("../assets/fonts/Montserrat-Italic.ttf"),
    "Montserrat-Regular": require("../assets/fonts/Montserrat-Regular.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-BoldItalic": require("../assets/fonts/Poppins-BoldItalic.ttf"),
    "Poppins-Italic": require("../assets/fonts/Poppins-Italic.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "PublicSans-Bold": require("../assets/fonts/PublicSans-Bold.ttf"),
    "PublicSans-BoldItalic": require("../assets/fonts/PublicSans-BoldItalic.ttf"),
    "PublicSans-Italic": require("../assets/fonts/PublicSans-Italic.ttf"),
    "PublicSans-Regular": require("../assets/fonts/PublicSans-Regular.ttf"),
    "Raleway-Bold": require("../assets/fonts/Raleway-Bold.ttf"),
    "Raleway-BoldItalic": require("../assets/fonts/Raleway-BoldItalic.ttf"),
    "Raleway-Italic": require("../assets/fonts/Raleway-Italic.ttf"),
    "Raleway-Regular": require("../assets/fonts/Raleway-Regular.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <PostCacheProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <KeyboardProvider>
                  <RootLayoutNav />
                </KeyboardProvider>
              </GestureHandlerRootView>
            </PostCacheProvider>
          </AppProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
