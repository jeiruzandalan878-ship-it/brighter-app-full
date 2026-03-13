import { router } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { supabase } from "@/lib/supabase";

export default function SplashScreen() {
  useEffect(() => {
    const check = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
          router.replace("/sign-in");
        } else {
          router.replace("/home");
        }
      } catch {
        router.replace("/sign-in");
      }
    };
    check();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Brighter</Text>
      <ActivityIndicator color="#555" style={{ marginTop: 24 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    fontSize: 48,
    fontFamily: "CormorantGaramond-Bold",
    color: "#1a1a1a",
    letterSpacing: 2,
  },
});
