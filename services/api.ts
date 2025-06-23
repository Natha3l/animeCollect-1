// API service for fetching anime data from Kitsu API
const BASE_URL = 'https://kitsu.io/api/edge';

// Types for API responses
export interface KitsuImage {
    tiny?: string;
    small?: string;
    medium?: string;
    large?: string;
    original?: string;
}

export interface KitsuAttributes {
    createdAt: string;
    updatedAt: string;
    slug: string;
    synopsis: string;
    description: string;
    coverImageTopOffset: number;
    titles: {
        en?: string;
        en_jp?: string;
        ja_jp?: string;
    };
    canonicalTitle: string;
    abbreviatedTitles: string[];
    averageRating: string;
    ratingFrequencies: Record<string, string>;
    userCount: number;
    favoritesCount: number;
    startDate: string;
    endDate: string;
    nextRelease: string | null;
    popularityRank: number;
    ratingRank: number;
    ageRating: string;
    ageRatingGuide: string;
    subtype: string;
    status: string;
    tba: string | null;
    posterImage: KitsuImage;
    coverImage: KitsuImage;
    episodeCount: number;
    episodeLength: number;
    totalLength: number;
    youtubeVideoId: string;
    showType: string;
    nsfw: boolean;
}

export interface KitsuEpisodeAttributes {
    createdAt: string;
    updatedAt: string;
    titles: {
        en_jp?: string;
        ja_jp?: string;
        en_us?: string;
    };
    canonicalTitle: string;
    seasonNumber: number;
    number: number;
    relativeNumber: number;
    synopsis: string;
    airdate: string;
    length: number;
    thumbnail: KitsuImage;
}

export interface KitsuAnime {
    id: string;
    type: string;
    links: {
        self: string;
    };
    attributes: KitsuAttributes;
    relationships?: {
        episodes?: {
            links: {
                self: string;
                related: string;
            }
        },
        categories?: {
            links: {
                self: string;
                related: string;
            }
        }
    };
}

export interface KitsuEpisode {
    id: string;
    type: string;
    links: {
        self: string;
    };
    attributes: KitsuEpisodeAttributes;
    relationships: {
        media: {
            links: {
                self: string;
                related: string;
            },
            data: {
                type: string;
                id: string;
            }
        }
    };
}

export interface KitsuListResponse<T> {
    data: T[];
    meta: {
        count: number;
    };
    links: {
        first: string;
        next?: string;
        last: string;
    };
}

export interface KitsuSingleResponse<T> {
    data: T;
}

export interface KitsuCategory {
    id: string;
    type: string;
    attributes: {
        createdAt: string;
        updatedAt: string;
        title: string;
        description: string;
        slug: string;
        nsfw: boolean;
        childCount: number;
    };
}

// Helper function to get image URL with fallbacks
export const getImageUrl = (imageObj?: KitsuImage, size: 'tiny' | 'small' | 'medium' | 'large' | 'original' = 'medium'): string => {
    if (!imageObj) {
        return 'https://via.placeholder.com/225x350?text=No+Image';
    }
    return imageObj[size] || imageObj.medium || imageObj.original || 'https://via.placeholder.com/225x350?text=No+Image';
};

// Helper function to get best available title
export const getBestTitle = (titles?: {
    en?: string;
    en_jp?: string;
    en_us?: string;
    ja_jp?: string;
}, canonicalTitle?: string): string => {
    if (!titles && !canonicalTitle) return 'Unknown Title';
    if (canonicalTitle) return canonicalTitle;

    return titles?.en || titles?.en_us || titles?.en_jp || titles?.ja_jp || 'Unknown Title';
};

// Add delay to prevent rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch currently airing anime (for home page)
export const fetchCurrentlyAiringAnime = async (): Promise<KitsuAnime[]> => {
    try {
        // Get anime that are currently airing (status=current)
        const response = await fetch(
            `${BASE_URL}/anime?filter[status]=current&sort=-startDate&page[limit]=20&include=categories`
        );

        if (!response.ok) {
            console.error(`API error: ${response.status} ${response.statusText}`);
            throw new Error('Failed to fetch current anime');
        }

        const data: KitsuListResponse<KitsuAnime> = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching current anime:', error);
        return [];
    }
};

