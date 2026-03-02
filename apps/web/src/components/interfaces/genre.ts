export interface Genre {
    id: string;
    name: string;
    books?: Array<{
        bookId: string;
        genreId: string;
        book?: {
            id: string;
            title: string;
            smallerCoverPic: string;
        };
    }>;
    favoritedBy?: Array<{
        userId: string;
        genreId: string;
    }>;
}