import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc,
  doc,
  getFirestore,
  orderBy,
  limit,
  startAt,
  endAt,
  updateDoc,
  arrayUnion
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { MovieDetail, Theater, Schedule } from '../types';

export type BookingCategory = "movie" | "bus" | "train" | "flight" | "hotel" | "event" | "doctor" | "restaurant" | "turf";

export interface BookingNode {
  id: string;
  title: string;
  description?: string;
  category: BookingCategory;
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

import { SAMPLE_DATA } from './seedService';

const movieDetailMap: { [title: string]: string } = {};

export async function getMovieDetail(movieId: string): Promise<MovieDetail | null> {
  // First try Firestore
  const movieRef = doc(db, 'movie_details', movieId);
  try {
    const snap = await getDoc(movieRef);
    if (snap.exists()) return { id: snap.id, ...snap.data() } as MovieDetail;
  } catch (e) {
    console.warn("Firestore MovieDetail fetch failed. Using local fallback if applicable.", e);
  }

  // Handle local_ IDs or fallback search in SAMPLE_DATA
  let node: any = null;
  if (movieId.startsWith('local_')) {
    const index = parseInt(movieId.split('_')[1]);
    node = SAMPLE_DATA[index];
  } else {
    // Attempt to match by title or ID-like string
    node = SAMPLE_DATA.find(n => 
      n.title.toLowerCase() === movieId.toLowerCase() || 
      n.title.replace(/\s+/g, '-').toLowerCase() === movieId.toLowerCase()
    );
  }

  if (node && node.category === 'movie') {
    return {
      id: movieId,
      title: node.title,
      genre: node.tags || [],
      rating: node.rating || 0,
      duration: node.metadata?.duration || '120m',
      imageUrl: node.imageUrl,
      trailerUrl: node.metadata?.trailerUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      synopsis: node.description || 'Premium exhibition experience in Andhra Pradesh.',
      director: node.metadata?.director || 'Acclaimed Director',
      cast: node.metadata?.cast || ["Featured Talent", "Supporting Star"],
      releaseDate: node.dateTime || "2026-05-09",
      language: node.metadata?.language || 'Telugu',
      backdropUrl: node.imageUrl,
      price: node.price || 150
    } as MovieDetail;
  }

  return null;
}

export async function getTheatersByCity(city: string): Promise<Theater[]> {
  const theatersRef = collection(db, 'theaters');
  try {
    const q = query(theatersRef, where('city', '==', city));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Theater));
    }
  } catch (e) {
    console.warn("Firestore theaters fetch failed. Using sample theaters.", e);
  }

  // Fallback: search in SAMPLE_DATA for unique venues in this city
  const districtNodes = SAMPLE_DATA.filter(n => n.district === city && n.category === 'movie');
  const uniqueVenues = [...new Set(districtNodes.map(n => n.venue))];

  if (uniqueVenues.length > 0) {
    return uniqueVenues.map((venue, idx) => ({
      id: `t_${city}_${idx}`,
      name: venue,
      address: `Premium Cinema in ${city}`,
      city: city,
      amenities: ['4K Projection', 'Dolby Atmos', 'Parking']
    }));
  }

  // Final fallback (Narasaraopet defaults)
  return [
    { id: 't1', name: 'Geetha Multiplex (Kasu Central Mall)', address: 'Opp. GBR Hospital, Near Palnadu Bus Stand, Narasaraopet, 522601', city: city, amenities: ['IMAX', 'Recliner Seats', 'Food Court', 'Parking'] },
    { id: 't2', name: 'Saradambha Theatre', address: 'Bus Stand Road, Prakash Nagar, Narasaraopet, 522601', city: city, amenities: ['4K Projection', 'Parking', 'Snacks'] },
    { id: 't3', name: 'Eswar Mahal Deluxe', address: 'Chilakaluripet Road, Venkat Reddy Nagar, Narasaraopet, 522601', city: city, amenities: ['Dolby Atmos', 'Standard Seats'] },
    { id: 't4', name: 'Sri Krishna Cinema Hall', address: 'Market Area, Narasaraopet', city: city, amenities: ['DTS', 'Standard'] }
  ];
}

