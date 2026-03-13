import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { rpc_functions_fetch } from "@/lib/supabase";
import { usePostCache } from "@/context/PostCacheContext";

export default function EditPostPage() {
  const insets = useSafeAreaInsets();
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { getPost } = usePostCache();
  const post_data = getPost(postId);

  const [title, setTitle] = useState(post_data?.title ?? "");
  const [tags, setTags] = useState(post_data?.tags?.join(", ") ?? "");
  const [blogFormat, setBlogFormat] = useState(post_data?.blog_format ?? "");
  const [saving, setSaving] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleSave = async () => {
    if (!post_data) return;
    setSaving(true);
    try {
      await rpc_functions_fetch(
        "insert_post_function",
        {
          p_id: post_data.id,
          p_tags: tags ? tags.split(",").map((t) => t.trim()) : post_data.tags ?? [],
          p_blog_format: blogFormat || post_data.blog_format || "",
          p_title: title || post_data.title,
          p_cover_image: post_data.cover_image ?? "",
          p_content: post_data.content,
          p_action: "update",
        },
        null
      );
      Alert.alert("Success", "Post updated successfully.");
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Failed to update post.");
    } finally {
      setSaving(false);
    }
  };

  if (!post_data) {
    return (
      <View style={[styles.root, { paddingTop: topPad, paddingBottom: bottomPad }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Post</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.errorText}>Post not found.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: topPad, paddingBottom: bottomPad }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Post</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#1a1a1a" />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder={post_data.title}
              placeholderTextColor="#aaa"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tags (comma separated)</Text>
            <TextInput
              style={styles.input}
              value={tags}
              onChangeText={setTags}
              placeholder={post_data.tags?.join(", ") ?? "tag1, tag2"}
              placeholderTextColor="#aaa"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Blog Format</Text>
            <TextInput
              style={styles.input}
              value={blogFormat}
              onChangeText={setBlogFormat}
              placeholder={post_data.blog_format ?? ""}
              placeholderTextColor="#aaa"
            />
          </View>
          <Text style={styles.note}>
            Other fields (cover image, content) are preserved from the original post.
          </Text>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { fontFamily: "Poppins-Regular", fontSize: 14, color: "#888" },
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
  form: { padding: 16, gap: 16 },
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
  note: { fontSize: 12, fontFamily: "Poppins-Regular", color: "#aaa" },
});
