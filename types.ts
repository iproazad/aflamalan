export interface Movie {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  backdropUrl:string;
  year: number;
  genres: string[];
  servers: { name: string; url: string; quality: string }[];
  downloadUrl?: string;
  trailerUrl?: string;
  createdAt: any; // Firebase Timestamp
  isKurdish?: boolean;
}

export interface Category {
  id: string;
  name: string;
}

export interface Admin {
  id: string; // Firestore document ID
  uid: string;
  email: string;
}

export interface FirebaseUser {
  uid: string;
  email: string | null;
  isAdmin: boolean;
}