export async function getTheater(theaterId: string): Promise<Theater | null> {
  const theaterRef = doc(db, 'theaters', theaterId);
  try {
    const snap = await getDoc(theaterRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Theater;
    }
  } catch (e) {
    console.warn("Theater fetch failed.", e);
  }
  return null;
}

export async function getSchedulesByMovieAndCity(movieId: string, city: string): Promise<{
  theaterId: string;
  theaterName: string;
  timings: { id: string; time: string }[];
}[]> {
  const theaters = await getTheatersByCity(city);
  const theaterIds = theaters.map(t => t.id);
  
  if (theaterIds.length === 0) return [];

  const q = query(
    collection(db, 'schedules'),
    where('movieId', '==', movieId),
    where('theaterId', 'in', theaterIds)
  );

  const snap = await getDocs(q);
  const groups: Record<string, { id: string; time: string }[]> = {};
  
  snap.forEach(doc => {
    const data = doc.data();
    if (!groups[data.theaterId]) groups[data.theaterId] = [];
    groups[data.theaterId].push({ id: doc.id, time: data.time });
  });

  return theaters
    .filter(t => groups[t.id])
    .map(t => ({
      theaterId: t.id,
      theaterName: t.name,
      timings: groups[t.id].sort((a, b) => a.time.localeCompare(b.time))
    }));
}

export async function getSchedulesByCity(city: string): Promise<{
  theaters: Theater[];
  movies: MovieDetail[];
  schedules: Schedule[];
}> {
  const theaters = await getTheatersByCity(city);
  const theaterIds = theaters.map(t => t.id);
  
  if (theaterIds.length === 0) return { theaters: [], movies: [], schedules: [] };

  const schedulesRef = collection(db, 'schedules');
  const movieDetailsRef = collection(db, 'movie_details');

  let schedules: Schedule[] = [];
  try {
    const q = query(schedulesRef, where('theaterId', 'in', theaterIds));
    const snap = await getDocs(q);
    schedules = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Schedule));
  } catch (e) {
    console.warn("Schedules fetch by city failed.", e);
  }

  const movieIds = [...new Set(schedules.map(s => s.movieId))];
  let movies: MovieDetail[] = [];

  if (movieIds.length > 0) {
    try {
      // Fetch movies in chunks of 10 if necessary (Firestore in limit)
      for (let i = 0; i < movieIds.length; i += 10) {
        const chunk = movieIds.slice(i, i + 10);
        const mq = query(movieDetailsRef, where('__name__', 'in', chunk));
        const mSnap = await getDocs(mq);
        movies.push(...mSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MovieDetail)));
      }
    } catch (e) {
      console.warn("Movies fetch by city failed.", e);
    }
  }

  return { theaters, movies, schedules };
}

export async function getSchedules(movieId: string, theaterId: string): Promise<Schedule[]> {
  const schedulesRef = collection(db, 'schedules');
  try {
    const q = query(
      schedulesRef, 
      where('movieId', '==', movieId), 
      where('theaterId', '==', theaterId)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Schedule));
    }
  } catch (e) {
    console.warn("Firestore schedules fetch failed. Using sample schedules.", e);
  }

  // Fallback sample schedules
  return [
    { id: `s1_${theaterId}`, movieId, theaterId, time: '10:30 AM', format: '2D', price: 250, bookedSeats: [] },
    { id: `s2_${theaterId}`, movieId, theaterId, time: '02:00 PM', format: 'IMAX', price: 450, bookedSeats: [] },
    { id: `s3_${theaterId}`, movieId, theaterId, time: '06:30 PM', format: '2D', price: 250, bookedSeats: [] },
    { id: `s4_${theaterId}`, movieId, theaterId, time: '09:45 PM', format: '2D', price: 250, bookedSeats: [] }
  ];
}

