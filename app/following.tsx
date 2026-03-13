import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NavigationSection } from "@/components/shared/NavigationSection";
import { UpperBar } from "@/components/shared/UpperBar";
import { LoadingView } from "@/components/shared/LoadingView";
import { EndLoadingView } from "@/components/shared/EndLoadingView";
import { NoResultView } from "@/components/shared/NoResultView";
import { PostView } from "@/components/posts/PostView";
import { PostData } from "@/components/posts/PostDescription";
import { rpc_functions_fetch } from "@/lib/supabase";

export default function FollowingPage() {
  const insets = useSafeAreaInsets();
  const [posts_data, setPostsData] = useState<PostData[]>([]);
  const [page, setPage] = useState(1);
  const [is_failed, setIsFailed] = useState(false);
  const [end_is_failed, setEndIsFailed] = useState(false);
  const [disableMore, setDisableMore] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const fetching = useRef(false);
  const lastScrollY = useRef(0);

  const fetchData = useCallback(async (action: string, p: number) => {
    if (fetching.current) return;
    fetching.current = true;
    try {
      const result = await rpc_functions_fetch(
        "user_following_post",
        { p_offset: p },
        p
      );
      if (!result || result.length === 0) {
        if (p === 1) setNoResults(true);
        setDisableMore(true);
        if (action === "end_loading") setEndIsFailed(false);
        else setIsFailed(false);
      } else {
        setPostsData((prev) => [...prev, ...result]);
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
    if (posts_data.length === 0) {
      fetchData("loading", 1);
    }
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

  const handleScroll = (e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10) setHeaderVisible(false);
    else if (y < lastScrollY.current - 10) setHeaderVisible(true);
    lastScrollY.current = y;
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (posts_data.length === 0 && !noResults) {
    return (
      <View style={[styles.root, { paddingTop: topPad, paddingBottom: bottomPad }]}>
        <UpperBar />
        <LoadingView
          retry_function={() => retry_function("loading")}
          is_failed={is_failed}
        />
        <NavigationSection />
      </View>
    );
  }

  if (noResults) {
    return (
      <View style={[styles.root, { paddingTop: topPad, paddingBottom: bottomPad }]}>
        <UpperBar />
        <NoResultView text_render="Find Users To Follow" />
        <NavigationSection />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: topPad, paddingBottom: bottomPad }]}>
      {headerVisible && <UpperBar />}
      <FlatList
        data={posts_data}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <PostView posts_data={[item]} action={null} />
        )}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onEndReached={() => {
          if (!disableMore) fetchData("end_loading", page);
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          disableMore ? null : (
            <EndLoadingView
              retry_function={() => retry_function("end_loading")}
              is_failed={end_is_failed}
            />
          )
        }
      />
      {headerVisible && <NavigationSection />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
