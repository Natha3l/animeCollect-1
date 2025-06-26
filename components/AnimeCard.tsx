import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import tw from "twrnc";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { KitsuAnime, getBestTitle, getImageUrl } from "@/services/api";
import { CollectionItem } from "@/services/collectionService";

interface AnimeCardProps {
  anime: KitsuAnime | CollectionItem;
  showType?: boolean;
}

export default function AnimeCard({ anime, showType = true }: AnimeCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/anime/${anime.id}`);
  };

  const title = getBestTitle(
    "attributes" in anime && "titles" in anime.attributes
      ? anime.attributes.titles
      : undefined,
    anime.attributes.canonicalTitle
  );

  const imageUrl = getImageUrl(anime.attributes.posterImage, "medium");

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Date inconnue";

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Date inconnue";

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatus = (status?: string) => {
    if (!status) return "";

    switch (status) {
      case "current":
        return "En cours";
      case "finished":
        return "Terminé";
      case "upcoming":
        return "À venir";
      case "tba":
        return "À annoncer";
      default:
        return status;
    }
  };

  return (
    <TouchableOpacity
  onPress={handlePress}
  style={tw`mb-6 rounded-xl overflow-hidden shadow-lg`}
  activeOpacity={0.8}
>
  <ThemedView style={tw`p-4 rounded-xl bg-white dark:bg-gray-900`}>
    <View style={tw`flex-row`}>
      <Image
        source={{ uri: imageUrl }}
        style={tw`w-24 h-32 rounded-lg border border-gray-300`}
        resizeMode="cover"
      />
      <View style={tw`flex-1 ml-4 justify-between`}>
        <View>
          <ThemedText
            style={tw`font-extrabold text-lg text-black dark:text-white mb-1`}
            numberOfLines={2}
          >
            {title}
          </ThemedText>

          <View style={tw`flex-row flex-wrap items-center`}>
            {anime.attributes.averageRating && (
              <View style={tw`flex-row items-center mr-4 mb-1`}>
                <ThemedText style={tw`text-yellow-500 mr-1 text-base`}>★</ThemedText>
                <ThemedText style={tw`text-sm`}>
                  {(parseFloat(anime.attributes.averageRating) / 10).toFixed(1)}
                </ThemedText>
              </View>
            )}

            {showType && anime.attributes.showType && (
              <ThemedText style={tw`text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full mr-2`}>
                {anime.attributes.showType}
              </ThemedText>
            )}

            {anime.attributes.episodeCount > 0 && (
              <ThemedText style={tw`text-xs text-gray-600 dark:text-gray-300`}>
                {anime.attributes.episodeCount} épisodes
              </ThemedText>
            )}
          </View>

          {anime.attributes.startDate && (
            <ThemedText style={tw`text-xs text-gray-500 mt-1`}>
              {formatDate(anime.attributes.startDate)}
            </ThemedText>
          )}
        </View>

        <View style={tw`mt-2`}>
          {anime.attributes.status && (
            <View
              style={tw.style(
                `self-start rounded-full px-3 py-1`,
                anime.attributes.status === "current" && "bg-green-500",
                anime.attributes.status === "finished" && "bg-emerald-600",
                anime.attributes.status === "upcoming" && "bg-orange-500",
                anime.attributes.status === "tba" && "bg-purple-500"
              )}
            >
              <ThemedText style={tw`text-white text-xs`}>
                {getStatus(anime.attributes.status)}
              </ThemedText>
            </View>
          )}
        </View>
      </View>
    </View>
  </ThemedView>
</TouchableOpacity>

  );
}
