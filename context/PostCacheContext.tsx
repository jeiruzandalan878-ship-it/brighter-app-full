import React, { createContext, useContext, useState, ReactNode } from "react";
import { PostData } from "@/components/posts/PostDescription";

type PostCacheContextType = {
  postCache: Record<string, PostData>;
  setPost: (id: string, data: PostData) => void;
  getPost: (id: string) => PostData | undefined;
};

const PostCacheContext = createContext<PostCacheContextType | undefined>(undefined);

export function PostCacheProvider({ children }: { children: ReactNode }) {
  const [postCache, setPostCache] = useState<Record<string, PostData>>({});

  const setPost = (id: string, data: PostData) => {
    setPostCache((prev) => ({ ...prev, [id]: data }));
  };

  const getPost = (id: string) => postCache[id];

  return (
    <PostCacheContext.Provider value={{ postCache, setPost, getPost }}>
      {children}
    </PostCacheContext.Provider>
  );
}

export function usePostCache() {
  const ctx = useContext(PostCacheContext);
  if (!ctx) throw new Error("usePostCache must be used within PostCacheProvider");
  return ctx;
}
