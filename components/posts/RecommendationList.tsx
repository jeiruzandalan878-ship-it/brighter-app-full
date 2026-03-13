import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import { rpc_functions_fetch } from "@/lib/supabase";
import { PostData } from "@/components/posts/PostDescription";
import { PostView } from "@/components/posts/PostView";
import { LoadingView } from "@/components/shared/LoadingView";
import { EndLoadingView } from "@/components/shared/EndLoadingView";

type Props = {
  post: PostData;
};

export function RecommendationList({ post }: Props) {
  const [posts_data, setPostsData] = useState<PostData[]>([]);
  const [is_failed, setIsFailed] = useState(false);
  const [end_is_failed, setEndIsFailed] = useState(false);
  const [page, setPage] = useState(1);
  const [disableMore, setDisableMore] = useState(false);
  const fetching = useRef(false);

  const fetchData = async (action: string, p: number) => {
    if (fetching.current) return;
    fetching.current = true;
    try {
      const result = await rpc_functions_fetch(
        "find_similar_posts",
        { p_post_id: post.id, p_page: p },
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
  };

  useEffect(() => {
    fetchData("loading", 1);
  }, [post.id]);

  const retry_function = (action: string) => {
    if (action === "end_loading") {
      setEndIsFailed(false);
      fetchData("end_loading", page);
    } else {
      setIsFailed(false);
      fetchData("loading", 1);
    }
  };

  if (posts_data.length === 0) {
    return (
      <LoadingView
        retry_function={() => retry_function("loading")}
        is_failed={is_failed}
      />
    );
  }

  return (
    <View>
      <PostView posts_data={posts_data} action={null} />
      {!disableMore && (
        <EndLoadingView
          retry_function={() => retry_function("end_loading")}
          is_failed={end_is_failed}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({});
