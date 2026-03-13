import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase, rpc_functions_fetch, fetch_image } from "@/lib/supabase";
import { LoadingView } from "@/components/shared/LoadingView";
import { EndLoadingView } from "@/components/shared/EndLoadingView";
import { NoResultView } from "@/components/shared/NoResultView";
import { PostView } from "@/components/posts/PostView";
import { PostData } from "@/components/posts/PostDescription";

type PublicUserData = {
  user_id: string;
  username: string;
  gmail: string;
  profile_picture: string | null;
  about: string | null;
  is_following: boolean;
  [key: string]: unknown;
};

export default function UserDashboard() {
  const insets = useSafeAreaInsets();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [public_user_data, setPublicUserData] = useState<PublicUserData | null>(null);
  const [is_failed, setIsFailed] = useState(false);
  const [user_posts, setUserPosts] = useState<PostData[]>([]);
  const [page, setPage] = useState(1);
  const [is_failed_post, setIsFailedPost] = useState(false);
  const [end_is_failed, setEndIsFailed] = useState(false);
  const [disableMore, setDisableMore] = useState(false);
  const [noPostResults, setNoPostResults] = useState(false);
  const [following, setFollowing] = useState(false);
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const fetching = useRef(false);
  const postFetching = useRef(false);

  const loadUserData = async () => {
    try {
      const result = await rpc_functions_fetch(
        "public_user_data_function",
        { p_user_id: userId },
        null
      );
      if (result) {
        setPublicUserData(result);
        setFollowing(!!result.is_following);
        if (result.profile_picture) {
          fetch_image(result.profile_picture).then(setProfileImageUri);
        }
      }
    } catch {
      setIsFailed(true);
    }
  };

  const fetchPosts = useCallback(async (action: string, p: number) => {
    if (postFetching.current) return;
    postFetching.current = true;
    try {
      const result = await rpc_functions_fetch(
        "user_posts_function",
        { target_user: userId, page: p },
        p
      );
      if (!result || result.length === 0) {
        if (p === 1) setNoPostResults(true);
        setDisableMore(true);
        if (action === "end_loading") setEndIsFailed(false);
        else setIsFailedPost(false);
      } else {
        setUserPosts((prev) => [...prev, ...result]);
        setPage(p + 1);
        if (action === "end_loading") setEndIsFailed(false);
        else setIsFailedPost(false);
      }
    } catch {
      if (p === 1) setIsFailedPost(true);
      if (action === "end_loading") setEndIsFailed(true);
    } finally {
      postFetching.current = false;
    }
  }, [userId]);

  useEffect(() => {
    loadUserData();
    fetchPosts("loading", 1);
  }, [userId]);

  const handleFollowToggle = async () => {
    const newAction = following ? "unfollow" : "follow";
    setFollowing(!following);
    await supabase.rpc("follow_unfollow_function", {
      p_target_user_id: userId,
      p_action: newAction,
    });
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const ListHeader = () => {
    if (!public_user_data) {
      return (
        <LoadingView retry_function={loadUserData} is_failed={is_failed} />
      );
    }
    return (
      <View style={styles.profileSection}>
        {profileImageUri ? (
          <Image source={{ uri: profileImageUri }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Ionicons name="person" size={32} color="#888" />
          </View>
        )}
        <Text style={styles.username}>{public_user_data.username}</Text>
        <Text style={styles.email}>{String(public_user_data.gmail ?? "")}</Text>
        {public_user_data.about && (
          <Text style={styles.about}>{String(public_user_data.about)}</Text>
        )}
        <TouchableOpacity
          style={[styles.followBtn, following && styles.unfollowBtn]}
          onPress={handleFollowToggle}
        >
          <Text style={[styles.followBtnText, following && styles.unfollowBtnText]}>
            {following ? "Unfollow" : "Follow"}
          </Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <Text style={styles.postsLabel}>Posts</Text>
      </View>
    );
  };

  return (
    <View style={[styles.root, { paddingTop: topPad, paddingBottom: bottomPad }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {public_user_data?.username ?? "Profile"}
        </Text>
      </View>

      {noPostResults && user_posts.length === 0 ? (
        <>
          <ListHeader />
          <NoResultView text_render="User Has No Post Yet" />
        </>
      ) : user_posts.length === 0 ? (
        <>
          <ListHeader />
          <LoadingView
            retry_function={() => fetchPosts("loading", 1)}
            is_failed={is_failed_post}
          />
        </>
      ) : (
        <FlatList
          data={user_posts}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={<ListHeader />}
          renderItem={({ item }) => <PostView posts_data={[item]} action={null} />}
          onEndReached={() => { if (!disableMore) fetchPosts("end_loading", page); }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            disableMore ? null : (
              <EndLoadingView
                retry_function={() => {
                  setEndIsFailed(false);
                  fetchPosts("end_loading", page);
                }}
                is_failed={end_is_failed}
              />
            )
          }
        />
      )}
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
  headerTitle: { fontSize: 18, fontFamily: "Poppins-Bold", color: "#1a1a1a" },
  profileSection: { alignItems: "center", paddingVertical: 24, paddingHorizontal: 16 },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 10 },
  avatarPlaceholder: { backgroundColor: "#eee", alignItems: "center", justifyContent: "center" },
  username: { fontSize: 18, fontFamily: "Poppins-Bold", color: "#1a1a1a", marginBottom: 2 },
  email: { fontSize: 13, fontFamily: "Poppins-Regular", color: "#888", marginBottom: 6 },
  about: { fontSize: 13, fontFamily: "Poppins-Regular", color: "#555", textAlign: "center", paddingHorizontal: 20, marginBottom: 12 },
  followBtn: {
    paddingHorizontal: 28,
    paddingVertical: 8,
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    marginTop: 8,
  },
  followBtnText: { color: "#fff", fontFamily: "Poppins-Bold", fontSize: 14 },
  unfollowBtn: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#1a1a1a" },
  unfollowBtnText: { color: "#1a1a1a" },
  divider: { height: 1, width: "100%", backgroundColor: "#f0f0f0", marginVertical: 16 },
  postsLabel: { fontSize: 14, fontFamily: "Poppins-Bold", color: "#555", alignSelf: "flex-start" },
});
