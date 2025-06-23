import AsyncStorage from '@react-native-async-storage/async-storage';
import { KitsuAnime } from './api';

const COLLECTION_STORAGE_KEY = '@animeCollect:collection';

// Type for stored collection item (simplified to save storage space)
export interface CollectionItem {
    id: string;
    type: string;
    attributes: {
        canonicalTitle: string;
        synopsis: string;
        startDate: string;
        posterImage: {
            tiny?: string;
            small?: string;
            medium?: string;
        };
        episodeCount: number;
        status: string;
        showType: string;
        averageRating: string;
    };
    dateAdded: string;
}

// Convert KitsuAnime to CollectionItem
const animeToCollectionItem = (anime: KitsuAnime): CollectionItem => {
    return {
        id: anime.id,
        type: anime.type,
        attributes: {
            canonicalTitle: anime.attributes.canonicalTitle,
            synopsis: anime.attributes.synopsis,
            startDate: anime.attributes.startDate,
            posterImage: {
                tiny: anime.attributes.posterImage?.tiny,
                small: anime.attributes.posterImage?.small,
                medium: anime.attributes.posterImage?.medium,
            },
            episodeCount: anime.attributes.episodeCount,
            status: anime.attributes.status,
            showType: anime.attributes.showType,
            averageRating: anime.attributes.averageRating,
        },
        dateAdded: new Date().toISOString(),
    };
};

// Get all animes in collection
export const getCollection = async (): Promise<CollectionItem[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem(COLLECTION_STORAGE_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
        console.error('Error reading collection:', error);
        return [];
    }
};

// Add anime to collection
export const addToCollection = async (anime: KitsuAnime): Promise<boolean> => {
    try {
        // Get current collection
        const collection = await getCollection();

        // Check if anime already exists in collection
        if (collection.some(item => item.id === anime.id)) {
            return false; // Already exists
        }

        // Add to collection
        const collectionItem = animeToCollectionItem(anime);
        const updatedCollection = [...collection, collectionItem];

        // Save back to storage
        await AsyncStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(updatedCollection));
        return true;
    } catch (error) {
        console.error('Error adding to collection:', error);
        return false;
    }
};

// Remove anime from collection
export const removeFromCollection = async (animeId: string): Promise<boolean> => {
    try {
        // Get current collection
        const collection = await getCollection();

        // Filter out the anime to remove
        const updatedCollection = collection.filter(item => item.id !== animeId);

        // If same length, anime wasn't in collection
        if (updatedCollection.length === collection.length) {
            return false;
        }

        // Save back to storage
        await AsyncStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(updatedCollection));
        return true;
    } catch (error) {
        console.error('Error removing from collection:', error);
        return false;
    }
};

// Check if anime is in collection
export const isInCollection = async (animeId: string): Promise<boolean> => {
    try {
        const collection = await getCollection();
        return collection.some(item => item.id === animeId);
    } catch (error) {
        console.error('Error checking collection:', error);
        return false;
    }
};