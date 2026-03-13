import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      if (data.session) {
        router.replace("/home");
      }
    } catch (e: any) {
      setError(e.message ?? "Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + 40,
            paddingBottom: insets.bottom + 24,
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>Brighter</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="you@example.com"
              placeholderTextColor="#aaa"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor="#aaa"
              autoComplete="password"
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.signInBtn, loading && styles.signInBtnDisabled]}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signInBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "center",
  },
  header: {
    marginBottom: 48,
  },
  logo: {
    fontSize: 40,
    fontFamily: "CormorantGaramond-Bold",
    color: "#1a1a1a",
    letterSpacing: 1,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    color: "#888",
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontFamily: "Poppins-Bold",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    color: "#1a1a1a",
    backgroundColor: "#fafafa",
  },
  errorText: {
    color: "#e74c3c",
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    textAlign: "center",
  },
  signInBtn: {
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  signInBtnDisabled: {
    opacity: 0.6,
  },
  signInBtnText: {
    color: "#fff",
    fontFamily: "Poppins-Bold",
    fontSize: 16,
  },
});
