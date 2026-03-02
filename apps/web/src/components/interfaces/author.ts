export interface Author {
    id: string;
    name: string;
    openLibraryId?: string;
    smallerProfilePic?: string;
    biggerProfilePic?: string;
    smallerProfilePicKey?: string;
    biggerProfilePicKey?: string;
    topWorks?: string;
    subjects?: string;
    bio?: string;
    birthDate?: string;
    nationality?: string;
    approveStatus: boolean;
    createdAt: string;
    updatedAt: string;
    books?: Array<{
        id: string;
        title: string;
        smallerCoverPic: string;
    }>;
    favoritedBy?: Array<{
        userId: string;
        authorId: string;
    }>;
}