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

export interface MainPageData {
	authors: AuthorSection[];
	books: BookSection[];
}

export interface AuthorSection {
	data: Author[];
	subtitle: string;
	title: string;
}

export interface BookSection {
	data: Book[];
	subtitle: string;
	title: string;
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
}

export interface Book {
	approveStatus: boolean;
	authorId: string;
	biggerCoverPic: string;
	biggerCoverPicKey: any;
	comments: any[];
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

interface BookGenreRelation {
	bookId: string;
	genreId: string;
	genre: {
		name: string;
	};
}
