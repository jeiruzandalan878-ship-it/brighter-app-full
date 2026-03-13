import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LoadingView } from "@/components/shared/LoadingView";
import { EndLoadingView } from "@/components/shared/EndLoadingView";
import { NoResultView } from "@/components/shared/NoResultView";
import { UserToFollowOrUnfollow } from "@/components/users/UserToFollowOrUnfollow";
import { rpc_functions_fetch } from "@/lib/supabase";

type UserFollowed = { username: string; user_id: string; following_user_id?: string };

export default function UserFollowingDashboard() {
  const insets = useSafeAreaInsets();
  const [user_list, setUserList] = useState<UserFollowed[]>([]);
  const [page, setPage] = useState(1);
  const [is_failed, setIsFailed] = useState(false);
  const [end_is_failed, setEndIsFailed] = useState(false);
  const [disableMore, setDisableMore] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const fetching = useRef(false);

  const fetchData = useCallback(async (action: string, p: number) => {
    if (fetching.current) return;
    fetching.current = true;
    try {
      const result = await rpc_functions_fetch("user_following_function", { p_limit: 15, p_offset: p }, p);
      if (!result || result.length === 0) {
        if (p === 1) setNoResults(true);
        setDisableMore(true);
        if (action === "end_loading") setEndIsFailed(false);
        else setIsFailed(false);
      } else {
        setUserList((prev) => [...prev, ...result]);
        setPage(p + 1);
        if (action === "end_loading") setEndIsFailed(false);
        else setIsFailed(false);
      }
    } catch {
      if (p === 1) setIsFailed(true);
      if (action === "end_loading") setEndIsFailed(true);
    } finally {
      fetching.current = false;
    }
  }, []);

  useEffect(() => {
    fetchData("loading", 1);
  }, []);

  const retry_function = (action: string) => {
    if (action === "end_loading") {
      setEndIsFailed(false);
      fetchData("end_loading", page);
    } else {
      setIsFailed(false);
      fetchData("loading", 1);
    }
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.root, { paddingTop: topPad, paddingBottom: bottomPad }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Following</Text>
      </View>

      {user_list.length === 0 && noResults ? (
        <NoResultView text_render="No Users Being Followed Yet" />
      ) : user_list.length === 0 ? (
        <LoadingView retry_function={() => retry_function("loading")} is_failed={is_failed} />
      ) : (
        <FlatList
          data={user_list}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => (
            <UserToFollowOrUnfollow user_list={[item]} action="unfollow" />
          )}
          onEndReached={() => { if (!disableMore) fetchData("end_loading", page); }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            disableMore ? null : (
              <EndLoadingView retry_function={() => retry_function("end_loading")} is_failed={end_is_failed} />
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
});
