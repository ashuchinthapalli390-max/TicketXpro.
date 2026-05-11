import { collection, addDoc, getFirestore, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export const SAMPLE_DATA = [
  // Sathi Leelavathi - May 2026 Focus
  {
    title: "Sathi Leelavathi",
    description: "A high-comedy family entertainer exploring modern relationship dynamics.",
    category: "movie",
    district: "Visakhapatnam",
    dateTime: "2026-05-09T11:00:00",
    venue: "Sri Lakshmi Talkies",
    imageUrl: "https://img.youtube.com/vi/IxMv1cFjPYs/maxresdefault.jpg",
    price: 250,
    tags: ["Comedy", "Family"],
    rating: 4.5,
    metadata: { 
      language: "Telugu", 
      duration: "135m", 
      trailerUrl: "https://www.youtube.com/watch?v=IxMv1cFjPYs", 
      showtimes: ["11:00 AM", "02:30 PM", "06:30 PM", "09:45 PM"] 
    }
  },
  {
    title: "Razor",
    description: "Intense genre-defining action thriller with raw sequences.",
    category: "movie",
    district: "Visakhapatnam",
    dateTime: "2026-05-09T11:00:00",
    venue: "Ravi Talkies",
    imageUrl: "https://img.youtube.com/vi/RMCnnmEMNUY/maxresdefault.jpg",
    price: 200,
    tags: ["Action", "Thriller"],
    rating: 4.2,
    metadata: { 
      language: "Telugu", 
      duration: "140m", 
      trailerUrl: "https://www.youtube.com/watch?v=RMCnnmEMNUY", 
      showtimes: ["11:00 AM", "02:45 PM", "06:45 PM", "09:45 PM"] 
    }
  },
  {
    title: "Kara",
    description: "1990s-set heist thriller with grounded realistic action.",
    category: "movie",
    district: "Visakhapatnam",
    dateTime: "2026-05-09T11:00:00",
    venue: "Rama Devi Theatre",
    imageUrl: "https://img.youtube.com/vi/A8pullOCFGI/maxresdefault.jpg",
    price: 220,
    tags: ["Heist", "Thriller"],
    rating: 4.8,
    metadata: { 
      language: "Telugu", 
      duration: "145m", 
      trailerUrl: "https://www.youtube.com/watch?v=A8pullOCFGI", 
      showtimes: ["11:00 AM", "02:45 PM", "06:45 PM", "09:45 PM"] 
    }
  },
  // Adding more regional mappings...
  {
    title: "Harudu",
    description: "Traditional police encounter narrative with mass appeal.",
    category: "movie",
    district: "Visakhapatnam",
    dateTime: "2026-05-09T11:00:00",
    venue: "Sharadha 35MM A/C Theatre",
    imageUrl: "https://img.youtube.com/vi/yzcBo_KBXlQ/maxresdefault.jpg",
    price: 180,
    tags: ["Action", "Police"],
    rating: 4.1,
    metadata: { 
      language: "Telugu", 
      duration: "150m", 
      trailerUrl: "https://www.youtube.com/watch?v=yzcBo_KBXlQ", 
      showtimes: ["11:00 AM", "02:30 PM", "06:30 PM", "09:30 PM"] 
    }
  },
  {
    title: "GaayaPadda Simham",
    description: "Urban neo-noir targeting sophisticated cinephiles.",
    category: "movie",
    district: "Visakhapatnam",
    dateTime: "2026-05-09T11:00:00",
    venue: "Kinnera Theatre",
    imageUrl: "https://img.youtube.com/vi/rLAttlz6N-E/maxresdefault.jpg",
    price: 250,
    tags: ["Neo-noir", "Thriller"],
    rating: 4.4,
    metadata: { 
      language: "Telugu", 
      duration: "145m", 
      trailerUrl: "https://www.youtube.com/watch?v=rLAttlz6N-E", 
      showtimes: ["11:00 AM", "02:45 PM", "06:45 PM", "09:45 PM"] 
    }
  },
  // Krishna District (Vijayawada)
  {
    title: "Sathi Leelavathi",
    category: "movie",
    district: "Vijayawada",
    venue: "Cinepolis Power One Mall",
    imageUrl: "https://img.youtube.com/vi/IxMv1cFjPYs/maxresdefault.jpg",
    price: 300,
    tags: ["Comedy"],
    rating: 4.5,
    metadata: { language: "Telugu", duration: "135m", trailerUrl: "https://www.youtube.com/watch?v=IxMv1cFjPYs", showtimes: ["10:30 AM", "04:30 PM", "10:00 PM"] }
  },
  {
    title: "Razor",
    category: "movie",
    district: "Vijayawada",
    venue: "Cinepolis PVP Square",
    imageUrl: "https://img.youtube.com/vi/RMCnnmEMNUY/maxresdefault.jpg",
    price: 280,
    tags: ["Action"],
    rating: 4.2,
    metadata: { language: "Telugu", duration: "140m", trailerUrl: "https://www.youtube.com/watch?v=RMCnnmEMNUY", showtimes: ["11:30 AM", "05:30 PM", "10:30 PM"] }
  },
  // Guntur District
  {
    title: "Harudu",
    category: "movie",
    district: "Guntur",
    venue: "Jle Cinemas",
    imageUrl: "https://img.youtube.com/vi/yzcBo_KBXlQ/maxresdefault.jpg",
    price: 200,
    tags: ["Action"],
    rating: 4.1,
    metadata: { language: "Telugu", duration: "150m", trailerUrl: "https://www.youtube.com/watch?v=yzcBo_KBXlQ", showtimes: ["11:00 AM", "02:45 PM", "06:45 PM", "09:45 PM"] }
  },
  // Hyderabad (Nizam)
  {
    title: "Sathi Leelavathi",
    category: "movie",
    district: "Hyderabad",
    venue: "PVR Cinemas Hyderabad Central Mall",
    imageUrl: "https://img.youtube.com/vi/IxMv1cFjPYs/maxresdefault.jpg",
    price: 350,
    tags: ["Comedy"],
    rating: 4.5,
    metadata: { language: "Telugu", duration: "135m", trailerUrl: "https://www.youtube.com/watch?v=IxMv1cFjPYs", showtimes: ["10:00 AM", "01:30 PM", "04:30 PM", "07:30 PM", "10:30 PM"] }
  },
  {
    title: "Razor",
    category: "movie",
    district: "Hyderabad",
    venue: "Amb Cinemas Saraths City Capital Mall",
    imageUrl: "https://img.youtube.com/vi/RMCnnmEMNUY/maxresdefault.jpg",
    price: 450,
    tags: ["Action"],
    rating: 4.2,
    metadata: { language: "Telugu", duration: "140m", trailerUrl: "https://www.youtube.com/watch?v=RMCnnmEMNUY", showtimes: ["11:00 AM", "02:45 PM", "06:00 PM", "09:15 PM", "11:45 PM"] }
  },
  // Warangal
  {
    title: "Harudu",
    category: "movie",
    district: "Warangal",
    venue: "Asian Cinemas Sridevi Mall",
    imageUrl: "https://img.youtube.com/vi/yzcBo_KBXlQ/maxresdefault.jpg",
    price: 180,
    tags: ["Action"],
    rating: 4.1,
    metadata: { language: "Telugu", duration: "150m", trailerUrl: "https://www.youtube.com/watch?v=yzcBo_KBXlQ", showtimes: ["11:00 AM", "02:30 PM", "06:30 PM", "09:45 PM"] }
  },
  {
    title: "GaayaPadda Simham",
    category: "movie",
    district: "Warangal",
    venue: "Asian Ashoka Air-Conditioned",
    imageUrl: "https://img.youtube.com/vi/rLAttlz6N-E/maxresdefault.jpg",
    price: 200,
    tags: ["Neo-noir"],
    rating: 4.4,
    metadata: { language: "Telugu", duration: "145m", trailerUrl: "https://www.youtube.com/watch?v=rLAttlz6N-E", showtimes: ["11:00 AM", "02:45 PM", "06:45 PM", "09:45 PM"] }
  },
  // Khammam
  {
    title: "Kara",
    category: "movie",
    district: "Khammam",
    venue: "Vinoda 4K Dolby Atmos",
    imageUrl: "https://img.youtube.com/vi/A8pullOCFGI/maxresdefault.jpg",
    price: 220,
    tags: ["Heist"],
    rating: 4.8,
    metadata: { language: "Telugu", duration: "145m", trailerUrl: "https://www.youtube.com/watch?v=A8pullOCFGI", showtimes: ["11:00 AM", "02:15 PM", "06:15 PM", "09:30 PM"] }
  },
  // Nizamabad
  {
    title: "Sathi Leelavathi",
    category: "movie",
    district: "Nizamabad",
    venue: "PVR Venu Mall",
    imageUrl: "https://img.youtube.com/vi/IxMv1cFjPYs/maxresdefault.jpg",
    price: 250,
    tags: ["Comedy"],
    rating: 4.5,
    metadata: { language: "Telugu", duration: "135m", trailerUrl: "https://www.youtube.com/watch?v=IxMv1cFjPYs", showtimes: ["11:00 AM", "02:30 PM", "06:30 PM", "09:45 PM"] }
  },
  // Narasaraopet Specific
  {
    title: "Sathi Leelavathi",
    category: "movie",
    district: "Narasaraopet",
    venue: "Geetha Multiplex (Kasu Central Mall)",
    imageUrl: "https://img.youtube.com/vi/IxMv1cFjPYs/maxresdefault.jpg",
    price: 300,
    tags: ["Comedy"],
    rating: 4.5,
    metadata: { language: "Telugu", duration: "135m", showtimes: ["11:15 AM", "02:30 PM", "06:15 PM", "09:30 PM"] }
  },
  {
    title: "Razor",
    category: "movie",
    district: "Narasaraopet",
    venue: "Saradambha Theatre",
    imageUrl: "https://img.youtube.com/vi/RMCnnmEMNUY/maxresdefault.jpg",
    price: 150,
    tags: ["Action"],
    rating: 4.2,
    metadata: { language: "Telugu", duration: "140m", showtimes: ["11:00 AM", "02:00 PM", "06:00 PM", "09:00 PM"] }
  },
  {
    title: "Kara",
    category: "movie",
    district: "Narasaraopet",
    venue: "Eswar Mahal Deluxe",
    imageUrl: "https://img.youtube.com/vi/A8pullOCFGI/maxresdefault.jpg",
    price: 180,
    tags: ["Heist"],
    rating: 4.8,
    metadata: { language: "Telugu", duration: "145m", showtimes: ["11:00 AM", "02:15 PM", "06:15 PM", "09:30 PM"] }
  },
  {
    title: "Harudu",
    category: "movie",
    district: "Narasaraopet",
    venue: "Sri Krishna Cinema Hall",
    imageUrl: "https://img.youtube.com/vi/yzcBo_KBXlQ/maxresdefault.jpg",
    price: 120,
    tags: ["Action"],
    rating: 4.1,
    metadata: { language: "Telugu", duration: "150m", showtimes: ["11:00 AM", "02:30 PM", "06:30 PM", "09:45 PM"] }
  },
  {
    title: "GaayaPadda Simham",
    category: "movie",
    district: "Narasaraopet",
    venue: "Geetha Multiplex (Kasu Central Mall)",
    imageUrl: "https://img.youtube.com/vi/rLAttlz6N-E/maxresdefault.jpg",
    price: 300,
    tags: ["Neo-noir"],
    rating: 4.4,
    metadata: { language: "Telugu", duration: "145m", showtimes: ["11:00 AM", "02:45 PM", "06:45 PM", "09:45 PM"] }
  },
  {
    title: "Interstellar",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    category: "movie",
    district: "Hyderabad",
    dateTime: "2026-05-10T14:00:00",
    venue: "PVR Cinemas Hyderabad Central Mall",
    imageUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1000",
    price: 350,
    tags: ["Sci-Fi", "Drama"],
    rating: 4.9,
    metadata: { 
      language: "English", 
      duration: "169m", 
      trailerUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E", 
      showtimes: ["10:00 AM", "02:00 PM", "06:00 PM", "10:00 PM"] 
    }
  },
  {
    title: "The Dark Knight",
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    category: "movie",
    district: "Visakhapatnam",
    dateTime: "2026-05-10T18:30:00",
    venue: "Rama Devi Theatre",
    imageUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=1000",
    price: 250,
    tags: ["Action", "Crime", "Drama"],
    rating: 5.0,
    metadata: { 
      language: "English", 
      duration: "152m", 
      trailerUrl: "https://www.youtube.com/watch?v=EXeTwQWaywY", 
      showtimes: ["11:00 AM", "03:00 PM", "07:00 PM", "11:00 PM"] 
    }
  },
  {
    title: "Inception",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    category: "movie",
    district: "Hyderabad",
    dateTime: "2026-05-10T15:30:00",
    venue: "Amb Cinemas Saraths City Capital Mall",
    imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1000",
    price: 450,
    tags: ["Action", "Sci-Fi", "Thriller"],
    rating: 4.8,
    metadata: { 
      language: "English", 
      duration: "148m", 
      trailerUrl: "https://www.youtube.com/watch?v=YoHD9XEInc0", 
      showtimes: ["12:00 PM", "04:00 PM", "08:00 PM", "11:30 PM"] 
    }
  },
  // Upcoming Movies
  {
    title: "IIZ: Zombies",
    description: "Funny zombies take over the campus in this unique zom-com.",
    category: "movie",
    district: "Hyderabad",
    dateTime: "2026-05-14T11:30:00",
    venue: "PVR Cinemas Hyderabad Central Mall",
    imageUrl: "https://img.youtube.com/vi/ACBF0KCoLRY/maxresdefault.jpg",
    price: 300,
    tags: ["Horror", "Comedy"],
    rating: 4.3,
    metadata: { 
      language: "Telugu", 
      duration: "130m", 
      trailerUrl: "https://www.youtube.com/watch?v=ACBF0KCoLRY",
      releaseDate: "2026-05-14"
    }
  },
  {
    title: "Drishyam 3",
    description: "The return of the intelligent family man caught in a new web.",
    category: "movie",
    district: "Hyderabad",
    dateTime: "2026-05-20T11:45:00",
    venue: "Amb Cinemas Saraths City Capital Mall",
    imageUrl: "https://img.youtube.com/vi/JJITo4T1AGQ/maxresdefault.jpg",
    price: 400,
    tags: ["Crime", "Thriller"],
    rating: 5.0,
    metadata: { 
      language: "Telugu", 
      duration: "160m", 
      trailerUrl: "https://www.youtube.com/watch?v=JJITo4T1AGQ",
      releaseDate: "2026-05-20"
    }
  },
  // Tirupati
  {
    title: "Sathi Leelavathi",
    category: "movie",
    district: "Tirupati",
    venue: "PGR Cinemas",
    imageUrl: "https://img.youtube.com/vi/IxMv1cFjPYs/maxresdefault.jpg",
    price: 350,
    tags: ["Comedy"],
    rating: 4.5,
    metadata: { language: "Telugu", duration: "135m", showtimes: ["11:00 AM", "02:30 PM", "06:30 PM", "09:45 PM"] }
  },
  // Kakinada
  {
    title: "Razor",
    category: "movie",
    district: "East Godavari",
    venue: "Sudharshan 4K",
    imageUrl: "https://img.youtube.com/vi/RMCnnmEMNUY/maxresdefault.jpg",
    price: 250,
    tags: ["Action"],
    rating: 4.2,
    metadata: { language: "Telugu", duration: "140m", showtimes: ["11:00 AM", "02:45 PM", "06:45 PM", "09:45 PM"] }
  },
  // Rajahmundry
  {
    title: "Kara",
    category: "movie",
    district: "East Godavari",
    venue: "Satyam Theatre",
    imageUrl: "https://img.youtube.com/vi/A8pullOCFGI/maxresdefault.jpg",
    price: 220,
    tags: ["Heist"],
    rating: 4.8,
    metadata: { language: "Telugu", duration: "145m", showtimes: ["11:00 AM", "02:45 PM", "06:45 PM", "09:45 PM"] }
  },
  // Kurnool
  {
    title: "Harudu",
    category: "movie",
    district: "Kurnool",
    venue: "Inox Anand Complex",
    imageUrl: "https://img.youtube.com/vi/yzcBo_KBXlQ/maxresdefault.jpg",
    price: 280,
    tags: ["Action"],
    rating: 4.1,
    metadata: { language: "Telugu", duration: "150m", showtimes: ["11:00 AM", "02:30 PM", "06:30 PM", "09:30 PM"] }
  },
  // Kadapa
  {
    title: "GaayaPadda Simham",
    category: "movie",
    district: "Kadapa",
    venue: "Ravi 70MM",
    imageUrl: "https://img.youtube.com/vi/rLAttlz6N-E/maxresdefault.jpg",
    price: 200,
    tags: ["Neo-noir"],
    rating: 4.4,
    metadata: { language: "Telugu", duration: "145m", showtimes: ["11:00 AM", "02:45 PM", "06:45 PM", "09:45 PM"] }
  },
  // Ongole
  {
    title: "Sathi Leelavathi",
    category: "movie",
    district: "Ongole",
    venue: "Satyam Multiplex",
    imageUrl: "https://img.youtube.com/vi/IxMv1cFjPYs/maxresdefault.jpg",
    price: 300,
    tags: ["Comedy"],
    rating: 4.5,
    metadata: { language: "Telugu", duration: "135m", showtimes: ["11:00 AM", "02:30 PM", "06:30 PM", "09:45 PM"] }
  },
  // Srikakulam
  {
    title: "Sathi Leelavathi",
    category: "movie",
    district: "Srikakulam",
    venue: "Srinivasa Mahal",
    imageUrl: "https://img.youtube.com/vi/IxMv1cFjPYs/maxresdefault.jpg",
    price: 150,
    tags: ["Comedy"],
    rating: 4.5,
    metadata: { language: "Telugu", duration: "135m", showtimes: ["11:00 AM", "02:15 PM", "06:15 PM", "09:30 PM"] }
  },
  // Anantapur
  {
    title: "Razor",
    category: "movie",
    district: "Anantapur",
    venue: "Ramesh Theatre",
    imageUrl: "https://img.youtube.com/vi/RMCnnmEMNUY/maxresdefault.jpg",
    price: 180,
    tags: ["Action"],
    rating: 4.2,
    metadata: { language: "Telugu", duration: "140m", showtimes: ["11:00 AM", "02:30 PM", "06:30 PM", "09:30 PM"] }
  },
  // Nalgonda
  {
    title: "Kara",
    category: "movie",
    district: "Nalgonda",
    venue: "Venkateswara Theatre",
    imageUrl: "https://img.youtube.com/vi/A8pullOCFGI/maxresdefault.jpg",
    price: 160,
    tags: ["Heist"],
    rating: 4.8,
    metadata: { language: "Telugu", duration: "145m", showtimes: ["11:00 AM", "02:15 PM", "06:15 PM", "09:30 PM"] }
  }
];

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function seedDatabase() {
  // Check if user is admin
  const user = auth.currentUser;
  if (!user || user.email !== 'noorshamshshaik40@gmail.com') {
    console.warn("Seeding attempted without admin authorization. Please log in first.");
    return;
  }

  try {
    // Clear Nodes
    const collRef = collection(db, 'nodes');
    let existingDocs;
    try {
      existingDocs = await getDocs(collRef);
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'nodes');
    }

    for (const d of existingDocs!.docs) {
      try {
        await deleteDoc(doc(db, 'nodes', d.id));
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, `nodes/${d.id}`);
      }
    }
    
    for (const item of SAMPLE_DATA) {
      try {
        await addDoc(collRef, item);
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, 'nodes');
      }
    }

    // Clear Movie Details
    const detailsRef = collection(db, 'movie_details');
    let detailSnap;
    try {
      detailSnap = await getDocs(detailsRef);
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'movie_details');
    }
    for (const d of detailSnap!.docs) {
      try {
        await deleteDoc(doc(db, 'movie_details', d.id));
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, `movie_details/${d.id}`);
      }
    }

    // Get Unique Movies for details
    const uniqueMovies = Array.from(new Set(SAMPLE_DATA.filter(n => n.category === 'movie').map(m => m.title)))
      .map(title => SAMPLE_DATA.find(m => m.title === title)!);

    const movieDetailMap: { [title: string]: string } = {};

    for (const movieItem of uniqueMovies) {
      try {
        const detailDoc = await addDoc(detailsRef, {
          title: movieItem.title,
          synopsis: movieItem.description || "",
          trailerUrl: movieItem.metadata?.trailerUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ",
          cast: ["Featured Star", "Supporting Actor"],
          director: "Acclaimed Director",
          duration: movieItem.metadata?.duration || "150m",
          genre: movieItem.tags || ["Action"],
          rating: movieItem.rating || 4.5,
          imageUrl: movieItem.imageUrl,
          releaseDate: movieItem.metadata?.releaseDate || "2026-05-09",
          language: movieItem.metadata?.language || "Telugu",
          backdropUrl: movieItem.imageUrl,
          price: movieItem.price
        });
        movieDetailMap[movieItem.title] = detailDoc.id;
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, 'movie_details');
      }
    }

    // Clear Theaters
    const theatersRef = collection(db, 'theaters');
    let theaterSnap;
    try {
      theaterSnap = await getDocs(theatersRef);
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'theaters');
    }
    for (const d of theaterSnap!.docs) {
      try {
        await deleteDoc(doc(db, 'theaters', d.id));
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, `theaters/${d.id}`);
      }
    }

    const sampleTheaters = [
      // Visakhapatnam
      { name: "Sri Lakshmi Talkies", city: "Visakhapatnam", address: "Chodavaram, Visakhapatnam", coordinates: { lat: 17.8329, lng: 82.9351 }, amenities: ["DTS", "Standard Seats"] },
      { name: "Ravi Talkies", city: "Visakhapatnam", address: "Ravikamatham, Visakhapatnam", coordinates: { lat: 17.8878, lng: 82.8091 }, amenities: ["Standard Seats"] },
      { name: "Rama Devi Theatre", city: "Visakhapatnam", address: "Suryabagh, Visakhapatnam", coordinates: { lat: 17.7126, lng: 83.3006 }, amenities: ["4K Projection", "Parking"] },
      { name: "Sharadha 35MM A/C Theatre", city: "Visakhapatnam", address: "Visakhapatnam City, Visakhapatnam", coordinates: { lat: 17.7100, lng: 83.3000 }, amenities: ["4K Laser", "Dolby Atmos"] },
      { name: "Kinnera Theatre", city: "Visakhapatnam", address: "Maddilapalem, Visakhapatnam", coordinates: { lat: 17.7300, lng: 83.3200 }, amenities: ["Dolby Atmos", "Recliners"] },
      
      // Vijayawada (Krishna)
      { name: "Cinepolis Power One Mall", city: "Vijayawada", address: "Bunder Road, Vijayawada", coordinates: { lat: 16.5050, lng: 80.6480 }, amenities: ["Multiplex", "Food Court", "IMAX"] },
      { name: "Cinepolis PVP Square", city: "Vijayawada", address: "MG Road, Vijayawada", coordinates: { lat: 16.5100, lng: 80.6400 }, amenities: ["Multiplex", "Parking", "Cafe"] },
      
      // Guntur
      { name: "Jle Cinemas", city: "Guntur", address: "Palakaluru Road, Guntur", coordinates: { lat: 16.3067, lng: 80.4365 }, amenities: ["4K Projection", "Premium Seating"] },
      
      // Hyderabad
      { name: "PVR Cinemas Hyderabad Central Mall", city: "Hyderabad", address: "Punjagutta, Hyderabad", coordinates: { lat: 17.4260, lng: 78.4530 }, amenities: ["Multiplex", "PXL Screen", "Cafe"] },
      { name: "Amb Cinemas Saraths City Capital Mall", city: "Hyderabad", address: "Kondapur, Hyderabad", coordinates: { lat: 17.4580, lng: 78.3610 }, amenities: ["Luxury Seats", "VIP Lounge", "4K Dolby"] },

      // Warangal
      { name: "Asian Ashoka Air-Conditioned", city: "Warangal", address: "Hanamkonda, Warangal", coordinates: { lat: 17.9689, lng: 79.5941 }, amenities: ["DTS", "Standard Seats"] },
      { name: "Asian Cinemas Sridevi Mall", city: "Warangal", address: "Bus Stand Road, Hanamkonda", coordinates: { lat: 17.9750, lng: 79.6000 }, amenities: ["DTS", "Standard"] },
      { name: "Venkatrama 70MM 2k Barco Laser", city: "Warangal", address: "Narsampet Road, Warangal", coordinates: { lat: 17.9700, lng: 79.6000 }, amenities: ["2K Barco Laser", "Dolby Atmos"] },

      // Khammam
      { name: "Vinoda 4K Dolby Atmos", city: "Khammam", address: "Mamillagudem, Khammam", coordinates: { lat: 17.2473, lng: 80.1514 }, amenities: ["4K Dolby Atmos", "Premium Seating"] },
      { name: "Asian Srinivasa", city: "Khammam", address: "Braman Bazar, Khammam", coordinates: { lat: 17.2500, lng: 80.1550 }, amenities: ["DTS", "Standard"] },

      // Nizamabad
      { name: "PVR Venu Mall", city: "Nizamabad", address: "Pragathi Nagar, Nizamabad", coordinates: { lat: 18.6725, lng: 78.0941 }, amenities: ["4K Projection", "Cafe", "Parking"] },
      { name: "Asian Geetha Multiplex", city: "Nizamabad", address: "Shivaji Nagar, Nizamabad", coordinates: { lat: 18.6700, lng: 78.1000 }, amenities: ["4K Projection", "Parking"] },

      // Mahabubnagar
      { name: "AVD Cinemas", city: "Mahabubnagar", address: "Boyapalle Rural, Mahabubnagar", coordinates: { lat: 16.7333, lng: 77.9833 }, amenities: ["4K", "Dolby"] },

      // Narasaraopet
      { name: "Geetha Multiplex (Kasu Central Mall)", city: "Narasaraopet", address: "Opp. GBR Hospital, Near Palnadu Bus Stand, Narasaraopet, 522601", coordinates: { lat: 16.2367, lng: 80.0524 }, amenities: ["IMAX", "Recliner Seats", "Food Court", "Parking"] },
      { name: "Saradambha Theatre", city: "Narasaraopet", address: "Bus Stand Road, Prakash Nagar, Narasaraopet, 522601", coordinates: { lat: 16.2340, lng: 80.0490 }, amenities: ["4K Projection", "Parking", "Snacks"] },
      { name: "Eswar Mahal Deluxe", city: "Narasaraopet", address: "Chilakaluripet Road, Venkat Reddy Nagar, Narasaraopet, 522601", coordinates: { lat: 16.2280, lng: 80.0510 }, amenities: ["Dolby Atmos", "Standard Seats"] },
      { name: "Sri Krishna Cinema Hall", city: "Narasaraopet", address: "Market Area, Narasaraopet", coordinates: { lat: 16.2300, lng: 80.0500 }, amenities: ["DTS", "Standard"] },

      // Tirupati
      { name: "PGR Cinemas", city: "Tirupati", address: "Renigunta Road, Tirupati", coordinates: { lat: 13.6288, lng: 79.4192 }, amenities: ["Multiplex", "4K Dolby Atmos", "Cafe"] },
      
      // East Godavari
      { name: "Sudharshan 4K", city: "East Godavari", address: "Kakinada, East Godavari", coordinates: { lat: 16.9891, lng: 82.2475 }, amenities: ["4K Projection", "Parking"] },
      { name: "Satyam Theatre", city: "East Godavari", address: "Rajahmundry, East Godavari", coordinates: { lat: 17.0005, lng: 81.7729 }, amenities: ["Dolby Atmos", "Recliners"] },
      
      // Kurnool
      { name: "Inox Anand Complex", city: "Kurnool", address: "Kurnool City, Kurnool", coordinates: { lat: 15.8267, lng: 78.0333 }, amenities: ["Multiplex", "IMAX", "Food Court"] },
      
      // Kadapa
      { name: "Ravi 70MM", city: "Kadapa", address: "Kadapa City, Kadapa", coordinates: { lat: 14.4673, lng: 78.8242 }, amenities: ["DTS", "Standard Seats"] },
      
      // Ongole (Prakasam)
      { name: "Satyam Multiplex", city: "Ongole", address: "Ongole Center, Prakasam", coordinates: { lat: 15.5057, lng: 80.0499 }, amenities: ["Multiplex", "4K", "Cafe"] },

      // Srikakulam
      { name: "Srinivasa Mahal", city: "Srikakulam", address: "Srikakulam Town", coordinates: { lat: 18.2949, lng: 83.8938 }, amenities: ["DTS", "Standard"] },
      
      // Anantapur
      { name: "Ramesh Theatre", city: "Anantapur", address: "Anantapur City", coordinates: { lat: 14.6819, lng: 77.6006 }, amenities: ["Dolby Atmos", "Standard"] },
      
      // Nalgonda
      { name: "Venkateswara Theatre", city: "Nalgonda", address: "Nalgonda Town", coordinates: { lat: 17.0500, lng: 79.2667 }, amenities: ["DTS", "Standard"] }
    ];

    const theaterMap: { [name: string]: string } = {};
    for (const t of sampleTheaters) {
      try {
        const docRef = await addDoc(theatersRef, t);
        theaterMap[t.name] = docRef.id;
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, 'theaters');
      }
    }

    // Clear Schedules
    const schedulesRef = collection(db, 'schedules');
    let scheduleSnap;
    try {
      scheduleSnap = await getDocs(schedulesRef);
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'schedules');
    }
    for (const d of scheduleSnap!.docs) {
      try {
        await deleteDoc(doc(db, 'schedules', d.id));
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, `schedules/${d.id}`);
      }
    }

    // Seed Schedules from SAMPLE_DATA mappings
    for (const item of SAMPLE_DATA) {
      const mId = movieDetailMap[item.title];
      const tId = theaterMap[item.venue];
      
      if (mId && tId) {
        const showtimes = item.metadata?.showtimes || ["11:00 AM", "02:30 PM", "06:30 PM", "09:45 PM"];
        for (const time of showtimes) {
          try {
            await addDoc(schedulesRef, {
              movieId: mId,
              theaterId: tId,
              time: time,
              format: "2D",
              price: item.price || 150,
              bookedSeats: []
            });
          } catch (e) {
            handleFirestoreError(e, OperationType.CREATE, 'schedules');
          }
        }
      }
    }

    console.log("Database overhaul complete. NRS nodes synchronized.");

  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

