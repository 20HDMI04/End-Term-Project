export interface Book {
    id: string;
    title: string;
    authorId?: string;
    googleBookId?: string;
    openLibraryId?: string;
    smallerCoverPic: string;
    biggerCoverPic: string;
    smallerCoverPicKey?: string;
    biggerCoverPicKey?: string;
    originalPublisher?: string;
    originalPublicationYear?: number;
    latestPublicationYear?: number;
    pageNumber?: number;
    description: string;
    createdAt: string;
    updatedAt: string;
    approveStatus: boolean;
    author?: {
        id: string;
        name: string;
    };
    genres?: Array<{
        genreId: string;
        genre: {
            id: string;
            name: string;
        };
    }>;
    statistics?: {
        id: string;
        averageRating: number;
        ratingCount: number;
        readersCount: number;
        wantToReadCount: number;
        reviewCount: number;
    };
}