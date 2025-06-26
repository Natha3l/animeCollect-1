import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, TouchableOpacity } from "react-native";
import tw from "twrnc";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import AnimeCard from "@/components/AnimeCard";
import { KitsuAnime, fetchCurrentlyAiringAnime } from "@/services/api";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

export default function HomeScreen() {
  const [animes, setAnimes] = useState<KitsuAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme() ?? "light";

  const loadCurrentAnime = async () => {
    setLoading(true);
    try {
      const animesData = await fetchCurrentlyAiringAnime();
      setAnimes(animesData);
    } catch (error) {
      console.error("Error loading current anime:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCurrentAnime();
    setRefreshing(false);
  };

  useEffect(() => {
    loadCurrentAnime();
  }, []);

  return (
    <ThemedView style={tw`flex-1 bg-gradient-to-b from-indigo-100 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800`}>
      {/* Nouveau header en haut */}
      <ThemedView
        style={tw`mx-4 mt-4 mb-2 p-4 rounded-3xl bg-white/80 dark:bg-zinc-800/70 shadow-lg backdrop-blur-md flex-row justify-between items-center`}
      >
        <ThemedView>
          <ThemedText style={tw`text-xl font-bold text-zinc-800 dark:text-white`}>
            Animes en diffusion
          </ThemedText>
          <ThemedText style={tw`text-sm text-zinc-500 dark:text-zinc-300 mt-1`}>
            Suivis semaine après semaine
          </ThemedText>
        </ThemedView>

      </ThemedView>

      {/* Liste des animes */}
      {loading && !refreshing ? (
        <ThemedView style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator
            size="large"
            color={
              colorScheme === "light" ? Colors.light.tint : Colors.dark.tint
            }
          />
        </ThemedView>
      ) : (
        <FlatList
          data={animes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AnimeCard anime={item} />}
          contentContainerStyle={tw`px-4 pt-2 pb-20`}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Colors.light.tint]}
              tintColor={
                colorScheme === "light" ? Colors.light.tint : Colors.dark.tint
              }
            />
          }
          ListEmptyComponent={
            <ThemedView style={tw`flex-1 justify-center items-center p-8`}>
              <ThemedText style={tw`text-center text-zinc-600 dark:text-zinc-300`}>
                Aucun anime trouvé. Vérifie ta connexion et réessaie.
              </ThemedText>
            </ThemedView>
          }
        />
      )}
    </ThemedView>
  );
}
