import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
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
import { NavigationSection } from "@/components/shared/NavigationSection";
import { UpperBar } from "@/components/shared/UpperBar";
import { supabase } from "@/lib/supabase";

const BLOG_FORMATS = ["standard", "minimal", "editorial", "card"];

export default function AddPostPage() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [body, setBody] = useState("");
  const [blogFormat, setBlogFormat] = useState("standard");
  const [coverImageUri, setCoverImageUri] = useState<string | null>(null);
  const [coverImageName, setCoverImageName] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission Needed", "Please allow access to your photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [16, 9],
    });
    if (!result.canceled && result.assets[0]) {
      setCoverImageUri(result.assets[0].uri);
      const ext = result.assets[0].uri.split(".").pop() ?? "jpg";
      setCoverImageName(`cover_${Date.now()}.${ext}`);
    }
  };

  const uploadCoverImage = async (): Promise<string | null> => {
    if (!coverImageUri || !coverImageName) return null;
    try {
      const response = await fetch(coverImageUri);
      const blob = await response.blob();
      const { error } = await supabase.storage
        .from("post_images")
        .upload(`images/${coverImageName}`, blob, {
          contentType: blob.type || "image/jpeg",
          upsert: true,
        });
      if (error) return null;
      return coverImageName;
    } catch {
      return null;
    }
  };

  const buildContent = (bodyText: string): Record<string, unknown> => {
    return {
      background1: {
        background_view_style: {
          padding: 16,
          backgroundColor: "#fff",
        },
        content1: {
          text: bodyText,
          text_style: {
            fontSize: 16,
            fontFamily: "Poppins-Regular",
            color: "#1a1a1a",
            lineHeight: 26,
          },
          view_style: {},
        },
      },
    };
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      Alert.alert("Required", "Please enter a title.");
      return;
    }
    if (!body.trim()) {
      Alert.alert("Required", "Please write some content.");
      return;
    }
    setSaving(true);
    try {
      const uploadedImage = await uploadCoverImage();
      const parsedTags = tags
        ? tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];
      const content = buildContent(body);

      const { error } = await supabase.rpc("insert_post_function", {
        p_id: null,
        p_tags: parsedTags,
        p_blog_format: blogFormat,
        p_title: title.trim(),
        p_cover_image: uploadedImage ?? "",
        p_content: content,
        p_action: "insert",
      });

      if (error) throw error;
      Alert.alert("Published!", "Your post has been published.", [
        { text: "OK", onPress: () => router.replace("/home") },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Failed to publish post.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: topPad, paddingBottom: bottomPad }]}>
      <UpperBar />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Create a Post</Text>

          <TouchableOpacity style={styles.coverPicker} onPress={pickImage}>
            {coverImageUri ? (
              <Image source={{ uri: coverImageUri }} style={styles.coverPreview} />
            ) : (
              <View style={styles.coverPlaceholder}>
                <Ionicons name="image-outline" size={36} color="#aaa" />
                <Text style={styles.coverPlaceholderText}>Add Cover Image</Text>
              </View>
            )}
          </TouchableOpacity>

          {coverImageUri && (
            <TouchableOpacity
              onPress={() => { setCoverImageUri(null); setCoverImageName(null); }}
              style={styles.removeImageBtn}
            >
              <Ionicons name="close-circle" size={18} color="#e74c3c" />
              <Text style={styles.removeImageText}>Remove Image</Text>
            </TouchableOpacity>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter post title..."
              placeholderTextColor="#bbb"
              maxLength={120}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Content *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={body}
              onChangeText={setBody}
              placeholder="Write your post content here..."
              placeholderTextColor="#bbb"
              multiline
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tags</Text>
            <TextInput
              style={styles.input}
              value={tags}
              onChangeText={setTags}
              placeholder="technology, lifestyle, travel"
              placeholderTextColor="#bbb"
            />
            <Text style={styles.hint}>Separate tags with commas</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Blog Format</Text>
            <View style={styles.formatRow}>
              {BLOG_FORMATS.map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.formatBtn, blogFormat === f && styles.formatBtnActive]}
                  onPress={() => setBlogFormat(f)}
                >
                  <Text style={[styles.formatBtnText, blogFormat === f && styles.formatBtnTextActive]}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.publishBtn, saving && styles.publishBtnDisabled]}
            onPress={handlePublish}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="send-outline" size={18} color="#fff" />
                <Text style={styles.publishBtnText}>Publish Post</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
      <NavigationSection />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  scroll: { flex: 1 },
  form: { padding: 16, gap: 16 },
  sectionTitle: {
    fontSize: 22,
    fontFamily: "CormorantGaramond-Bold",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  coverPicker: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
  },
  coverPreview: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  coverPlaceholder: {
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fafafa",
  },
  coverPlaceholderText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#aaa",
  },
  removeImageBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    marginTop: -8,
  },
  removeImageText: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "#e74c3c",
  },
  inputGroup: { gap: 6 },
  label: {
    fontSize: 13,
    fontFamily: "Poppins-Bold",
    color: "#333",
  },
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
  textArea: {
    height: 180,
    paddingTop: 12,
  },
  hint: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: "#bbb",
  },
  formatRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  formatBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fafafa",
  },
  formatBtnActive: {
    backgroundColor: "#1a1a1a",
    borderColor: "#1a1a1a",
  },
  formatBtnText: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "#888",
  },
  formatBtnTextActive: {
    color: "#fff",
    fontFamily: "Poppins-Bold",
  },
  publishBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    marginTop: 8,
  },
  publishBtnDisabled: {
    backgroundColor: "#888",
  },
  publishBtnText: {
    fontSize: 15,
    fontFamily: "Poppins-Bold",
    color: "#fff",
  },
});
