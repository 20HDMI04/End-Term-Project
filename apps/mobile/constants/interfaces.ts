export interface GoogleUserInfo {
	data: Data;
	type: string;
}

export interface Data {
	idToken: string;
	scopes: string[];
	serverAuthCode: any;
	user: User;
}

export interface User {
	email: string;
	familyName: any;
	givenName: string;
	id: string;
	name: string;
	photo: string;
}

export interface Comment {
	id: string;
	text: string;
	createdAt: string | Date;
	userId: string;
	bookId: string;
	user: {
		nickname: string;
		smallerProfilePic: string | null;
		biggerProfilePic: string | null;
	};
	isLikedByMe: boolean;
	likeCount: number;
}

export interface Book {
	approveStatus: boolean;
	authorId: string;
	biggerCoverPic: string;
	biggerCoverPicKey: any;
	comments: Comment[];
	ratings?: Rating[];
	createdAt: string;
	description: string;
	genres: GenreInstance[];
	googleBookId: any;
	id: string;
	latestPublicationYear: number;
	openLibraryId: string;
	originalPublicationYear: number;
	originalPublisher: string;
	pageNumber: number;
	smallerCoverPic: string;
	smallerCoverPicKey: any;
	statistics: Statistics;
	title: string;
	updatedAt: string;

	isLikedByMe: boolean;
	totalLikes: number;
	author?: Author;
}

export interface Statistics {
	averageRating: number;
	bookId: string;
	id: string;
	ratingCount: number;
	readersCount: number;
	reviewCount: number;
	wantToReadCount: number;
}

export interface GenreInstance {
	bookId: string;
	genre: Genre;
	genreId: string;
}

export interface Genre {
	name: string;
}

export interface Author {
	approveStatus: boolean;
	biggerProfilePic: string;
	bio: string;
	birthDate: string;
	createdAt: string;
	id: string;
	name: string;
	nationality: string | null;
	openLibraryId: string;
	smallerProfilePic: string;
	subjects: string | null;
	topWorks: string | null;
	updatedAt: string;
	isFavorited?: boolean;

	// --- Bővítés a findOne függvényed miatt ---
	books?: Book[];
	_count?: {
		favoritedBy: number;
	};
	isFavoritedbyCurrentUser?: boolean;
}

export interface FindOneBookResponse {
	foundBook: Book;
	similarBooks: Book[];
}

export interface FindOneAuthorResponse extends Author {}

export interface MainPageData {
	authors: AuthorSection[];
	books: BookSection[];
}

export interface AuthorSection {
	data: Author[];
	subtitle: string;
	title: string;
	coverImage?: string;
}

export interface BookSection {
	data: Book[];
	subtitle: string;
	title: string;
	coverImage?: string;
}

export interface SearchResultBook {
	data: BookData[];
	meta: {
		total: number;
		page: number;
		lastPage: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
}

export interface BookData {
	id: string;
	title: string;
	authorId: string | null;
	googleBookId: string | null;
	openLibraryId: string | null;
	smallerCoverPic: string;
	biggerCoverPic: string;
	smallerCoverPicKey: string | null;
	biggerCoverPicKey: string | null;
	originalPublisher: string | null;
	originalPublicationYear: number | null;
	latestPublicationYear: number | null;
	pageNumber: number | null;
	description: string;
	approveStatus: boolean;
	createdAt: Date | string;
	updatedAt: Date | string;
	author: {
		id: string;
		name: string;
	} | null;
	statistics: {
		averageRating: number;
		ratingCount: number;
	} | null;
	genres: BookGenreRelation[];
	isFavorited: boolean;
	commentCount: number;
	favoriteCount: number;
}

interface Rating {
	bookId: string;
	userId: string;
	score: number;
	createdAt: string | Date;
}

interface BookGenreRelation {
	bookId: string;
	genreId: string;
	genre: {
		name: string;
	};
}

// --- FOR SEARCHING ---
export interface SearchGenre {
	id: string;
	name: string;
}

export interface FavoriteRelation {
	userId: string;
}

export interface SearchAuthor {
	id: string;
	name: string;
	smallerProfilePic: string | null;
	biggerProfilePic: string | null;
	topWorks: string | null;
	subjects: string | null;
	bio: string | null;
	birthDate: string | null;
	nationality: string | null;
	favoritedBy: FavoriteRelation[];
}

export interface SearchBook {
	id: string;
	title: string;
	authorId: string | null;
	author?: {
		name: string;
	};
	smallerCoverPic: string;
	biggerCoverPic: string;
	originalPublisher: string | null;
	originalPublicationYear: number | null;
	latestPublicationYear: number | null;
	pageNumber: number | null;
	description: string;
	approveStatus: boolean;
	favoritedBy: FavoriteRelation[];
}

export interface SearchEverythingResponse {
	books: SearchBook[];
	authors: SearchAuthor[];
	genres: SearchGenre[];
}
