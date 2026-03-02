export interface User {
    id: string;
    email: string;
    username: string;
    nickname?: string;
    smallerProfilePic?: string;
    biggerProfilePic?: string;
    smallerProfilePicKey?: string;
    biggerProfilePicKey?: string;
    createdAt: string;
    updatedAt: string;
    ratings?: Array<{
        userId: string;
        bookId: string;
        score: number;
        createdAt: string;
    }>;
    comments?: Array<{
        id: string;
        text: string;
        createdAt: string;
        bookId: string;
    }>;
    haveReadIt?: Array<{
        id: string;
        bookId: string;
        addedAt: string;
    }>;
    favoriteBooks?: Array<{
        userId: string;
        bookId: string;
    }>;
    favoriteAuthors?: Array<{
        userId: string;
        authorId: string;
    }>;
    favoriteGenres?: Array<{
        userId: string;
        genreId: string;
    }>;
}