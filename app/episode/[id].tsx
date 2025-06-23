import React, { useEffect, useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import tw from "twrnc";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import EpisodeCard from "@/components/EpisodeCard";
import {
  KitsuAnime,
  KitsuEpisode,
  fetchAnimeById,
  fetchEpisodeById,
  fetchEpisodesByAnimeId,
  getBestTitle,
  getImageUrl,
} from "@/services/api";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function EpisodeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [episode, setEpisode] = useState<KitsuEpisode | null>(null);
  const [anime, setAnime] = useState<KitsuAnime | null>(null);
  const [otherEpisodes, setOtherEpisodes] = useState<KitsuEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEpisodes, setLoadingEpisodes] = useState(true);
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      setLoading(true);
      const episodeData = await fetchEpisodeById(id);
      setEpisode(episodeData);

      if (episodeData?.relationships?.media?.data?.id) {
        const animeId = episodeData.relationships.media.data.id;

        // Load anime and other episodes in parallel
        const [animeData, episodesData] = await Promise.all([
          fetchAnimeById(animeId),
          fetchEpisodesByAnimeId(animeId),
        ]);

        setAnime(animeData);

        // Filter out the current episode from other episodes
        setOtherEpisodes(episodesData.filter((ep) => ep.id !== episodeData.id));
        setLoadingEpisodes(false);
      }

      setLoading(false);
    };

    loadData();
  }, [id]);

  if (loading) {
    return (
      <ThemedView style={tw`flex-1 justify-center items-center`}>
        <ActivityIndicator
          size="large"
          color={colorScheme === "light" ? Colors.light.tint : Colors.dark.tint}
        />
      </ThemedView>
    );
  }

  if (!episode) {
    return (
      <ThemedView style={tw`flex-1 justify-center items-center p-4`}>
        <ThemedText style={tw`text-lg font-bold text-center`}>
          Épisode non trouvé
        </ThemedText>
        <TouchableOpacity
          onPress={() => router.back()}
          style={tw`mt-4 bg-blue-500 rounded-full px-4 py-2`}
        >
          <ThemedText style={tw`text-white`}>Retour</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  // Get anime title if available
  const animeTitle = anime
    ? getBestTitle(anime.attributes.titles, anime.attributes.canonicalTitle)
    : "";

  // Get episode title or number
  const hasEpisodeTitle =
    episode.attributes.canonicalTitle ||
    (episode.attributes.titles &&
      Object.keys(episode.attributes.titles).length > 0);

  const episodeTitle = hasEpisodeTitle
    ? getBestTitle(episode.attributes.titles, episode.attributes.canonicalTitle)
    : `Épisode ${episode.attributes.number || "?"}`;

  // Get the thumbnail or use anime poster as fallback
  const thumbnailUrl = episode.attributes.thumbnail
    ? getImageUrl(episode.attributes.thumbnail, "large")
    : anime?.attributes.posterImage
    ? getImageUrl(anime.attributes.posterImage, "medium")
    : "https://via.placeholder.com/400x225?text=No+Image";

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <ThemedView style={tw`flex-1`}>
        {/* Fixed header with back button */}
        <View
          style={tw`absolute top-0 left-0 right-0 z-10 flex-row justify-between items-center px-4 pt-12 pb-2`}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={tw`bg-gray-800 bg-opacity-70 rounded-full p-2`}
          >
            <IconSymbol name="chevron.left" size={24} color="#ffffff" />
          </TouchableOpacity>

          {anime && (
            <TouchableOpacity
              onPress={() => router.push(`/anime/${anime.id}`)}
              style={tw`bg-gray-800 bg-opacity-70 rounded-full py-2 px-3`}
            >
              <ThemedText style={tw`text-white text-xs`}>
                Voir l'anime
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={tw`flex-1`}>
          {/* Thumbnail */}
          <Image
            source={{ uri: thumbnailUrl }}
            style={tw`w-full h-48`}
            resizeMode="cover"
          />

          {/* Episode info card */}
          <ThemedView style={tw`px-4 py-5 bg-gray-100 dark:bg-gray-800`}>
            <ThemedText style={tw`text-xl font-bold`}>
              {episodeTitle}
            </ThemedText>

            {animeTitle && (
              <TouchableOpacity
                onPress={() => anime && router.push(`/anime/${anime.id}`)}
                style={tw`mt-1`}
              >
                <ThemedText style={tw`text-blue-600 dark:text-blue-400`}>
                  {animeTitle}
                </ThemedText>
              </TouchableOpacity>
            )}

            <View style={tw`flex-row flex-wrap mt-2`}>
              {episode.attributes.seasonNumber !== null && (
                <View
                  style={tw`bg-blue-100 dark:bg-blue-900 rounded-full px-3 py-1 mr-2 mb-1`}
                >
                  <ThemedText
                    style={tw`text-xs text-blue-800 dark:text-blue-200`}
                  >
                    Saison {episode.attributes.seasonNumber}
                  </ThemedText>
                </View>
              )}

              {episode.attributes.number !== null && (
                <View
                  style={tw`bg-green-100 dark:bg-green-900 rounded-full px-3 py-1 mr-2 mb-1`}
                >
                  <ThemedText
                    style={tw`text-xs text-green-800 dark:text-green-200`}
                  >
                    Épisode {episode.attributes.number}
                  </ThemedText>
                </View>
              )}

              {episode.attributes.length && (
                <View
                  style={tw`bg-purple-100 dark:bg-purple-900 rounded-full px-3 py-1 mr-2 mb-1`}
                >
                  <ThemedText
                    style={tw`text-xs text-purple-800 dark:text-purple-200`}
                  >
                    {episode.attributes.length} min
                  </ThemedText>
                </View>
              )}
            </View>

            {episode.attributes.airdate && (
              <ThemedText
                style={tw`mt-2 text-sm text-gray-500 dark:text-gray-400`}
              >
                Diffusé le{" "}
                {new Date(episode.attributes.airdate).toLocaleDateString()}
              </ThemedText>
            )}
          </ThemedView>

          {/* Main content */}
          <ThemedView style={tw`p-4`}>
            {/* Synopsis */}
            {episode.attributes.synopsis && (
              <>
                <ThemedText style={tw`text-lg font-bold mb-1`}>
                  Synopsis
                </ThemedText>
                <ThemedText style={tw`mb-4`}>
                  {episode.attributes.synopsis}
                </ThemedText>
              </>
            )}

            {/* Other episodes */}
            {otherEpisodes.length > 0 && (
              <>
                <ThemedText style={tw`text-lg font-bold mb-2`}>
                  Autres épisodes
                </ThemedText>
                {loadingEpisodes ? (
                  <ActivityIndicator
                    size="small"
                    color={
                      colorScheme === "light"
                        ? Colors.light.tint
                        : Colors.dark.tint
                    }
                    style={tw`py-4`}
                  />
                ) : (
                  otherEpisodes
                    .sort(
                      (a, b) =>
                        (a.attributes.number || 0) - (b.attributes.number || 0)
                    )
                    .map((ep) => <EpisodeCard key={ep.id} episode={ep} />)
                )}
              </>
            )}
          </ThemedView>
        </ScrollView>
      </ThemedView>
    </>
  );
}
