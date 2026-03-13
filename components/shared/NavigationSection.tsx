import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type NavItem = {
  icon: string;
  iconFocused: string;
  label: string;
  path: string;
};

const NAV_ITEMS: NavItem[] = [
  { icon: "home-outline", iconFocused: "home", label: "Home", path: "/home" },
  { icon: "search-outline", iconFocused: "search", label: "Search", path: "/search" },
  { icon: "people-outline", iconFocused: "people", label: "Following", path: "/following" },
  { icon: "add-circle-outline", iconFocused: "add-circle", label: "Create", path: "/add-post" },
  { icon: "person-outline", iconFocused: "person", label: "Profile", path: "/profile" },
];

type Props = {
  onHomeRepress?: () => void;
};

export function NavigationSection({ onHomeRepress }: Props) {
  const pathname = usePathname();

  const handlePress = (item: NavItem) => {
    if (pathname === item.path) {
      if (item.path === "/home" && onHomeRepress) {
        onHomeRepress();
      }
      return;
    }
    router.push(item.path as Parameters<typeof router.push>[0]);
  };

  return (
    <View style={styles.container}>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.path;
        return (
          <TouchableOpacity
            key={item.path}
            style={styles.item}
            onPress={() => handlePress(item)}
          >
            <Ionicons
              name={(isActive ? item.iconFocused : item.icon) as Parameters<typeof Ionicons>[0]["name"]}
              size={22}
              color={isActive ? "#1a1a1a" : "#888"}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingBottom: 8,
    paddingTop: 6,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingVertical: 4,
  },
  label: {
    fontSize: 10,
    color: "#888",
    fontFamily: "Poppins-Regular",
  },
  labelActive: {
    color: "#1a1a1a",
    fontFamily: "Poppins-Bold",
  },
});
