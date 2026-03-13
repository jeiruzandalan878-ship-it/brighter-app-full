import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { rpc_functions_fetch, fetch_image } from "@/lib/supabase";
import { useAppContext } from "@/context/AppContext";

export default function EditProfileDashboard() {
  const insets = useSafeAreaInsets();
  const { userData, setUserData } = useAppContext();
  const [username, setUsername] = useState(userData?.username ?? "");
  const [gender, setGender] = useState(userData?.gender ?? "");
  const [birthdate, setBirthdate] = useState(userData?.birthdate ?? "");
  const [about, setAbout] = useState(userData?.about ?? "");
  const [saving, setSaving] = useState(false);
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);

  useEffect(() => {
    if (userData?.profile_picture) {
      fetch_image(userData.profile_picture).then(setProfileImageUri);
    }
  }, [userData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await rpc_functions_fetch(
        "update_profile_function",
        {
          p_username: username || userData?.username || null,
          p_gender: gender || userData?.gender || null,
          p_birthdate: birthdate || userData?.birthdate || null,
          p_profile_picture: userData?.profile_picture ?? null,
          p_about: about || userData?.about || null,
        },
        null
      );
      if (result) {
        setUserData(result);
        Alert.alert("Success", "Profile updated successfully.");
        router.back();
      }
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const fields = [
    { label: "Username", value: username, onChange: setUsername, placeholder: userData?.username ?? "Username" },
    { label: "Gender", value: gender, onChange: setGender, placeholder: userData?.gender ?? "e.g., male, female" },
    { label: "Birthdate (YYYY-MM-DD)", value: birthdate, onChange: setBirthdate, placeholder: userData?.birthdate ?? "YYYY-MM-DD" },
    { label: "About", value: about, onChange: setAbout, placeholder: userData?.about ?? "Tell us about yourself", multiline: true },
  ];

  return (
    <View style={[styles.root, { paddingTop: topPad, paddingBottom: bottomPad }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#1a1a1a" />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          {profileImageUri ? (
            <Image source={{ uri: profileImageUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={40} color="#888" />
            </View>
          )}
          <Text style={styles.avatarNote}>Profile picture from account</Text>
        </View>

        <View style={styles.formSection}>
          {fields.map((f) => (
            <View key={f.label} style={styles.inputGroup}>
              <Text style={styles.label}>{f.label}</Text>
              <TextInput
                style={[styles.input, f.multiline && styles.inputMultiline]}
                value={f.value}
                onChangeText={f.onChange}
                placeholder={f.placeholder}
                placeholderTextColor="#aaa"
                multiline={f.multiline}
                numberOfLines={f.multiline ? 4 : 1}
              />
            </View>
          ))}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.input, styles.inputDisabled]}>
              <Text style={styles.inputDisabledText}>{userData?.gmail ?? ""}</Text>
            </View>
            <Text style={styles.emailNote}>Email cannot be changed here</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 18, fontFamily: "Poppins-Bold", color: "#1a1a1a", marginLeft: 12 },
  saveText: { fontSize: 15, fontFamily: "Poppins-Bold", color: "#1a1a1a" },
  scroll: { flex: 1 },
  avatarSection: { alignItems: "center", paddingVertical: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 8 },
  avatarPlaceholder: { backgroundColor: "#eee", alignItems: "center", justifyContent: "center" },
  avatarNote: { fontSize: 12, fontFamily: "Poppins-Regular", color: "#aaa" },
  formSection: { paddingHorizontal: 16, gap: 16 },
  inputGroup: { gap: 6 },
  label: { fontSize: 13, fontFamily: "Poppins-Bold", color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#1a1a1a",
    backgroundColor: "#fafafa",
  },
  inputMultiline: { height: 100, textAlignVertical: "top" },
  inputDisabled: {
    backgroundColor: "#f5f5f5",
    borderColor: "#eee",
    justifyContent: "center",
  },
  inputDisabledText: { fontSize: 14, fontFamily: "Poppins-Regular", color: "#aaa" },
  emailNote: { fontSize: 11, fontFamily: "Poppins-Regular", color: "#aaa" },
});