// Fetch upcoming anime
export const fetchUpcomingAnime = async (): Promise<KitsuAnime[]> => {
    try {
        // Use the status filter to get upcoming anime
        const response = await fetch(
            `${BASE_URL}/anime?filter[status]=upcoming&sort=startDate&page[limit]=20&include=categories`
        );

        if (!response.ok) {
            console.error(`API error: ${response.status} ${response.statusText}`);
            throw new Error('Failed to fetch upcoming anime');
        }

        const data: KitsuListResponse<KitsuAnime> = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching upcoming anime:', error);
        return [];
    }
};

// Search anime by title
export const searchAnime = async (query: string): Promise<KitsuAnime[]> => {
    try {
        if (!query.trim()) return [];

        const response = await fetch(
            `${BASE_URL}/anime?filter[text]=${encodeURIComponent(query)}&page[limit]=20`
        );

        if (!response.ok) {
            console.error(`API error: ${response.status} ${response.statusText}`);
            throw new Error('Failed to search anime');
        }

        const data: KitsuListResponse<KitsuAnime> = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error searching anime:', error);
        return [];
    }
};

// Fetch anime details by ID
export const fetchAnimeById = async (id: string): Promise<KitsuAnime | null> => {
    try {
        const response = await fetch(`${BASE_URL}/anime/${id}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch anime details for ID: ${id}`);
        }

        const data: KitsuSingleResponse<KitsuAnime> = await response.json();
        return data.data;
    } catch (error) {
        console.error(`Error fetching anime details for ID ${id}:`, error);
        return null;
    }
};

// Fetch episode details by ID
export const fetchEpisodeById = async (id: string): Promise<KitsuEpisode | null> => {
    try {
        const response = await fetch(`${BASE_URL}/episodes/${id}?include=media`);

        if (!response.ok) {
            throw new Error(`Failed to fetch episode details for ID: ${id}`);
        }

        const data: KitsuSingleResponse<KitsuEpisode> = await response.json();
        return data.data;
    } catch (error) {
        console.error(`Error fetching episode details for ID ${id}:`, error);
        return null;
    }
};

// Fetch episodes for an anime
export const fetchEpisodesByAnimeId = async (animeId: string): Promise<KitsuEpisode[]> => {
    try {
        const response = await fetch(
            `${BASE_URL}/anime/${animeId}/episodes?sort=number&page[limit]=20`
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch episodes for anime ID: ${animeId}`);
        }

        const data: KitsuListResponse<KitsuEpisode> = await response.json();
        return data.data;
    } catch (error) {
        console.error(`Error fetching episodes for anime ID ${animeId}:`, error);
        return [];
    }
};

// Fetch anime categories
export const fetchAnimeCategories = async (animeId: string): Promise<KitsuCategory[]> => {
    try {
        const response = await fetch(
            `${BASE_URL}/anime/${animeId}/categories`
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch categories for anime ID: ${animeId}`);
        }

        const data: KitsuListResponse<KitsuCategory> = await response.json();
        return data.data;
    } catch (error) {
        console.error(`Error fetching categories for anime ID ${animeId}:`, error);
        return [];
    }
};

// Fetch all categories
export const fetchAllCategories = async (): Promise<KitsuCategory[]> => {
    try {
        // Categories are paginated, we'll get the first page with a good amount
        const response = await fetch(
            `${BASE_URL}/categories?page[limit]=40&sort=title`
        );

        if (!response.ok) {
            console.error(`API error: ${response.status} ${response.statusText}`);
            throw new Error('Failed to fetch categories');
        }

        const data: KitsuListResponse<KitsuCategory> = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
};
// Search anime by category
export const searchAnimeByCategory = async (categoryId: string): Promise<KitsuAnime[]> => {
    try {
        const response = await fetch(
            `${BASE_URL}/categories/${categoryId}/anime?page[limit]=20`
        );

        if (!response.ok) {
            console.error(`API error: ${response.status} ${response.statusText}`);
            throw new Error(`Failed to fetch anime for category ID: ${categoryId}`);
        }

        const data: KitsuListResponse<KitsuAnime> = await response.json();
        return data.data;
    } catch (error) {
        console.error(`Error fetching anime for category ID ${categoryId}:`, error);
        return [];
    }
};