import React from "react";
import { View, Text, StyleSheet } from "react-native";

export function UpperBar() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Brighter</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 22,
    fontFamily: "CormorantGaramond-Bold",
    color: "#1a1a1a",
    letterSpacing: 0.5,
  },
});
