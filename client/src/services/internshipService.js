// src/services/internshipService.js
import { db, auth } from "./firebase/client";
import { fetchInternshipsFromApi, fetchInternshipByIdFromApi } from "@/services/api/internshipApi";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
  limit,
  where
} from "firebase/firestore";

/**
 * REAL-TIME subscription to internships (approved for public; all pending for org/admin)
 */
export const subscribeToInternships = (callback, pageSize = 50, showUnapproved = false) => {
  let firestoreUnsub = null
  let pollTimer = null

  const loadViaApi = async () => {
    try {
      const list = await fetchInternshipsFromApi({
        approvedOnly: !showUnapproved,
        limit: pageSize,
        pageSize,
      })
      callback(list)
    } catch (error) {
      console.error('Error fetching internships via API:', error)
      callback([])
    }
  }

  const startApiPolling = () => {
    loadViaApi()
    pollTimer = setInterval(loadViaApi, 30000)
    return () => {
      if (pollTimer) clearInterval(pollTimer)
    }
  }

  const startFirestore = () => {
    const q = showUnapproved
      ? query(
          collection(db, "internships"),
          orderBy("createdAt", "desc"),
          limit(pageSize)
        )
      : query(
          collection(db, "internships"),
          where("approved", "==", true),
          orderBy("createdAt", "desc"),
          limit(pageSize)
        );

    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(data);
    }, (error) => {
      console.error('Error fetching internships:', error);
      if (error?.code === 'permission-denied' && !pollTimer) {
        if (firestoreUnsub) {
          firestoreUnsub()
          firestoreUnsub = null
        }
        startApiPolling()
        return
      }
      callback([]);
    });
  }

  const init = () => {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
    if (firestoreUnsub) {
      firestoreUnsub()
      firestoreUnsub = null
    }

    // Guests on public pages: use server API (Admin SDK) until rules propagate or without auth
    if (!auth.currentUser) {
      return startApiPolling()
    }

    firestoreUnsub = startFirestore()
    return () => {
      if (firestoreUnsub) firestoreUnsub()
    }
  }

  let cleanup = () => {}
  auth.authStateReady().then(() => {
    cleanup = init() || (() => {})
  })

  return () => {
    cleanup()
    if (firestoreUnsub) firestoreUnsub()
    if (pollTimer) clearInterval(pollTimer)
  }
};

/**
 * ONE-TIME fetch with pagination
 */
export const getInternshipsPage = async (pageNumber = 1, pageSize = 50) => {
  try {
    const offset = (pageNumber - 1) * pageSize;
    const q = query(
      collection(db, "internships"),
      where("approved", "==", true),
      orderBy("createdAt", "desc"),
      limit(offset + pageSize)
    );
    
    const snapshot = await getDocs(q);
    const allDocs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      data: allDocs.slice(offset, offset + pageSize),
      total: allDocs.length,
      pageNumber,
      pageSize,
      hasMore: allDocs.length > (offset + pageSize)
    };
  } catch (error) {
    console.error('Error fetching internships page:', error);
    return {
      data: [],
      total: 0,
      pageNumber,
      pageSize,
      hasMore: false
    };
  }
};

/**
 * One-time fetch — optional (returns all approved internships)
 */
export const getAllInternships = async () => {
  try {
    const snapshot = await getDocs(query(
      collection(db, "internships"),
      where("approved", "==", true),
      limit(500)
    ));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching all internships:', error);
    return [];
  }
};

/**
 * Get a single internship by ID
 */
export const getInternshipById = async (id) => {
  try {
    const snapshot = await getDoc(doc(db, "internships", id));
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
  } catch (error) {
    if (error?.code !== 'permission-denied') {
      console.error('Error fetching internship:', error);
    }
  }

  try {
    return await fetchInternshipByIdFromApi(id);
  } catch (apiError) {
    console.error('Error fetching internship via API:', apiError);
    return null;
  }
};

/**
 * CREATE internship post (with validation)
 */
export const createInternship = async (data) => {
  try {
    const required = ['title', 'company', 'description', 'orgId'];
    for (const field of required) {
      if (!data[field]) throw new Error(`Missing required field: ${field}`);
    }

    return await addDoc(collection(db, "internships"), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      approved: false,
      views: 0
    });
  } catch (error) {
    console.error('Error creating internship:', error);
    throw error;
  }
};

/**
 * UPDATE internship
 */
export const updateInternship = async (id, data) => {
  try {
    await updateDoc(doc(db, "internships", id), {
      ...data,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating internship:', error);
    throw error;
  }
};

/**
 * INCREMENT views count
 */
export const incrementInternshipViews = async (id) => {
  try {
    const docRef = doc(db, "internships", id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return false;

    const currentViews = docSnap.data().views || 0;
    await updateDoc(docRef, {
      views: currentViews + 1,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error incrementing views:', error);
    return false;
  }
};
