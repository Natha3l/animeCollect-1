import React, { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import tw from "twrnc";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
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

    collectionData.sort((a, b) => {
      return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    });

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
    <ThemedView style={tw`flex-1`}>
      <ThemedView style={tw`pt-16 pb-4 px-4 bg-blue-500 dark:bg-blue-800`}>
        <ThemedText style={tw`text-2xl font-bold text-white`}>
          Ma Collection
        </ThemedText>
        <ThemedText style={tw`text-white mt-1`}>
          Les animes que vous avez ajoutés à votre collection
        </ThemedText>
      </ThemedView>

      {loading ? (
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
          data={collection}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AnimeCard anime={item} />}
          contentContainerStyle={tw`px-4 pt-4 pb-20`}
          ListEmptyComponent={
            <ThemedView style={tw`flex-1 justify-center items-center p-8`}>
              <ThemedText style={tw`text-center mb-4`}>
                Votre collection est vide. Ajoutez des animes depuis la page de
                détail d'un anime !
              </ThemedText>
              <TouchableOpacity
                onPress={loadCollection}
                style={tw`bg-blue-500 px-4 py-2 rounded-lg`}
              >
                <ThemedText style={tw`text-white`}>Actualiser</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          }
        />
      )}
    </ThemedView>
  );
}
