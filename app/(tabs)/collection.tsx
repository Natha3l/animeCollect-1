import React, { useEffect, useState, useCallback } from "react";
import { ActivityIndicator, FlatList, TouchableOpacity } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import tw from "twrnc";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import AnimeCard from "@/components/AnimeCard";
import { CollectionItem, getCollection } from "@/services/collectionService";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

export default function CollectionScreen() {
  const [collection, setCollection] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme() ?? "light";

  const loadCollection = async () => {
    setLoading(true);
    const collectionData = await getCollection();
    collectionData.sort(
      (a, b) =>
        new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
    );
    setCollection(collectionData);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadCollection();
    }, [])
  );

  useEffect(() => {
    loadCollection();
  }, []);

  return (
    <ThemedView style={tw`flex-1 pt-6 px-4`}>
      {/* Header remonté + contour plus visible */}
      <ThemedView
        style={tw`rounded-2xl p-4 mb-4 bg-white/90 dark:bg-black/50 shadow-lg border border-gray-200 dark:border-gray-700`}
      >
        <ThemedText style={tw`text-lg font-bold mb-1`}>
          Ma Collection
        </ThemedText>
        <ThemedText style={tw`text-sm text-gray-500 dark:text-gray-400`}>
          Les animes que vous avez ajoutés à votre collection
        </ThemedText>
      </ThemedView>

      {loading ? (
        <ThemedView style={tw`flex-1 justify-center items-center py-8`}>
          <ActivityIndicator
            size="large"
            color={
              colorScheme === "light" ? Colors.light.tint : Colors.dark.tint
            }
          />
        </ThemedView>
      ) : collection.length === 0 ? (
        <ThemedView style={tw`flex-1 justify-center items-center py-8`}>
          <ThemedText style={tw`text-center mb-4`}>
            Votre collection est vide. Ajoutez des animes depuis la page de
            détail !
          </ThemedText>
          <TouchableOpacity
            onPress={loadCollection}
            style={tw`bg-blue-500 dark:bg-blue-700 px-4 py-2 rounded-lg`}
          >
            <ThemedText style={tw`text-white font-semibold`}>
              Actualiser
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      ) : (
        <FlatList
          data={collection}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AnimeCard anime={item} />}
          contentContainerStyle={tw`pb-4`}
          ItemSeparatorComponent={() => <ThemedView style={tw`h-4`} />}
        />
      )}
    </ThemedView>
  );
}
