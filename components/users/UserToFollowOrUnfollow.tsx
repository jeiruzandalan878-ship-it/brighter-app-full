import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "@/lib/supabase";

type UserFollowed = {
  username: string;
  user_id: string;
  following_user_id?: string;
};

type Props = {
  user_list: UserFollowed[];
  action: "follow" | "unfollow" | "follow_horizontal";
};

function FollowButton({
  initialFollow,
  userId,
}: {
  initialFollow: boolean;
  userId: string;
}) {
  const [following, setFollowing] = useState(initialFollow);

  const toggle = async () => {
    const newAction = following ? "unfollow" : "follow";
    setFollowing(!following);
    await supabase.rpc("follow_unfollow_function", {
      p_target_user_id: userId,
      p_action: newAction,
    });
  };

  return (
    <TouchableOpacity
      style={[styles.followBtn, following && styles.unfollowBtn]}
      onPress={toggle}
    >
      <Text style={[styles.followBtnText, following && styles.unfollowBtnText]}>
        {following ? "Unfollow" : "Follow"}
      </Text>
    </TouchableOpacity>
  );
}

export function UserToFollowOrUnfollow({ user_list, action }: Props) {
  if (action === "follow_horizontal") {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {user_list.map((user, i) => (
          <View key={i} style={styles.horizontalItem}>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/user/[userId]",
                  params: { userId: user.user_id },
                })
              }
            >
              <Text style={styles.usernameHorizontal}>{user.username}</Text>
            </TouchableOpacity>
            <FollowButton initialFollow={false} userId={user.user_id} />
          </View>
        ))}
      </ScrollView>
    );
  }

  return (
    <View>
      {user_list.map((user, i) => {
        const targetId =
          action === "unfollow"
            ? user.following_user_id ?? user.user_id
            : user.user_id;
        return (
          <View key={i} style={styles.row}>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/user/[userId]",
                  params: { userId: targetId },
                })
              }
              style={{ flex: 1 }}
            >
              <Text style={styles.username}>{user.username}</Text>
            </TouchableOpacity>
            <FollowButton
              initialFollow={action === "unfollow"}
              userId={targetId}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  username: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: "#1a1a1a",
  },
  horizontalItem: {
    alignItems: "center",
    marginHorizontal: 10,
    gap: 6,
    paddingVertical: 12,
  },
  usernameHorizontal: {
    fontSize: 13,
    fontFamily: "Poppins-Bold",
    color: "#1a1a1a",
    textAlign: "center",
  },
  followBtn: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
  },
  followBtnText: {
    color: "#fff",
    fontFamily: "Poppins-Bold",
    fontSize: 12,
  },
  unfollowBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#1a1a1a",
  },
  unfollowBtnText: {
    color: "#1a1a1a",
  },
});
