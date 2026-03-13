import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = {
  text_render: string;
};

export function NoResultView({ text_render }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text_render}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  text: {
    fontSize: 15,
    color: "#888",
    textAlign: "center",
    fontFamily: "Poppins-Regular",
  },
});