export async function getScheduleDetail(scheduleId: string): Promise<Schedule | null> {
  const scheduleRef = doc(db, 'schedules', scheduleId);
  try {
    const snap = await getDoc(scheduleRef);
    if (snap.exists()) return { id: snap.id, ...snap.data() } as Schedule;
  } catch (e) {
    console.warn("Firestore schedule fetch failed. Using local fallback if applicable.", e);
  }

  // Fallback for local schedule IDs like s1_t1, s2_t1, etc.
  if (scheduleId.includes('_t')) {
    const parts = scheduleId.split('_');
    const type = parts[0]; // s1, s2...
    const theaterId = parts[1]; // t1, t2...
    
    const times: Record<string, string> = { s1: '10:30 AM', s2: '02:00 PM', s3: '06:30 PM', s4: '09:45 PM' };
    const formats: Record<string, string> = { s1: '2D', s2: '3D IMAX', s3: '2D', s4: '2D' };
    
    return {
      id: scheduleId,
      movieId: 'pending', // This will be passed or matched later
      theaterId: theaterId,
      time: times[type] || '12:00 PM',
      format: formats[type] || '2D',
      price: type === 's2' ? 450 : 250,
      bookedSeats: []
    } as Schedule;
  }

  return null;
}

export async function bookSeats(scheduleId: string, seats: string[]): Promise<void> {
  const scheduleRef = doc(db, 'schedules', scheduleId);
  try {
    await updateDoc(scheduleRef, {
      bookedSeats: arrayUnion(...seats)
    });
  } catch (e) {
    console.warn("Firestore bookSeats failed. Ignoring for local preview.", e);
  }
}

/**
 * Fetches nodes based on search query, category, or district.
 */
export async function searchBookingNodes(options: {
  searchTerm?: string;
  category?: BookingCategory;
  district?: string;
}): Promise<BookingNode[]> {
  try {
    const nodesRef = collection(db, 'nodes');
    let constraints = [];

    if (options.category) {
      constraints.push(where('category', '==', options.category));
    }
    
    if (options.district) {
      constraints.push(where('district', '==', options.district));
    }

    const q = query(nodesRef, ...constraints, limit(40));
    let results: BookingNode[] = [];
    
    try {
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() } as BookingNode);
      });
    } catch (e) {
      console.warn("Firestore fetch failed, possibly due to permissions. Using local data.", e);
    }

    // Fallback to local data if empty or failed
    if (results.length === 0) {
      let fallback = SAMPLE_DATA as any as BookingNode[];
      if (options.category) {
        fallback = fallback.filter(node => node.category === options.category);
      }
      if (options.district) {
        fallback = fallback.filter(node => node.district === options.district);
      }
      results = fallback.map((node, index) => ({ id: `local_${index}`, ...node }));
    }

    // Client-side text filtering as Firestore doesn't support full-text search easily without Algolia
    if (options.searchTerm) {
      const lowerSearch = options.searchTerm.toLowerCase();
      results = results.filter(node => 
        node.title.toLowerCase().includes(lowerSearch) || 
        node.category.toLowerCase().includes(lowerSearch) ||
        node.venue.toLowerCase().includes(lowerSearch) ||
        node.district.toLowerCase().includes(lowerSearch) ||
        node.tags?.some(tag => tag.toLowerCase().includes(lowerSearch))
      );
    }
    
    return results;
  } catch (error) {
    console.error("Error searching nodes: ", error);
    return [];
  }
}

/**
 * Legacy fetch for the filter component
 */
export async function fetchEntertainmentByDistrict(districtName: string, type: string): Promise<BookingNode[]> {
  return searchBookingNodes({ district: districtName, category: type as any });
}
