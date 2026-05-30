// src/services/achievementService.js
import { db } from "./firebase/client";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  orderBy
} from "firebase/firestore";

/**
 * REAL-TIME subscription to user achievements
 */
export const subscribeToUserAchievements = (userId, callback) => {
  const q = query(
    collection(db, "achievements"),
    where("userId", "==", userId),
    orderBy("earnedDate", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(data);
  });
};

/**
 * Get all achievements (for admin or to show available achievements)
 */
export const getAllAchievements = async () => {
  const snapshot = await getDocs(collection(db, "achievements"));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

/**
 * Get user's achievements (one-time fetch)
 */
export const getUserAchievements = async (userId) => {
  const q = query(
    collection(db, "achievements"),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

/**
 * Get achievement template by ID
 */
export const getAchievementTemplate = async (templateId) => {
  const snapshot = await getDoc(doc(db, "achievementTemplates", templateId));
  return snapshot.exists()
    ? { id: snapshot.id, ...snapshot.data() }
    : null;
};

/**
 * Create or update user achievement
 */
export const createOrUpdateAchievement = async (data) => {
  const { userId, templateId } = data;
  
  // Check if achievement already exists
  const q = query(
    collection(db, "achievements"),
    where("userId", "==", userId),
    where("templateId", "==", templateId)
  );
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    // Create new achievement
    return await addDoc(collection(db, "achievements"), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } else {
    // Update existing achievement
    const existingDoc = snapshot.docs[0];
    await updateDoc(doc(db, "achievements", existingDoc.id), {
      ...data,
      updatedAt: new Date().toISOString()
    });
    return existingDoc.id;
  }
};

/**
 * Mark achievement as earned
 */
export const markAchievementEarned = async (achievementId) => {
  await updateDoc(doc(db, "achievements", achievementId), {
    earned: true,
    earnedDate: new Date().toISOString(),
    progress: 100,
    updatedAt: new Date().toISOString()
  });
};

/**
 * Update achievement progress
 */
export const updateAchievementProgress = async (achievementId, progress) => {
  await updateDoc(doc(db, "achievements", achievementId), {
    progress: Math.min(100, Math.max(0, progress)),
    updatedAt: new Date().toISOString()
  });
};

/**
 * Get achievement templates (available achievements)
 */
export const getAchievementTemplates = async () => {
  const snapshot = await getDocs(collection(db, "achievementTemplates"));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

/**
 * Subscribe to achievement templates
 */
export const subscribeToAchievementTemplates = (callback) => {
  const q = query(
    collection(db, "achievementTemplates"),
    orderBy("points", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(data);
  });
};

