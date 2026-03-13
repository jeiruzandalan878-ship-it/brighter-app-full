import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Network from "expo-network";
import { NavigationSection } from "@/components/shared/NavigationSection";
import { UpperBar } from "@/components/shared/UpperBar";
import { LoadingView } from "@/components/shared/LoadingView";
import { EndLoadingView } from "@/components/shared/EndLoadingView";
import { PostView } from "@/components/posts/PostView";
import { PostData } from "@/components/posts/PostDescription";
import { rpc_functions_fetch } from "@/lib/supabase";

export default function HomeFeed() {
  const insets = useSafeAreaInsets();
  const [posts_data, setPostsData] = useState<PostData[]>([]);
  const [page, setPage] = useState(1);
  const [is_failed, setIsFailed] = useState(false);
  const [end_is_failed, setEndIsFailed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [disableMore, setDisableMore] = useState(false);
  const [is_offline, setIsOffline] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const fetching = useRef(false);
  const lastScrollY = useRef(0);

  const fetchData = useCallback(async (action: string, p: number) => {
    if (fetching.current) return;
    fetching.current = true;
    try {
      const netState = await Network.getNetworkStateAsync();
      if (!netState.isConnected) {
        setIsOffline(true);
        if (p === 1) setIsFailed(true);
        return;
      }
      setIsOffline(false);
      const result = await rpc_functions_fetch(
        "recommend_posts_for_user",
        { p_page: p },
        p
      );
      if (!result || result.length === 0) {
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

  const handleRefresh = async () => {
    const netState = await Network.getNetworkStateAsync();
    if (!netState.isConnected) return;
    setRefreshing(true);
    setDisableMore(false);
    const result = await rpc_functions_fetch(
      "recommend_posts_for_user",
      { p_page: 1 },
      1
    ).catch(() => null);
    if (result && result.length > 0) {
      setPostsData((prev) => [...result, ...prev]);
    }
    setRefreshing(false);
  };

  const handleScroll = (e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10) {
      setHeaderVisible(false);
    } else if (y < lastScrollY.current - 10) {
      setHeaderVisible(true);
    }
    lastScrollY.current = y;
  };

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const topPad =
    Platform.OS === "web" ? 67 : insets.top;
  const bottomPad =
    Platform.OS === "web" ? 34 : insets.bottom;

  if (posts_data.length === 0) {
    return (
      <View style={[styles.root, { paddingTop: topPad, paddingBottom: bottomPad }]}>
        {headerVisible && <UpperBar />}
        <LoadingView
          retry_function={() => retry_function("loading")}
          is_failed={is_failed}
          is_offline={is_offline}
        />
        <NavigationSection onHomeRepress={scrollToTop} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: topPad, paddingBottom: bottomPad }]}>
      {headerVisible && <UpperBar />}
      <FlatList
        ref={flatListRef}
        data={posts_data}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <PostView posts_data={[item]} action={null} />
        )}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={() => {
          if (!disableMore && !end_is_failed) {
            fetchData("end_loading", page);
          }
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
      {headerVisible && <NavigationSection onHomeRepress={scrollToTop} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
