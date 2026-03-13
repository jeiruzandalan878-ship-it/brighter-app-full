import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const SUPABASE_URL = "https://ztmmwwzixxyxhslwvgqa.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0bW13d3ppeHh5eGhzbHd2Z3FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTM5NjMsImV4cCI6MjA3ODk4OTk2M30.rHCcdDaq7lyN9TlKWHW36aHCrkF4W0tDp6RF70LowTU";

const SecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: SecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export async function rpc_functions_fetch(
  rpc_function: string,
  function_params: Record<string, unknown> | null,
  page_number: number | null
) {
  try {
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      const { data: refreshData, error: refreshError } =
        await supabase.auth.refreshSession();
      if (refreshError || !refreshData.session) {
        throw new Error("Session expired. Please sign in again.");
      }
    }

    let query;
    if (function_params === null) {
      query = supabase.rpc(rpc_function);
    } else {
      query = supabase.rpc(rpc_function, function_params);
    }

    const { data, error } = await query;

    if (error) throw error;

    if (page_number !== null && data !== null) {
      if (Array.isArray(data) && data.length === 0) {
        return [];
      }
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export async function fetch_image(image_name: string | null): Promise<string | null> {
  if (!image_name) return null;
  try {
    const { data, error } = await supabase.storage
      .from("post_images")
      .createSignedUrl(`images/${image_name}`, 3600);
    if (error) return null;
    return data?.signedUrl ?? null;
  } catch {
    return null;
  }
}
