import AsyncStorage from '@react-native-async-storage/async-storage';
import { KitsuEpisode } from './api';

const WATCHED_EPISODES_KEY = '@animeCollect:watchedEpisodes';

// Type for storing watched episode info
export interface WatchedEpisode {
    id: string;
    animeId: string;
    number: number | null;
    title: string;
    dateWatched: string;
}

// Convert KitsuEpisode to WatchedEpisode
const episodeToWatchedEpisode = (episode: KitsuEpisode, animeId: string): WatchedEpisode => {
    return {
        id: episode.id,
        animeId,
        number: episode.attributes.number,
        title: episode.attributes.canonicalTitle || `Épisode ${episode.attributes.number || '?'}`,
        dateWatched: new Date().toISOString(),
    };
};

// Get all watched episodes
export const getWatchedEpisodes = async (): Promise<WatchedEpisode[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem(WATCHED_EPISODES_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
        console.error('Error reading watched episodes:', error);
        return [];
    }
};

// Mark episode as watched and add anime to collection
export const markEpisodeAsWatched = async (
    episode: KitsuEpisode,
    animeId: string,
    addToCollectionFn?: (animeId: string) => Promise<void>
): Promise<boolean> => {
    try {
        // Get current watched episodes
        const watchedEpisodes = await getWatchedEpisodes();

        // Check if episode already exists in watched list
        if (watchedEpisodes.some(item => item.id === episode.id)) {
            return false; // Already exists
        }

        // Add to watched episodes
        const watchedEpisode = episodeToWatchedEpisode(episode, animeId);
        const updatedWatchedEpisodes = [...watchedEpisodes, watchedEpisode];

        // Save to storage
        await AsyncStorage.setItem(WATCHED_EPISODES_KEY, JSON.stringify(updatedWatchedEpisodes));

        // Add anime to collection if function is provided
        if (addToCollectionFn) {
            try {
                await addToCollectionFn(animeId);
            } catch (collectionError) {
                console.error('Error adding anime to collection:', collectionError);
                // We still return true because the episode was marked as watched
            }
        }

        return true;
    } catch (error) {
        console.error('Error marking episode as watched:', error);
        return false;
    }
};

// Unmark episode as watched
export const unmarkEpisodeAsWatched = async (episodeId: string): Promise<boolean> => {
    try {
        // Get current watched episodes
        const watchedEpisodes = await getWatchedEpisodes();

        // Filter out the episode to remove
        const updatedWatchedEpisodes = watchedEpisodes.filter(item => item.id !== episodeId);

        // If same length, episode wasn't in watched list
        if (updatedWatchedEpisodes.length === watchedEpisodes.length) {
            return false;
        }

        // Save back to storage
        await AsyncStorage.setItem(WATCHED_EPISODES_KEY, JSON.stringify(updatedWatchedEpisodes));
        return true;
    } catch (error) {
        console.error('Error unmarking episode as watched:', error);
        return false;
    }
};

// Check if episode is watched
export const isEpisodeWatched = async (episodeId: string): Promise<boolean> => {
    try {
        const watchedEpisodes = await getWatchedEpisodes();
        return watchedEpisodes.some(item => item.id === episodeId);
    } catch (error) {
        console.error('Error checking watched episode:', error);
        return false;
    }
};

// Get all watched episodes for an anime
export const getWatchedEpisodesForAnime = async (animeId: string): Promise<WatchedEpisode[]> => {
    try {
        const watchedEpisodes = await getWatchedEpisodes();
        return watchedEpisodes.filter(item => item.animeId === animeId);
    } catch (error) {
        console.error('Error getting watched episodes for anime:', error);
        return [];
    }
};