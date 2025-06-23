import React, { useEffect, useState } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import tw from "twrnc";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { KitsuEpisode, getBestTitle, getImageUrl } from "@/services/api";
import {
  isEpisodeWatched,
  markEpisodeAsWatched,
  unmarkEpisodeAsWatched,
} from "@/services/episodeWatchService";
import { fetchAnimeById } from "@/services/api";
import { addToCollection, isInCollection } from "@/services/collectionService";

interface EpisodeCardProps {
  episode: KitsuEpisode;
  showDate?: boolean;
  animeId?: string;
  animePosterUrl?: string;
  onWatchStatusChanged?: () => void;
}

export default function EpisodeCard({
  episode,
  showDate = true,
  animeId,
  animePosterUrl,
  onWatchStatusChanged,
}: EpisodeCardProps) {
  const router = useRouter();
  const [watched, setWatched] = useState(false);

  // Check if episode is watched on mount
  useEffect(() => {
    const checkWatchStatus = async () => {
      const isWatched = await isEpisodeWatched(episode.id);
      setWatched(isWatched);
    };

    checkWatchStatus();
  }, [episode.id]);

  const toggleWatchStatus = async (e: any) => {
    e.stopPropagation(); // Prevent card press

    if (!animeId && !episode.relationships?.media?.data?.id) return;

    const targetAnimeId = animeId || episode.relationships.media.data.id;

    if (watched) {
      const unmarked = await unmarkEpisodeAsWatched(episode.id);
      if (unmarked) {
        setWatched(false);
        if (onWatchStatusChanged) onWatchStatusChanged();
      }
    } else {
      // Fonction pour ajouter l'anime à la collection si nécessaire
      const addAnimeToCollection = async (animId: string) => {
        // Vérifier d'abord si l'anime est déjà en collection
        const alreadyInCollection = await isInCollection(animId);
        if (!alreadyInCollection) {
          // Si pas en collection, récupérer les détails et l'ajouter
          const animeDetails = await fetchAnimeById(animId);
          if (animeDetails) {
            await addToCollection(animeDetails);
          }
        }
      };

      // Marquer comme vu et ajouter à la collection
      const marked = await markEpisodeAsWatched(
        episode,
        targetAnimeId,
        addAnimeToCollection
      );

      if (marked) {
        setWatched(true);
        if (onWatchStatusChanged) onWatchStatusChanged();
      }
    }
  };

  // Get episode number as main identifier
  const episodeNumber = episode.attributes.number
    ? `Épisode ${episode.attributes.number}`
    : "Épisode spécial";

  // Check if episode has a title
  const hasTitle =
    episode.attributes.canonicalTitle ||
    (episode.attributes.titles &&
      Object.keys(episode.attributes.titles).length > 0);

  // Get title if available
  const episodeTitle = hasTitle
    ? getBestTitle(episode.attributes.titles, episode.attributes.canonicalTitle)
    : "";

  // Get thumbnail with fallback to anime poster
  const thumbnailUrl = episode.attributes.thumbnail
    ? getImageUrl(episode.attributes.thumbnail, "medium")
    : animePosterUrl || "https://via.placeholder.com/160x90?text=No+Image";

  return (
    <ThemedView
      style={[
        tw`mb-3 rounded-lg overflow-hidden`,
        watched ? tw`border-l-4 border-green-500` : null,
      ]}
    >
      <ThemedView style={tw`p-3 rounded-lg bg-gray-100 dark:bg-gray-800`}>
        <View style={tw`flex-row items-center`}>
          <Image
            source={{ uri: thumbnailUrl }}
            style={tw`w-20 h-14 rounded-md`}
            resizeMode="cover"
          />
          <View style={tw`flex-1 ml-3 justify-between`}>
            <View>
              <ThemedText style={tw`font-bold text-base`} numberOfLines={1}>
                {episodeNumber}
              </ThemedText>

              {hasTitle && (
                <ThemedText style={tw`text-sm`} numberOfLines={1}>
                  {episodeTitle}
                </ThemedText>
              )}

              {showDate && episode.attributes.airdate && (
                <ThemedText
                  style={tw`text-xs mt-1 text-gray-500 dark:text-gray-400`}
                >
                  {new Date(episode.attributes.airdate).toLocaleDateString()}
                </ThemedText>
              )}
            </View>
          </View>

          {/* Watched/Unwatched toggle button */}
          <TouchableOpacity
            onPress={toggleWatchStatus}
            style={[
              tw`ml-2 p-2 rounded-full`,
              watched
                ? tw`bg-green-200 dark:bg-green-700`
                : tw`bg-gray-200 dark:bg-gray-700`,
            ]}
          >
            <ThemedText
              style={
                watched
                  ? tw`text-green-800 dark:text-green-200`
                  : tw`text-gray-800 dark:text-gray-200`
              }
            >
              {watched ? "✓" : "○"}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </ThemedView>
  );
}
