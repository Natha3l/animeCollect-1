import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl } from "react-native";
import tw from "twrnc";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import AnimeCard from "@/components/AnimeCard";
import { KitsuAnime, fetchUpcomingAnime } from "@/services/api";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

export default function UpcomingScreen() {
  const [animes, setAnimes] = useState<KitsuAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme() ?? "light";

  const loadUpcomingAnimes = async () => {
    setLoading(true);
    const animesData = await fetchUpcomingAnime();
    setAnimes(animesData);
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUpcomingAnimes();
    setRefreshing(false);
  };

  useEffect(() => {
    loadUpcomingAnimes();
  }, []);

  return (
    <ThemedView style={tw`flex-1`}>
      {/* Header avec cadre visible et padding réduit */}
      <ThemedView
        style={tw`pt-6 px-4 pb-4`}
      >
        <ThemedView
          style={tw`rounded-2xl p-4 bg-white/90 dark:bg-black/50 shadow-lg border border-gray-200 dark:border-gray-700`}
        >
          <ThemedText style={tw`text-lg font-bold mb-1`}>
            Animés à venir
          </ThemedText>
          <ThemedText style={tw`text-sm text-gray-500 dark:text-gray-400`}>
            Les prochaines sorties d'animés
          </ThemedText>
        </ThemedView>
      </ThemedView>

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
          contentContainerStyle={tw`px-4 pt-4 pb-20`}
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
              <ThemedText style={tw`text-center`}>
                Aucun anime à venir trouvé. Vérifiez votre connexion internet et
                réessayez.
              </ThemedText>
            </ThemedView>
          }
        />
      )}
    </ThemedView>
  );
}
