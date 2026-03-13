import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Network from "expo-network";
import { NavigationSection } from "@/components/shared/NavigationSection";
import { UpperBar } from "@/components/shared/UpperBar";
import { LoadingView } from "@/components/shared/LoadingView";
import { EndLoadingView } from "@/components/shared/EndLoadingView";
import { rpc_functions_fetch, fetch_image } from "@/lib/supabase";

type Category = {
  id: string;
  category: string;
  category_image: string | null;
};

function CategoryCard({
  category,
  onPress,
}: {
  category: Category;
  onPress: () => void;
}) {
  const [imgUri, setImgUri] = useState<string | null>(null);
  useEffect(() => {
    if (category.category_image) {
      fetch_image(category.category_image).then(setImgUri);
    }
  }, [category.category_image]);

  return (
    <TouchableOpacity style={styles.categoryCard} onPress={onPress}>
      {imgUri ? (
        <Image source={{ uri: imgUri }} style={styles.categoryImage} />
      ) : (
        <View style={[styles.categoryImage, styles.categoryImagePlaceholder]} />
      )}
      <Text style={styles.categoryName} numberOfLines={1}>
        {category.category}
      </Text>
    </TouchableOpacity>
  );
}

export default function SearchAndCategoryPage() {
  const insets = useSafeAreaInsets();
  const [searchInput, setSearchInput] = useState("");
  const [categories_data, setCategoriesData] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [is_failed, setIsFailed] = useState(false);
  const [end_is_failed, setEndIsFailed] = useState(false);
  const [disableMore, setDisableMore] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const fetching = useRef(false);
  const lastScrollY = useRef(0);

  const fetchCategories = useCallback(async (action: string, p: number) => {
    if (fetching.current) return;
    fetching.current = true;
    try {
      const result = await rpc_functions_fetch(
        "categories_data_function",
        { p_page: p },
        p
      );
      if (!result || result.length === 0) {
        setDisableMore(true);
        if (action === "end_loading") setEndIsFailed(false);
        else setIsFailed(false);
      } else {
        setCategoriesData((prev) => [...prev, ...result]);
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
    if (categories_data.length === 0) {
      fetchCategories("loading", 1);
    }
  }, []);

  const retry_function = (action: string) => {
    if (action === "end_loading") {
      setEndIsFailed(false);
      fetchCategories("end_loading", page);
    } else {
      setIsFailed(false);
      fetchCategories("loading", 1);
    }
  };

  const handleSearch = async () => {
    const netState = await Network.getNetworkStateAsync();
    if (!netState.isConnected || !searchInput.trim()) return;
    router.push({
      pathname: "/search-results",
      params: { query: searchInput.trim() },
    });
  };

  const handleScroll = (e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10) setHeaderVisible(false);
    else if (y < lastScrollY.current - 10) setHeaderVisible(true);
    lastScrollY.current = y;
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.root, { paddingTop: topPad, paddingBottom: bottomPad }]}>
      {headerVisible && <UpperBar />}

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchInput}
          onChangeText={setSearchInput}
          placeholder="Search blogs, topics, authors..."
          placeholderTextColor="#aaa"
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
      </View>

      {categories_data.length === 0 ? (
        <LoadingView
          retry_function={() => retry_function("loading")}
          is_failed={is_failed}
        />
      ) : (
        <FlatList
          data={categories_data}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          renderItem={({ item }) => (
            <CategoryCard
              category={item}
              onPress={() =>
                router.push({
                  pathname: "/search-results",
                  params: { query: item.category },
                })
              }
            />
          )}
          onEndReached={() => {
            if (!disableMore) fetchCategories("end_loading", page);
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
      )}

      {headerVisible && <NavigationSection />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchContainer: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  searchInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#1a1a1a",
  },
  listContent: {
    padding: 10,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 10,
  },
  categoryCard: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
  },
  categoryImage: {
    width: "100%",
    height: 100,
  },
  categoryImagePlaceholder: {
    backgroundColor: "#e0e0e0",
  },
  categoryName: {
    fontSize: 13,
    fontFamily: "Poppins-Bold",
    color: "#1a1a1a",
    padding: 8,
  },
});
