import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

type Props = {
  retry_function: () => void;
  is_failed: boolean;
  is_offline?: boolean;
};

export function LoadingView({ retry_function, is_failed, is_offline }: Props) {
  if (is_offline) {
    return (
      <View style={styles.container}>
        <Text style={styles.offlineText}>You're Offline</Text>
        <Text style={styles.subText}>Connect to internet to continue</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={retry_function}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (is_failed) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Oops, Something Went Wrong</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={retry_function}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#555" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    fontFamily: "Poppins-Regular",
  },
  offlineText: {
    fontSize: 18,
    color: "#333",
    fontFamily: "Poppins-Bold",
    textAlign: "center",
  },
  subText: {
    fontSize: 14,
    color: "#888",
    fontFamily: "Poppins-Regular",
    textAlign: "center",
  },
  retryBtn: {
    paddingHorizontal: 28,
    paddingVertical: 10,
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    marginTop: 8,
  },
  retryText: {
    color: "#fff",
    fontFamily: "Poppins-Bold",
    fontSize: 14,
  },
});
