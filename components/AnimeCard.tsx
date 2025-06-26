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
  style={tw`mb-5 rounded-xl bg-white dark:bg-gray-900 shadow-md px-4 py-3 flex-row items-center`}
  activeOpacity={0.85}
>
  {/* Image à gauche, carrée avec contour */}
  <Image
    source={{ uri: imageUrl }}
    style={tw`w-20 h-25 rounded-xl mr-4 border border-gray-300 dark:border-gray-700`}
    resizeMode="cover"
  />

  {/* Contenu texte à droite */}
  <View style={tw`flex-1 justify-between`}>
    <View>
      <ThemedText
        style={tw`text-base font-bold text-black dark:text-white mb-1`}
        numberOfLines={2}
      >
        {title}
      </ThemedText>

      {anime.attributes.startDate && (
        <ThemedText style={tw`text-xs text-gray-500 mb-2`}>
          {formatDate(anime.attributes.startDate)}
        </ThemedText>
      )}

      <View style={tw`flex-row flex-wrap gap-2 items-center`}>
        {showType && anime.attributes.showType && (
          <ThemedText style={tw`text-xs bg-indigo-100 dark:bg-indigo-700 text-indigo-800 dark:text-white px-2 py-0.5 rounded-full`}>
            {anime.attributes.showType}
          </ThemedText>
        )}

        {anime.attributes.averageRating && (
          <View style={tw`flex-row items-center`}>
            <ThemedText style={tw`text-yellow-400 mr-1 text-base`}>★</ThemedText>
            <ThemedText style={tw`text-xs`}>
              {(parseFloat(anime.attributes.averageRating) / 10).toFixed(1)}
            </ThemedText>
          </View>
        )}
      </View>
    </View>

    {/* Badge aligné à droite en bas */}
    {anime.attributes.status && (
      <View style={tw`items-end mt-2`}>
        <View
          style={tw.style(
            `rounded-full px-3 py-1`,
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
      </View>
    )}
  </View>
</TouchableOpacity>







  );
}
