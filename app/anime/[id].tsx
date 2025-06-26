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
import EpisodeCard from "@/components/EpisodeCard";
import {
  fetchAnimeById,
  fetchAnimeCategories,
  fetchEpisodesByAnimeId,
  getBestTitle,
  getImageUrl,
  KitsuAnime,
  KitsuCategory,
  KitsuEpisode,
} from "@/services/api";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ExternalLink } from "@/components/ExternalLink";
import {
  addToCollection,
  isInCollection,
  removeFromCollection,
} from "@/services/collectionService";
import {
  WatchedEpisode,
  getWatchedEpisodesForAnime,
} from "@/services/episodeWatchService";

export default function AnimeDetailAltScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [anime, setAnime] = useState<KitsuAnime | null>(null);
  const [episodes, setEpisodes] = useState<KitsuEpisode[]>([]);
  const [categories, setCategories] = useState<KitsuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [watchedEpisodes, setWatchedEpisodes] = useState<WatchedEpisode[]>([]);
  const [inCollection, setInCollection] = useState(false);
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();

  const loadData = async () => {
    if (!id) return;

    setLoading(true);
    const [animeData, episodesData, categoriesData, collectionStatus] =
      await Promise.all([
        fetchAnimeById(id),
        fetchEpisodesByAnimeId(id),
        fetchAnimeCategories(id),
        isInCollection(id),
      ]);

    setAnime(animeData);
    setEpisodes(episodesData);
    setCategories(categoriesData);
    setInCollection(collectionStatus);
    setLoading(false);

    if (animeData) {
      const watched = await getWatchedEpisodesForAnime(animeData.id);
      setWatchedEpisodes(watched);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const toggleCollection = async () => {
    if (!anime) return;
    if (inCollection) {
      const removed = await removeFromCollection(anime.id);
      if (removed) setInCollection(false);
    } else {
      const added = await addToCollection(anime);
      if (added) setInCollection(true);
    }
  };

  const title = anime
    ? getBestTitle(anime.attributes.titles, anime.attributes.canonicalTitle)
    : "";

  const posterImage = anime ? getImageUrl(anime.attributes.posterImage, "medium") : "";

  const sortedEpisodes = [...episodes].sort(
    (a, b) => (a.attributes.number || 0) - (b.attributes.number || 0)
  );

  const FavoriteButton = () => (
    <TouchableOpacity onPress={toggleCollection} style={tw`px-2 py-1`}>
      <ThemedText style={tw`text-2xl`}>{inCollection ? "♥" : "♡"}</ThemedText>
    </TouchableOpacity>
  );

  if (loading || !anime) {
    return (
      <ThemedView style={tw`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: title.length > 22 ? title.slice(0, 20) + "..." : title,
          headerRight: FavoriteButton,
        }}
      />

      <ScrollView style={tw`flex-1 bg-gray-100 dark:bg-gray-900`}>
        <View style={tw`items-center p-4`}>
          <Image
            source={{ uri: posterImage }}
            style={tw`w-40 h-56 rounded-xl shadow-md mb-4`}
          />

          <ThemedText style={tw`text-xl font-bold text-center mb-2`}>
            {title}
          </ThemedText>

          <View style={tw`flex-row gap-2 mb-2`}>
            {anime.attributes.showType && (
              <ThemedText style={tw`text-sm text-purple-500`}>
                {anime.attributes.showType}
              </ThemedText>
            )}
            {anime.attributes.status && (
              <ThemedText style={tw`text-sm text-gray-500`}>
                {anime.attributes.status}
              </ThemedText>
            )}
          </View>

          {anime.attributes.averageRating && (
            <ThemedText style={tw`text-lg text-amber-400`}>
              ★ {(parseFloat(anime.attributes.averageRating) / 10).toFixed(1)}
            </ThemedText>
          )}
        </View>

        <ThemedView style={tw`px-4`}>
          <ThemedText style={tw`text-lg font-semibold mb-2`}>Synopsis</ThemedText>
          <ThemedText style={tw`text-sm mb-4 text-justify`}>
            {anime.attributes.synopsis}
          </ThemedText>

          <ThemedText style={tw`text-lg font-semibold mb-2`}>Détails</ThemedText>
          <View style={tw`gap-1 mb-4`}>
            {anime.attributes.startDate && (
              <ThemedText>Début : {anime.attributes.startDate}</ThemedText>
            )}
            {anime.attributes.endDate && (
              <ThemedText>Fin : {anime.attributes.endDate}</ThemedText>
            )}
            {anime.attributes.episodeCount && (
              <ThemedText>Épisodes : {anime.attributes.episodeCount}</ThemedText>
            )}
            {anime.attributes.episodeLength && (
              <ThemedText>Durée : {anime.attributes.episodeLength} min</ThemedText>
            )}
            {anime.attributes.popularityRank && (
              <ThemedText>Popularité : #{anime.attributes.popularityRank}</ThemedText>
            )}
          </View>

          {categories.length > 0 && (
            <>
              <ThemedText style={tw`text-lg font-semibold mb-2`}>
                Genres
              </ThemedText>
              <View style={tw`flex-row flex-wrap gap-2 mb-4`}>
                {categories.map((cat) => (
                  <View
                    key={cat.id}
                    style={tw`bg-purple-100 dark:bg-purple-800 px-3 py-1 rounded-full`}
                  >
                    <ThemedText style={tw`text-xs text-purple-900 dark:text-white`}>
                      {cat.attributes.title}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </>
          )}

          <ThemedText style={tw`text-lg font-semibold mb-2`}>
            Épisodes ({watchedEpisodes.length}/{sortedEpisodes.length})
          </ThemedText>
          {sortedEpisodes.length === 0 ? (
            <ThemedText style={tw`text-sm text-center`}>
              Aucun épisode disponible.
            </ThemedText>
          ) : (
            sortedEpisodes.map((ep) => (
              <EpisodeCard
                key={ep.id}
                episode={ep}
                animeId={anime.id}
                animePosterUrl={posterImage}
                onWatchStatusChanged={loadData}
              />
            ))
          )}

          {anime.attributes.youtubeVideoId && (
            <View style={tw`mt-6`}>
              <ThemedText style={tw`text-lg font-semibold mb-2`}>
                Bande-annonce
              </ThemedText>
              <ExternalLink
                href={`https://www.youtube.com/watch?v=${anime.attributes.youtubeVideoId}`}
              >
                <ThemedView style={tw`bg-red-600 p-3 rounded-lg`}>
                  <ThemedText style={tw`text-white text-center`}>
                    Regarder sur YouTube
                  </ThemedText>
                </ThemedView>
              </ExternalLink>
            </View>
          )}
        </ThemedView>
      </ScrollView>
    </>
  );
}
