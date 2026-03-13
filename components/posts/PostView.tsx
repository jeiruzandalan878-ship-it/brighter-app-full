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
import { supabase, fetch_image } from "@/lib/supabase";
import { PostData } from "@/components/posts/PostDescription";
import { usePostCache } from "@/context/PostCacheContext";

type Props = {
  post_data: PostData;
  action: string | null;
  onDeleteSuccess?: () => void;
};

function PostCard({ post_data, action, onDeleteSuccess }: Props) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post_data.likes);
  const [saved, setSaved] = useState(false);
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const { setPost } = usePostCache();

  useEffect(() => {
    if (post_data.cover_image) {
      fetch_image(post_data.cover_image).then(setCoverUri);
    }
    if (post_data.profile_picture) {
      fetch_image(post_data.profile_picture).then(setAvatarUri);
    }
  }, [post_data.cover_image, post_data.profile_picture]);

  const handleLike = async () => {
    if (liked) {
      setLiked(false);
      setLikesCount((c) => c - 1);
      await supabase.rpc("like_and_remove_like_function", {
        p_post_id: post_data.id,
        p_action: "remove",
      });
    } else {
      setLiked(true);
      setLikesCount((c) => c + 1);
      await supabase.rpc("like_and_remove_like_function", {
        p_post_id: post_data.id,
        p_action: "like",
      });
    }
  };

  const handleSave = async () => {
    if (saved) {
      setSaved(false);
      await supabase.rpc("save_unsave_post_function", {
        p_post_id: post_data.id,
        p_action: "unsave",
      });
    } else {
      setSaved(true);
      await supabase.rpc("save_unsave_post_function", {
        p_post_id: post_data.id,
        p_action: "save",
      });
    }
  };

  const navigateToUser = () => {
    router.push({ pathname: "/user/[userId]", params: { userId: post_data.user_id } });
  };

  const navigateToPost = () => {
    setPost(String(post_data.id), post_data);
    router.push({
      pathname: "/post/[postId]",
      params: { postId: String(post_data.id), action: action ?? "post_view" },
    });
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

  const handleDelete = () => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await supabase.rpc("delete_post_function", {
            p_post_id: post_data.id,
          });
          onDeleteSuccess?.();
        },
      },
    ]);
  };

  return (
    <View style={styles.card}>
      {coverUri && (
        <TouchableOpacity onPress={navigateToPost}>
          <Image source={{ uri: coverUri }} style={styles.coverImage} />
        </TouchableOpacity>
      )}

      <View style={styles.content}>
        <TouchableOpacity onPress={navigateToUser} style={styles.authorRow}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={14} color="#888" />
            </View>
          )}
          <Text style={styles.username} onPress={navigateToUser}>
            {post_data.username}
          </Text>
          <Text style={styles.date}>{formatDate(post_data.date)}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={navigateToPost}>
          <Text style={styles.title} numberOfLines={2}>
            {post_data.title}
          </Text>
        </TouchableOpacity>

        {post_data.tags && post_data.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {post_data.tags.slice(0, 3).map((tag, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionItem} onPress={handleLike}>
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={18}
              color={liked ? "#e74c3c" : "#888"}
            />
            <Text style={styles.actionCount}>{likesCount}</Text>
          </TouchableOpacity>

          <View style={styles.actionItem}>
            <Ionicons name="eye-outline" size={18} color="#888" />
            <Text style={styles.actionCount}>{post_data.views}</Text>
          </View>

          <TouchableOpacity style={styles.actionItem} onPress={handleSave}>
            <Ionicons
              name={saved ? "bookmark" : "bookmark-outline"}
              size={18}
              color={saved ? "#2980b9" : "#888"}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.exploreBtn} onPress={navigateToPost}>
            <Text style={styles.exploreBtnText}>Explore</Text>
          </TouchableOpacity>
        </View>

        {action === "delete" && (
          <View style={styles.deleteRow}>
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => {
                setPost(String(post_data.id), post_data);
                router.push({
                  pathname: "/edit-post/[postId]",
                  params: { postId: String(post_data.id) },
                });
              }}
            >
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}

        {action === "unsave" && (
          <TouchableOpacity
            style={styles.unsaveBtn}
            onPress={async () => {
              await supabase.rpc("save_unsave_post_function", {
                p_post_id: post_data.id,
                p_action: "unsave",
              });
              onDeleteSuccess?.();
            }}
          >
            <Text style={styles.unsaveBtnText}>Unsave</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

type PostViewProps = {
  posts_data: PostData[];
  action: string | null;
  onDeleteSuccess?: (id: number) => void;
};

export function PostView({ posts_data, action, onDeleteSuccess }: PostViewProps) {
  return (
    <>
      {posts_data.map((post_data) => (
        <PostCard
          key={post_data.id}
          post_data={post_data}
          action={action}
          onDeleteSuccess={() => onDeleteSuccess?.(post_data.id)}
        />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  coverImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#eee",
  },
  content: {
    padding: 14,
    gap: 8,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
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
    flex: 1,
  },
  date: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: "#aaa",
  },
  title: {
    fontSize: 16,
    fontFamily: "CormorantGaramond-Bold",
    color: "#1a1a1a",
    lineHeight: 22,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: "#666",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionCount: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#888",
  },
  exploreBtn: {
    marginLeft: "auto",
    paddingHorizontal: 14,
    paddingVertical: 5,
    backgroundColor: "#1a1a1a",
    borderRadius: 6,
  },
  exploreBtnText: {
    color: "#fff",
    fontFamily: "Poppins-Bold",
    fontSize: 12,
  },
  deleteRow: {
    flexDirection: "row",
    gap: 8,
  },
  deleteBtn: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    backgroundColor: "#e74c3c",
    borderRadius: 6,
  },
  deleteBtnText: {
    color: "#fff",
    fontFamily: "Poppins-Bold",
    fontSize: 12,
  },
  editBtn: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    backgroundColor: "#2980b9",
    borderRadius: 6,
  },
  editBtnText: {
    color: "#fff",
    fontFamily: "Poppins-Bold",
    fontSize: 12,
  },
  unsaveBtn: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    backgroundColor: "#888",
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  unsaveBtnText: {
    color: "#fff",
    fontFamily: "Poppins-Bold",
    fontSize: 12,
  },
});
