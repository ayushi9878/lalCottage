// services/bookingService.js
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { db } from '../firebase';

// Collection name
const COLLECTION_NAME = 'bookingform';

// Create a new booking
export const createBooking = async (bookingData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...bookingData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'pending', // pending, confirmed, cancelled
      bookingId: generateBookingId()
    });
    
    console.log('Booking created with ID: ', docRef.id);
    return {
      success: true,
      id: docRef.id,
      message: 'Booking submitted successfully!'
    };
  } catch (error) {
    console.error('Error creating booking: ', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get all bookings
export const getAllBookings = async () => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME), 
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const bookings = [];
    
    querySnapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return {
      success: true,
      data: bookings
    };
  } catch (error) {
    console.error('Error fetching bookings: ', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get bookings by email
export const getBookingsByEmail = async (email) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('email', '==', email),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const bookings = [];
    
    querySnapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return {
      success: true,
      data: bookings
    };
  } catch (error) {
    console.error('Error fetching bookings by email: ', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Update booking status
export const updateBookingStatus = async (bookingId, status) => {
  try {
    const bookingRef = doc(db, COLLECTION_NAME, bookingId);
    await updateDoc(bookingRef, {
      status,
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      message: 'Booking status updated successfully!'
    };
  } catch (error) {
    console.error('Error updating booking status: ', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Delete booking
export const deleteBooking = async (bookingId) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, bookingId));
    return {
      success: true,
      message: 'Booking deleted successfully!'
    };
  } catch (error) {
    console.error('Error deleting booking: ', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Generate unique booking ID
const generateBookingId = () => {
  const prefix = 'BK';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

// Booking data structure for reference
export const bookingDataStructure = {
  // Personal Information
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  
  // Stay Details
  checkIn: '',
  checkOut: '',
  adults: '',
  children: '',
  infants: '',
  pets: '',
  specialRequests: '',
  
  // Menu Items
  selectedItems: [], // Array of {id, quantity}
  menuTotal: 0,
  
  // Pricing
  roomPrice: 0,
  totalAmount: 0,
  
  // System Fields (auto-generated)
  bookingId: '',
  status: 'pending',
  createdAt: null,
  updatedAt: null
};