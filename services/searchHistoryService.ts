import AsyncStorage from '@react-native-async-storage/async-storage';

const SEARCH_HISTORY_KEY = '@animeCollect:searchHistory';
const MAX_HISTORY_ITEMS = 10;

// Get search history
export const getSearchHistory = async (): Promise<string[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
        console.error('Error reading search history:', error);
        return [];
    }
};

// Add search query to history
export const addToSearchHistory = async (query: string): Promise<boolean> => {
    try {
        if (!query.trim()) return false;

        // Get current search history
        const history = await getSearchHistory();

        // Remove the query if it already exists (to avoid duplicates)
        const filteredHistory = history.filter(item => item.toLowerCase() !== query.toLowerCase());

        // Add the new query at the beginning
        const updatedHistory = [query, ...filteredHistory];

        // Limit the history size
        const limitedHistory = updatedHistory.slice(0, MAX_HISTORY_ITEMS);

        // Save back to storage
        await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(limitedHistory));
        return true;
    } catch (error) {
        console.error('Error adding to search history:', error);
        return false;
    }
};

// Clear search history
export const clearSearchHistory = async (): Promise<boolean> => {
    try {
        await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing search history:', error);
        return false;
    }
};