/**
 * TicketX Pro - Types
 */

export type BookingCategory = 
  | "Transportation" 
  | "Cinema & Events" 
  | "Venues" 
  | "Stays" 
  | "Luxury";

export interface Movie {
  id: string;
  title: string;
  description: string;
  category: "movie";
  district: string;
  dateTime: string;
  venue: string;
  imageUrl: string;
  price: number;
  tags?: string[];
  rating?: number;
  releaseYear?: number;
  metadata?: any;
}
//... will add other interfaces soon

export type SeatStatus = "available" | "booked" | "selected" | "reserved";

export interface Seat {
  id: string;
  row: string;
  number: string;
  status: SeatStatus;
  price: number;
}

export interface BookingEvent {
  id: string;
  title: string;
  category: BookingCategory;
  location: string;
  date: string;
  price: number;
  image: string;
  coordinates?: { lat: number; lng: number };
  availability?: number;
}

export interface Theater {
  id: string;
  name: string;
  address: string;
  city: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  amenities: string[];
}

export interface MovieDetail {
  id: string;
  title: string;
  synopsis: string;
  trailerUrl: string;
  cast: string[];
  director: string;
  duration: string;
  genre: string[];
  rating: number;
  imageUrl: string;
  price?: number;
  releaseDate?: string;
  language?: string;
  backdropUrl?: string;
}

export interface Schedule {
  id: string;
  movieId: string;
  theaterId: string;
  time: string;
  format: "2D" | "3D" | "IMAX" | "4DX";
  price: number;
  bookedSeats: string[];
}

export interface User {
  uid: string;
  email: string | null;
  name: string | null;
  photoURL: string | null;
  role: "user" | "vendor" | "admin";
}

export interface TeamMember {
  name: string;
  role: string;
  avatar: string;
  bio: string;
  socials?: {
    instagram?: string;
    whatsapp?: string;
    youtube?: string;
    github?: string;
  };
}
