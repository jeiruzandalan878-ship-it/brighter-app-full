import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { fetch_image } from "@/lib/supabase";

export type PostData = {
  id: number;
  username: string;
  user_id: string;
  tags: string[] | null;
  blog_format: string | null;
  views: number;
  date: string;
  title: string;
  cover_image: string | null;
  content: Record<string, unknown>;
  likes: number;
  profile_picture: string | null;
};

type Props = {
  post_data: PostData;
  action: string | null;
  onDeleteSuccess?: () => void;
};

export function PostDescription({ post_data, action, onDeleteSuccess }: Props) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post_data.likes);
  const [saved, setSaved] = useState(false);
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);

  useEffect(() => {
    if (post_data.profile_picture) {
      fetch_image(post_data.profile_picture).then(setProfileImageUri);
    }
  }, [post_data.profile_picture]);

  const delete_post = () => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await supabase.rpc("delete_post_function", { p_post_id: post_data.id });
          onDeleteSuccess?.();
        },
      },
    ]);
  };

  const edit_post = () => {};

  const save_post = async () => {
    await supabase.rpc("save_unsave_post_function", {
      p_post_id: post_data.id,
      p_action: "save",
    });
  };

  const unsave_post = async () => {
    await supabase.rpc("save_unsave_post_function", {
      p_post_id: post_data.id,
      p_action: "unsave",
    });
  };

  const like_post = async () => {
    await supabase.rpc("like_and_remove_like_function", {
      p_post_id: post_data.id,
      p_action: "like",
    });
  };

  const unlike_post = async () => {
    await supabase.rpc("like_and_remove_like_function", {
      p_post_id: post_data.id,
      p_action: "remove",
    });
  };

  const handleLike = () => {
    if (liked) {
      setLiked(false);
      setLikesCount((c) => c - 1);
      unlike_post();
    } else {
      setLiked(true);
      setLikesCount((c) => c + 1);
      like_post();
    }
  };

  const handleSave = () => {
    if (saved) {
      setSaved(false);
      unsave_post();
    } else {
      setSaved(true);
      save_post();
    }
  };

  const navigateToUser = () => {
    router.push({ pathname: "/user/[userId]", params: { userId: post_data.user_id } });
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={navigateToUser} style={styles.authorRow}>
          {profileImageUri ? (
            <Image source={{ uri: profileImageUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={16} color="#888" />
            </View>
          )}
          <View>
            <Text style={styles.username}>{post_data.username}</Text>
            <Text style={styles.title}>{post_data.title}</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.date}>{formatDate(post_data.date)}</Text>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionItem} onPress={handleLike}>
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={22}
            color={liked ? "#e74c3c" : "#555"}
          />
          <Text style={styles.actionCount}>{likesCount}</Text>
        </TouchableOpacity>

        <View style={styles.actionItem}>
          <Ionicons name="eye-outline" size={22} color="#555" />
          <Text style={styles.actionCount}>{post_data.views}</Text>
        </View>

        <TouchableOpacity style={styles.actionItem} onPress={handleSave}>
          <Ionicons
            name={saved ? "bookmark" : "bookmark-outline"}
            size={22}
            color={saved ? "#2980b9" : "#555"}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <Ionicons name="share-social-outline" size={22} color="#555" />
        </TouchableOpacity>
      </View>

      {action === "delete" && (
        <View style={styles.editActions}>
          <TouchableOpacity style={styles.deleteBtn} onPress={delete_post}>
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.editBtn} onPress={edit_post}>
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  header: {
    marginBottom: 8,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },
  username: {
    fontSize: 13,
    fontFamily: "Poppins-Bold",
    color: "#1a1a1a",
  },
  title: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#555",
  },
  date: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: "#aaa",
    marginLeft: 46,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
    marginTop: 4,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionCount: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#555",
  },
  editActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  deleteBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: "#e74c3c",
    borderRadius: 6,
  },
  deleteBtnText: {
    color: "#fff",
    fontFamily: "Poppins-Bold",
    fontSize: 12,
  },
  editBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: "#2980b9",
    borderRadius: 6,
  },
  editBtnText: {
    color: "#fff",
    fontFamily: "Poppins-Bold",
    fontSize: 12,
  },
});
