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
