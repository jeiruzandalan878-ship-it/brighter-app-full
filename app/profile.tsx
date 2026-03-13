import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NavigationSection } from "@/components/shared/NavigationSection";
import { UpperBar } from "@/components/shared/UpperBar";
import { LoadingView } from "@/components/shared/LoadingView";
import { rpc_functions_fetch, fetch_image } from "@/lib/supabase";
import { useAppContext } from "@/context/AppContext";

const MENU_ITEMS = [
  { label: "History", icon: "time-outline" as const, path: "/history" },
  { label: "Posts", icon: "document-text-outline" as const, path: "posts" },
  { label: "Saved Posts", icon: "bookmark-outline" as const, path: "/saved-posts" },
  { label: "User Following", icon: "people-outline" as const, path: "/user-following" },
  { label: "Edit Profile", icon: "create-outline" as const, path: "edit-profile" },
  { label: "Add Post", icon: "add-circle-outline" as const, path: "/add-post" },
  { label: "Settings", icon: "settings-outline" as const, path: "/settings" },
];

export default function ProfileDashboard() {
  const insets = useSafeAreaInsets();
  const { userData, setUserData } = useAppContext();
  const [is_failed, setIsFailed] = useState(false);
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);

  useEffect(() => {
    if (!userData) {
      loadUserData();
    } else if (userData.profile_picture) {
      fetch_image(userData.profile_picture).then(setProfileImageUri);
    }
  }, [userData]);

  const loadUserData = async () => {
    try {
      const result = await rpc_functions_fetch(
        "private_user_data_function",
        null,
        null
      );
      if (result) {
        setUserData(result);
        if (result.profile_picture) {
          fetch_image(result.profile_picture).then(setProfileImageUri);
        }
      }
    } catch {
      setIsFailed(true);
    }
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (!userData) {
    return (
      <View style={[styles.root, { paddingTop: topPad, paddingBottom: bottomPad }]}>
        <UpperBar />
        <LoadingView
          retry_function={loadUserData}
          is_failed={is_failed}
        />
        <NavigationSection />
      </View>
    );
  }

  const handleMenuPress = (item: typeof MENU_ITEMS[0]) => {
    if (item.label === "Posts") {
      router.push({ pathname: "/user-posts", params: { userId: userData.user_id } });
    } else if (item.label === "Edit Profile") {
      router.push("/edit-profile");
    } else {
      router.push(item.path as Parameters<typeof router.push>[0]);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: topPad, paddingBottom: bottomPad }]}>
      <UpperBar />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          {profileImageUri ? (
            <Image source={{ uri: profileImageUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={40} color="#888" />
            </View>
          )}
          <Text style={styles.username}>{userData.username}</Text>
          <Text style={styles.email}>{userData.gmail}</Text>
          {userData.about && (
            <Text style={styles.about}>{userData.about}</Text>
          )}
        </View>

        <View style={styles.menuList}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              onPress={() => handleMenuPress(item)}
            >
              <View style={styles.menuLeft}>
                <Ionicons name={item.icon} size={20} color="#555" />
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <NavigationSection />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scroll: {
    flex: 1,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 12,
  },
  avatarPlaceholder: {
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },
  username: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  email: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "#888",
    marginBottom: 8,
  },
  about: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "#555",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  menuList: {
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuLabel: {
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    color: "#1a1a1a",
  },
});
