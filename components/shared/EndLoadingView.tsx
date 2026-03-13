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

export function EndLoadingView({ retry_function, is_failed, is_offline }: Props) {
  if (is_offline) {
    return (
      <TouchableOpacity style={styles.container} onPress={retry_function}>
        <Text style={styles.offlineText}>Offline, Please Retry</Text>
      </TouchableOpacity>
    );
  }

  if (is_failed) {
    return (
      <TouchableOpacity style={styles.container} onPress={retry_function}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color="#555" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  retryText: {
    fontSize: 14,
    color: "#555",
    fontFamily: "Poppins-Bold",
    textDecorationLine: "underline",
  },
  offlineText: {
    fontSize: 14,
    color: "#c0392b",
    fontFamily: "Poppins-Regular",
    textDecorationLine: "underline",
  },
});
