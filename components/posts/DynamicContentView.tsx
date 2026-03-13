import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { fetch_image } from "@/lib/supabase";
import { PostData, PostDescription } from "@/components/posts/PostDescription";

type Props = {
  post_data: PostData;
  action: string | null;
};

type ContentItem = {
  text?: string;
  text_style?: Record<string, unknown>;
  view_style?: Record<string, unknown>;
  image?: string;
  image_style?: Record<string, unknown>;
  type?: string;
};

type Background = {
  background_view_style?: Record<string, unknown>;
  [key: string]: ContentItem | Record<string, unknown> | undefined;
};

function ImageContent({ imageName, viewStyle, imageStyle }: { imageName: string; viewStyle: Record<string, unknown>; imageStyle: Record<string, unknown> }) {
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    fetch_image(imageName).then(setUri);
  }, [imageName]);

  return (
    <View style={viewStyle as any}>
      {uri ? (
        <Image source={{ uri }} style={imageStyle as any} />
      ) : (
        <View style={[imageStyle as any, { backgroundColor: "#eee" }]} />
      )}
    </View>
  );
}

function ProfilePictureContent({ post_data, viewStyle, imageStyle }: { post_data: PostData; viewStyle: Record<string, unknown>; imageStyle: Record<string, unknown> }) {
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    if (post_data.profile_picture) {
      fetch_image(post_data.profile_picture).then(setUri);
    }
  }, [post_data.profile_picture]);

  return (
    <View style={viewStyle as any}>
      {uri ? (
        <Image source={{ uri }} style={imageStyle as any} />
      ) : (
        <View style={[imageStyle as any, { backgroundColor: "#eee" }]} />
      )}
    </View>
  );
}

function SafeDynamicContentView({ post_data, action }: Props) {
  const content = post_data.content as Record<string, Background>;
  const backgroundKeys = Object.keys(content).filter((k) =>
    k.startsWith("background")
  );

  return (
    <>
      {backgroundKeys.map((bgKey) => {
        const background = content[bgKey];
        const bgViewStyle = background.background_view_style ?? {};

        const contentKeys = Object.keys(background).filter(
          (k) => k !== "background_view_style"
        );

        return (
          <View key={bgKey} style={bgViewStyle as any}>
            {action !== "post_view" && (
              <PostDescription post_data={post_data} action={action} />
            )}
            {contentKeys.map((ck) => {
              const item = background[ck] as ContentItem;
              if (!item) return null;

              if (ck === "profile_picture") {
                return (
                  <ProfilePictureContent
                    key={ck}
                    post_data={post_data}
                    viewStyle={(item.view_style ?? {}) as Record<string, unknown>}
                    imageStyle={(item.image_style ?? {}) as Record<string, unknown>}
                  />
                );
              }

              if (ck.includes("button")) {
                const type = item.type;
                if (type === "username") {
                  return (
                    <TouchableOpacity
                      key={ck}
                      style={item.view_style as any}
                      onPress={() =>
                        router.push({
                          pathname: "/user/[userId]",
                          params: { userId: post_data.user_id },
                        })
                      }
                    >
                      <Text style={item.text_style as any}>
                        {post_data.username}
                      </Text>
                    </TouchableOpacity>
                  );
                }
                return null;
              }

              if (ck.includes("text") && item.text !== undefined) {
                return (
                  <View key={ck} style={item.view_style as any}>
                    <Text style={item.text_style as any}>{item.text}</Text>
                  </View>
                );
              }

              if (ck.includes("image") && item.image !== undefined) {
                return (
                  <ImageContent
                    key={ck}
                    imageName={item.image}
                    viewStyle={(item.view_style ?? {}) as Record<string, unknown>}
                    imageStyle={(item.image_style ?? {}) as Record<string, unknown>}
                  />
                );
              }

              return null;
            })}
          </View>
        );
      })}
    </>
  );
}

export class DynamicContentErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.unsupported}>
          <Text style={styles.unsupportedText}>Unsupported Format</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export function DynamicContentView({ post_data, action }: Props) {
  return (
    <DynamicContentErrorBoundary>
      <SafeDynamicContentView post_data={post_data} action={action} />
    </DynamicContentErrorBoundary>
  );
}

const styles = StyleSheet.create({
  unsupported: {
    padding: 24,
    alignItems: "center",
  },
  unsupportedText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#888",
  },
});
