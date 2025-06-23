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

  // Get best title available
  const title = getBestTitle(
    "attributes" in anime && "titles" in anime.attributes
      ? anime.attributes.titles
      : undefined,
    anime.attributes.canonicalTitle
  );

  // Get poster image with fallback
  const imageUrl = getImageUrl(anime.attributes.posterImage, "medium");

  // Format start date if available
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

  // Get anime status and convert to French
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
      style={tw`mb-4 rounded-lg overflow-hidden`}
      activeOpacity={0.7}
    >
      <ThemedView style={tw`p-3 rounded-lg bg-gray-100 dark:bg-gray-800`}>
        <View style={tw`flex-row`}>
          <Image
            source={{ uri: imageUrl }}
            style={tw`w-20 h-28 rounded-md`}
            resizeMode="cover"
          />
          <View style={tw`flex-1 ml-3 justify-between -mt-1.5`}>
            <View>
              <ThemedText
                style={tw`font-bold text-base mb-1`}
                numberOfLines={2}
              >
                {title}
              </ThemedText>

              <View style={tw`flex-row flex-wrap`}>
                {anime.attributes.averageRating && (
                  <View style={tw`flex-row items-center mr-3 mb-1`}>
                    <ThemedText style={tw`text-amber-500 mr-1`}>★</ThemedText>
                    <ThemedText style={tw`text-xs`}>
                      {(
                        parseFloat(anime.attributes.averageRating) / 10
                      ).toFixed(1)}
                    </ThemedText>
                  </View>
                )}

                {showType && anime.attributes.showType && (
                  <ThemedText style={tw`text-xs mr-3 mb-1`}>
                    {anime.attributes.showType}
                  </ThemedText>
                )}

                {anime.attributes.episodeCount > 0 && (
                  <ThemedText style={tw`text-xs mb-1`}>
                    {anime.attributes.episodeCount} épisodes
                  </ThemedText>
                )}
              </View>

              {anime.attributes.startDate && (
                <ThemedText
                  style={tw`text-xs text-gray-500 dark:text-gray-400`}
                >
                  {formatDate(anime.attributes.startDate)}
                </ThemedText>
              )}
            </View>
            <View style={tw`mt-2`}>
              {anime.attributes.status && (
                <View style={tw`bg-blue-500 self-start rounded-full px-3 py-1`}>
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
