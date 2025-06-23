import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import tw from "twrnc";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import AnimeCard from "@/components/AnimeCard";
import { KitsuAnime, searchAnime } from "@/services/api";
import {
  addToSearchHistory,
  getSearchHistory,
  clearSearchHistory,
} from "@/services/searchHistoryService";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<KitsuAnime[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme() ?? "light";

  // Charger l'historique au chargement
  useEffect(() => {
    const loadHistory = async () => {
      const history = await getSearchHistory();
      setSearchHistory(history);
    };

    loadHistory();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const results = await searchAnime(searchQuery);
      setSearchResults(results);
      setHasSearched(true);

      // Ajouter à l'historique
      await addToSearchHistory(searchQuery);
      const updatedHistory = await getSearchHistory();
      setSearchHistory(updatedHistory);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchWithQuery = async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const results = await searchAnime(query);
      setSearchResults(results);
      setHasSearched(true);

      // Ajouter à l'historique
      await addToSearchHistory(query);
      const updatedHistory = await getSearchHistory();
      setSearchHistory(updatedHistory);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryItemPress = (query: string) => {
    setSearchQuery(query);
    // Utiliser directement la nouvelle fonction avec la requête
    handleSearchWithQuery(query);
  };
  const handleClearHistory = async () => {
    await clearSearchHistory();
    setSearchHistory([]);
  };

  // Suggestions de recherches populaires
  const popularSearches = [
    "Naruto",
    "One Piece",
    "Dragon Ball",
    "My Hero Academia",
    "Demon Slayer",
    "Attack on Titan",
    "Hunter x Hunter",
    "Jujutsu Kaisen",
    "Spy x Family",
  ];

  return (
    <ThemedView style={tw`flex-1`}>
      <ThemedView style={tw`pt-16 pb-4 px-4 bg-blue-500 dark:bg-blue-800`}>
        <ThemedText style={tw`text-2xl font-bold text-white mb-2`}>
          Recherche
        </ThemedText>

        <View
          style={tw`flex-row items-center bg-white dark:bg-gray-700 rounded-lg px-3 py-2`}
        >
          <TextInput
            placeholder="Rechercher un anime..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={tw`flex-1 text-black dark:text-white`}
            placeholderTextColor={
              colorScheme === "light" ? "#6b7280" : "#9ca3af"
            }
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />

          {/* Bouton de recherche ou d'annulation selon le contexte */}
          {searchQuery.length > 0 || hasSearched ? (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                setHasSearched(false);
                setSearchResults([]);
              }}
              style={tw`ml-2 p-1`}
            >
              <ThemedText
                style={tw`text-gray-500 dark:text-gray-300 font-bold`}
              >
                Annuler
              </ThemedText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleSearch} style={tw`ml-2 p-1`}>
              <IconSymbol
                name="chevron.right"
                size={20}
                color={colorScheme === "light" ? "#6b7280" : "#9ca3af"}
              />
            </TouchableOpacity>
          )}
        </View>
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
      ) : error ? (
        <ThemedView style={tw`flex-1 justify-center items-center p-8`}>
          <ThemedText style={tw`text-center text-red-500 mb-2`}>
            {error}
          </ThemedText>
          <TouchableOpacity
            onPress={handleSearch}
            style={tw`bg-blue-500 px-4 py-2 rounded-lg mt-2`}
          >
            <ThemedText style={tw`text-white`}>Réessayer</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AnimeCard anime={item} />}
          contentContainerStyle={tw`px-4 pt-4 pb-20`}
          ListHeaderComponent={
            searchQuery && hasSearched && searchResults.length > 0 ? (
              <ThemedText style={tw`text-lg font-bold mb-4`}>
                Résultats pour "{searchQuery}"
              </ThemedText>
            ) : null
          }
          ListEmptyComponent={
            hasSearched ? (
              <ThemedView style={tw`flex-1 justify-center items-center p-8`}>
                <ThemedText style={tw`text-center`}>
                  {searchQuery
                    ? `Aucun résultat trouvé pour "${searchQuery}". Essayez avec des termes différents.`
                    : "Veuillez saisir un terme de recherche."}
                </ThemedText>
              </ThemedView>
            ) : (
              <View style={tw`px-2`}>
                {/* Historique de recherche */}
                {searchHistory.length > 0 && (
                  <>
                    <View
                      style={tw`flex-row justify-between items-center mb-2`}
                    >
                      <ThemedText style={tw`text-lg font-bold`}>
                        Recherches récentes
                      </ThemedText>
                      <TouchableOpacity onPress={handleClearHistory}>
                        <ThemedText
                          style={tw`text-sm text-blue-500 dark:text-blue-400`}
                        >
                          Effacer
                        </ThemedText>
                      </TouchableOpacity>
                    </View>

                    {searchHistory.map((query, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleHistoryItemPress(query)}
                        style={tw`p-3 border-b border-gray-200 dark:border-gray-700`}
                      >
                        <ThemedText>{query}</ThemedText>
                      </TouchableOpacity>
                    ))}
                  </>
                )}

                {/* Suggestions de recherche populaires */}
                <View style={tw`mt-6`}>
                  <ThemedText style={tw`text-lg font-bold mb-2`}>
                    Suggestions populaires
                  </ThemedText>

                  <View style={tw`flex-row flex-wrap`}>
                    {popularSearches.map((query, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleHistoryItemPress(query)}
                        style={tw`bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1 mr-2 mb-2`}
                      >
                        <ThemedText style={tw`text-sm`}>{query}</ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <ThemedText
                  style={tw`text-center mt-6 text-gray-500 dark:text-gray-400`}
                >
                  Recherchez vos animes préférés en utilisant la barre de
                  recherche ci-dessus.
                </ThemedText>
              </View>
            )
          }
        />
      )}
    </ThemedView>
  );
}
