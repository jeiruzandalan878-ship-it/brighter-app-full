import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { DynamicContentView } from "@/components/posts/DynamicContentView";
import { RecommendationList } from "@/components/posts/RecommendationList";
import { LoadingView } from "@/components/shared/LoadingView";
import { usePostCache } from "@/context/PostCacheContext";

export default function PostContent() {
  const insets = useSafeAreaInsets();
  const { postId, action } = useLocalSearchParams<{ postId: string; action: string }>();
  const { getPost } = usePostCache();
  const post_data = getPost(postId);
  const viewTriggered = useRef(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (!post_data) {
    return (
      <View style={[styles.root, { paddingTop: topPad, paddingBottom: bottomPad }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post</Text>
        </View>
        <LoadingView retry_function={() => {}} is_failed={true} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: topPad, paddingBottom: bottomPad }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{post_data.title}</Text>
      </View>
      <ScrollView
        onScroll={(e) => {
          const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
          const y = contentOffset.y;
          const totalHeight = contentSize.height - layoutMeasurement.height;
          if (!viewTriggered.current && totalHeight > 0 && y / totalHeight >= 0.5) {
            viewTriggered.current = true;
            supabase.rpc("update_user_interest_from_view", {
              p_post_id: post_data.id,
              p_alpha: 0.2,
            });
          }
        }}
        scrollEventThrottle={16}
      >
        <DynamicContentView post_data={post_data} action={action === "post_view" ? "post_view" : (action ?? null)} />
        <RecommendationList post={post_data} />
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
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 16, fontFamily: "Poppins-Bold", color: "#1a1a1a" },
});
