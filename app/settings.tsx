import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { useAppContext } from "@/context/AppContext";

type SettingRow = {
  icon: string;
  label: string;
  description?: string;
  chevron?: boolean;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (v: boolean) => void;
  onPress?: () => void;
};

function SettingRowView({ item }: { item: SettingRow }) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={item.onPress}
      disabled={!item.onPress && !item.toggle}
    >
      <View style={styles.rowLeft}>
        <View style={styles.iconBox}>
          <Ionicons name={item.icon as any} size={18} color="#555" />
        </View>
        <View>
          <Text style={styles.rowLabel}>{item.label}</Text>
          {item.description && (
            <Text style={styles.rowDesc}>{item.description}</Text>
          )}
        </View>
      </View>
      {item.toggle ? (
        <Switch
          value={item.toggleValue}
          onValueChange={item.onToggle}
          trackColor={{ false: "#ccc", true: "#1a1a1a" }}
        />
      ) : item.chevron ? (
        <Ionicons name="chevron-forward" size={16} color="#ccc" />
      ) : null}
    </TouchableOpacity>
  );
}

export default function SettingsDashboard() {
  const insets = useSafeAreaInsets();
  const { clearUserData } = useAppContext();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleLogOut = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          setLoggingOut(true);
          await supabase.auth.signOut();
          clearUserData();
          setLoggingOut(false);
          router.replace("/sign-in");
        },
      },
    ]);
  };

  const sections = [
    {
      title: "Preferences",
      items: [
        {
          icon: "moon-outline",
          label: "Dark Mode",
          toggle: true,
          toggleValue: darkMode,
          onToggle: setDarkMode,
        },
        {
          icon: "notifications-outline",
          label: "Notifications",
          description: "Receive updates and alerts",
          toggle: true,
          toggleValue: notifications,
          onToggle: setNotifications,
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          icon: "lock-closed-outline",
          label: "Privacy",
          description: "Control your data and privacy",
          chevron: true,
          onPress: () => Alert.alert("Privacy", "Your data is kept secure."),
        },
        {
          icon: "shield-outline",
          label: "Security",
          chevron: true,
          onPress: () => Alert.alert("Security", "Enable 2FA for extra security."),
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          icon: "help-circle-outline",
          label: "Help Center",
          chevron: true,
          onPress: () => Alert.alert("Help Center", "Visit our help center for support."),
        },
        {
          icon: "document-text-outline",
          label: "Terms of Service",
          chevron: true,
          onPress: () => Alert.alert("Terms", "By using Brighter, you agree to our terms."),
        },
        {
          icon: "eye-outline",
          label: "Privacy Policy",
          chevron: true,
          onPress: () => Alert.alert("Privacy Policy", "We respect your privacy and data."),
        },
        {
          icon: "information-circle-outline",
          label: "About",
          description: "Version 1.0.0",
          chevron: true,
          onPress: () => Alert.alert("About", "Brighter — Your reading platform."),
        },
      ],
    },
  ];

  return (
    <View style={[styles.root, { paddingTop: topPad, paddingBottom: bottomPad }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {loggingOut ? (
        <View style={styles.logoutLoading}>
          <ActivityIndicator size="large" color="#555" />
        </View>
      ) : (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {sections.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionCard}>
                {section.items.map((item, i) => (
                  <View key={item.label}>
                    <SettingRowView item={item as SettingRow} />
                    {i < section.items.length - 1 && <View style={styles.separator} />}
                  </View>
                ))}
              </View>
            </View>
          ))}

          <View style={styles.logoutSection}>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogOut}>
              <Ionicons name="log-out-outline" size={18} color="#e74c3c" />
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8f8f8" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontFamily: "Poppins-Bold", color: "#1a1a1a" },
  scroll: { flex: 1 },
  logoutLoading: { flex: 1, alignItems: "center", justifyContent: "center" },
  section: { marginTop: 20, paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Poppins-Bold",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { fontSize: 14, fontFamily: "Poppins-Regular", color: "#1a1a1a" },
  rowDesc: { fontSize: 11, fontFamily: "Poppins-Regular", color: "#aaa" },
  separator: { height: 1, backgroundColor: "#f5f5f5", marginLeft: 58 },
  logoutSection: { paddingHorizontal: 16, marginTop: 20 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  logoutText: { fontSize: 15, fontFamily: "Poppins-Bold", color: "#e74c3c" },
});
