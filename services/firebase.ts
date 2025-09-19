// This file can't use npm imports because of the user request.
// It relies on the global `firebase` object loaded from the CDN in index.html

// Fix: Add type declaration for the global firebase object from CDN
declare global {
  interface Window {
    firebase: any;
  }
}

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCVieKiFxFU3pqZbFNfZ6N3qZMGN69lLcw",
  authDomain: "filmzak.firebaseapp.com",
  projectId: "filmzak",
  storageBucket: "filmzak.appspot.com",
  messagingSenderId: "325454371315",
  appId: "1:325454371315:web:8193a67c9ab05457e21a86",
  measurementId: "G-Y0VZJ1M8XH"
};

// Initialize Firebase
const app = window.firebase.initializeApp(firebaseConfig);
const db = window.firebase.firestore();

// Configure offline persistence
try {
  db.settings({
    cacheSizeBytes: window.firebase.firestore.CACHE_SIZE_UNLIMITED
  });
  window.firebase.firestore().enablePersistence();
} catch (error) {
  if (error.code === 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled in one tab at a time.
    console.warn('Firebase persistence failed: multiple tabs open.');
  } else if (error.code === 'unimplemented') {
    // The current browser does not support all of the features required to enable persistence
     console.warn('Firebase persistence failed: browser not supported.');
  } else {
    console.error("Firebase persistence error: ", error);
  }
}


export const auth = app.auth();
export { db };
export const Timestamp = window.firebase.firestore.Timestamp;

const SUPER_ADMIN_UID = "yO8pzykKincc5zgbdJGdN6xISr03";

export const checkAdminStatus = async (user: any): Promise<boolean> => {
    if (!user) return false;
    
    // 1. Check if the user is the super admin
    if (user.uid === SUPER_ADMIN_UID) {
        return true;
    }

    // 2. Check if the user is in the 'admins' collection
    try {
        const adminDoc = await db.collection('admins').doc(user.uid).get();
        if (adminDoc.exists) {
            return true;
        }
    } catch (error) {
        console.error("Error checking for admin privileges:", error);
    }
    
    return false;
};
