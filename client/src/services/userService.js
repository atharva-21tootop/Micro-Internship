// src/services/userService.js
import { db } from './firebase/client'
import { collection, doc, setDoc, getDoc, getDocs } from 'firebase/firestore'

// CREATE or UPDATE user
export const createOrUpdateUser = async (uid, data) => {
  try {
    await setDoc(doc(db, "users", uid), data, { merge: true });
  } catch (error) {
    console.error("Failed to save user profile:", error);
    throw error;
  }
};

// GET USER DATA
export const getUser = async (uid) => {
  try {
    const ref = doc(db, "users", uid);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
      return null;
    }

    return { id: snapshot.id, ...snapshot.data() }
  } catch (error) {
    console.error('Failed to fetch user:', error)
    return null
  }
}

export const getAllUsersFromFirestore = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'users'))
    const users = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }))
    console.log('Firestore users loaded:', users.length, users)
    return users
  } catch (error) {
    console.error('Failed to fetch all users from Firestore:', error)
    throw error
  }
}
