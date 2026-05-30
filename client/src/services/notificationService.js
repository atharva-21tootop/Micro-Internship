// src/services/notificationService.js
import { db } from "./firebase/client";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  limit,
  serverTimestamp,
  getDocs
} from "firebase/firestore";

const sortByCreatedAtDesc = (items) =>
  [...items].sort((a, b) => {
    const aTime = a.createdAt?.toDate?.() ?? new Date(a.createdAt || 0);
    const bTime = b.createdAt?.toDate?.() ?? new Date(b.createdAt || 0);
    return bTime - aTime;
  });

/**
 * Create a notification
 */
export const createNotification = async (data) => {
  try {
    return await addDoc(collection(db, "notifications"), {
      ...data,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
    throw error;
  }
};

/**
 * REAL-TIME subscription to user notifications (no composite index required)
 */
export const subscribeToUserNotifications = (userId, callback) => {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    limit(50)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));
      callback(sortByCreatedAtDesc(data));
    },
    (error) => {
      console.error("Notifications listener error:", error);
      callback([]);
    },
  );
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    await updateDoc(doc(db, "notifications", notificationId), {
      read: true,
      readAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (userId) => {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    where("read", "==", false)
  );
  const snapshot = await getDocs(q);

  const promises = snapshot.docs.map((item) =>
    updateDoc(item.ref, {
      read: true,
      readAt: serverTimestamp(),
    }),
  );

  await Promise.all(promises);
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (userId) => {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    where("read", "==", false)
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
};

/**
 * Delete notification
 */
export const deleteNotification = async (notificationId) => {
  await updateDoc(doc(db, "notifications", notificationId), {
    deleted: true,
    deletedAt: serverTimestamp(),
  });
};
