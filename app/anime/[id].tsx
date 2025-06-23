import React, { useEffect, useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import tw from "twrnc";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import EpisodeCard from "@/components/EpisodeCard";
import {
  KitsuAnime,
  KitsuCategory,
  KitsuEpisode,
  fetchAnimeById,
  fetchAnimeCategories,
  fetchEpisodesByAnimeId,
  getBestTitle,
  getImageUrl,
} from "@/services/api";
import { Colors } from "@/constants/Colors";
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

export default function AnimeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [anime, setAnime] = useState<KitsuAnime | null>(null);
  const [episodes, setEpisodes] = useState<KitsuEpisode[]>([]);
  const [categories, setCategories] = useState<KitsuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEpisodes, setLoadingEpisodes] = useState(true);
  const [inCollection, setInCollection] = useState(false);
  const [watchedEpisodes, setWatchedEpisodes] = useState<WatchedEpisode[]>([]);
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();

  const loadData = async () => {
    if (!id) return;

    setLoading(true);

    // Load anime details, episodes, and categories in parallel
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
    setLoadingEpisodes(false);

    // Load watched episodes
    if (animeData) {
      loadWatchedEpisodes(animeData.id);
    }
  };

  const loadWatchedEpisodes = async (animeId: string) => {
    const watched = await getWatchedEpisodesForAnime(animeId);
    setWatchedEpisodes(watched);
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

  const handleWatchStatusChanged = async () => {
    if (anime) {
      // Recharger les épisodes visionnés
      loadWatchedEpisodes(anime.id);

      // Vérifier si l'anime a été ajouté à la collection
      const collectionStatus = await isInCollection(anime.id);
      setInCollection(collectionStatus);
    }
  };

  // Composant bouton pour ajouter/retirer des favoris
  const FavoriteButton = () => (
    <TouchableOpacity onPress={toggleCollection} style={tw`px-2 py-1`}>
      <ThemedText style={tw`text-2xl`}>{inCollection ? "★" : "☆"}</ThemedText>
    </TouchableOpacity>
  );

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

  if (!anime) {
    return (
      <ThemedView style={tw`flex-1 justify-center items-center p-4`}>
        <ThemedText style={tw`text-lg font-bold text-center`}>
          Anime non trouvé
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

  // Get the title and poster image
  const title = getBestTitle(
    anime.attributes.titles,
    anime.attributes.canonicalTitle
  );
  const posterImage = getImageUrl(anime.attributes.posterImage, "medium");

  // Trier les épisodes par numéro
  const sortedEpisodes = [...episodes].sort(
    (a, b) => (a.attributes.number || 0) - (b.attributes.number || 0)
  );

  // Titre court pour l'en-tête
  const shortTitle = title.length > 20 ? title.substring(0, 18) + "..." : title;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: shortTitle,
          headerRight: FavoriteButton,
          headerBackTitle: "Retour",
        }}
      />

      <ScrollView style={tw`flex-1`}>
        {/* Poster et informations de base */}
        <View style={tw`items-center pt-6 pb-4 bg-blue-500 dark:bg-blue-800`}>
          <Image
            source={{ uri: posterImage }}
            style={tw`w-36 h-52 rounded-lg shadow-lg mb-4`}
            resizeMode="cover"
          />

          {title && (
            <ThemedText
              style={tw`text-xl font-bold text-center px-4 text-white`}
            >
              {title}
            </ThemedText>
          )}

          <View style={tw`flex-row mt-2`}>
            {anime.attributes.showType && (
              <View
                style={tw`bg-white dark:bg-gray-700 rounded-full px-3 py-1 mx-1`}
              >
                <ThemedText
                  style={tw`text-xs text-blue-500 dark:text-blue-300`}
                >
                  {anime.attributes.showType}
                </ThemedText>
              </View>
            )}

            {anime.attributes.status && (
              <View
                style={tw`bg-white dark:bg-gray-700 rounded-full px-3 py-1 mx-1`}
              >
                <ThemedText
                  style={tw`text-xs text-blue-500 dark:text-blue-300`}
                >
                  {anime.attributes.status === "current"
                    ? "En cours"
                    : anime.attributes.status === "finished"
                    ? "Terminé"
                    : anime.attributes.status === "upcoming"
                    ? "À venir"
                    : anime.attributes.status}
                </ThemedText>
              </View>
            )}
          </View>

          {anime.attributes.averageRating && (
            <View style={tw`flex-row items-center mt-2`}>
              <ThemedText style={tw`text-amber-300 mr-1 text-lg`}>★</ThemedText>
              <ThemedText style={tw`font-bold text-white`}>
                {(parseFloat(anime.attributes.averageRating) / 10).toFixed(1)}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Contenu principal */}
        <ThemedView style={tw`p-4`}>
          {/* Synopsis */}
          {anime.attributes.synopsis && (
            <>
              <ThemedText style={tw`text-lg font-bold mb-1`}>
                Synopsis
              </ThemedText>
              <ThemedText style={tw`mb-4`}>
                {anime.attributes.synopsis}
              </ThemedText>
            </>
          )}

          {/* Information */}
          <ThemedText style={tw`text-lg font-bold mb-1`}>
            Information
          </ThemedText>
          <ThemedView
            style={tw`bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mb-4`}
          >
            {anime.attributes.startDate && (
              <View style={tw`flex-row mb-1`}>
                <ThemedText style={tw`font-bold w-24`}>Début:</ThemedText>
                <ThemedText>
                  {new Date(anime.attributes.startDate).toLocaleDateString()}
                </ThemedText>
              </View>
            )}

            {anime.attributes.endDate && (
              <View style={tw`flex-row mb-1`}>
                <ThemedText style={tw`font-bold w-24`}>Fin:</ThemedText>
                <ThemedText>
                  {new Date(anime.attributes.endDate).toLocaleDateString()}
                </ThemedText>
              </View>
            )}

            {anime.attributes.episodeCount && (
              <View style={tw`flex-row mb-1`}>
                <ThemedText style={tw`font-bold w-24`}>Épisodes:</ThemedText>
                <ThemedText>{anime.attributes.episodeCount}</ThemedText>
              </View>
            )}

            {anime.attributes.episodeLength && (
              <View style={tw`flex-row mb-1`}>
                <ThemedText style={tw`font-bold w-24`}>Durée:</ThemedText>
                <ThemedText>{anime.attributes.episodeLength} min</ThemedText>
              </View>
            )}

            {anime.attributes.popularityRank && (
              <View style={tw`flex-row`}>
                <ThemedText style={tw`font-bold w-24`}>Popularité:</ThemedText>
                <ThemedText>#{anime.attributes.popularityRank}</ThemedText>
              </View>
            )}
          </ThemedView>

          {/* Catégories */}
          {categories.length > 0 && (
            <>
              <ThemedText style={tw`text-lg font-bold mb-2`}>
                Catégories
              </ThemedText>
              <View style={tw`flex-row flex-wrap mb-4`}>
                {categories.map((category) => (
                  <View
                    key={category.id}
                    style={tw`bg-blue-100 dark:bg-blue-900 rounded-full px-3 py-1 mr-2 mb-2`}
                  >
                    <ThemedText
                      style={tw`text-xs text-blue-800 dark:text-blue-200`}
                    >
                      {category.attributes.title}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Liste des épisodes */}
          <View style={tw`flex-row justify-between items-center mb-2`}>
            <ThemedText style={tw`text-lg font-bold`}>Épisodes</ThemedText>

            {/* Progression */}
            {sortedEpisodes.length > 0 && (
              <View
                style={tw`bg-blue-100 dark:bg-blue-900 rounded-full px-3 py-1`}
              >
                <ThemedText
                  style={tw`text-xs text-blue-800 dark:text-blue-200`}
                >
                  {watchedEpisodes.length} / {sortedEpisodes.length} vus
                </ThemedText>
              </View>
            )}
          </View>

          {loadingEpisodes ? (
            <ActivityIndicator
              size="small"
              color={
                colorScheme === "light" ? Colors.light.tint : Colors.dark.tint
              }
              style={tw`py-4`}
            />
          ) : sortedEpisodes.length > 0 ? (
            sortedEpisodes.map((episode) => (
              <EpisodeCard
                key={episode.id}
                episode={episode}
                animeId={anime.id}
                animePosterUrl={posterImage}
                onWatchStatusChanged={handleWatchStatusChanged}
              />
            ))
          ) : (
            <ThemedText style={tw`py-2 text-center`}>
              Aucun épisode disponible.
            </ThemedText>
          )}

          {/* Bande-annonce YouTube */}
          {anime.attributes.youtubeVideoId && (
            <View style={tw`mt-4 mb-2`}>
              <ThemedText style={tw`text-lg font-bold mb-2`}>
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
