// src/services/communityService.js
import { db } from "./firebase/client";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  limit,
  serverTimestamp
} from "firebase/firestore";

/**
 * REAL-TIME subscription to discussions (with proper query construction)
 */
export const subscribeToDiscussions = (callback, options = {}) => {
  const { category, limitCount = 50 } = options;
  
  // Construct query constraints properly
  const constraints = [orderBy("createdAt", "desc")];
  
  if (category && category !== "all") {
    constraints.push(where("category", "==", category));
  }
  
  constraints.push(limit(limitCount));
  
  const q = query(collection(db, "discussions"), ...constraints);

  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(data);
  }, (error) => {
    console.error('Error fetching discussions:', error);
    callback([]);
  });
};

/**
 * Get single discussion by ID
 */
export const getDiscussionById = async (id) => {
  const snapshot = await getDoc(doc(db, "discussions", id));
  return snapshot.exists()
    ? { id: snapshot.id, ...snapshot.data() }
    : null;
};

/**
 * Create new discussion
 */
export const createDiscussion = async (data) => {
  return await addDoc(collection(db, 'discussions'), {
    title: data.title,
    description: data.description || data.content || '',
    content: data.content || data.description || '',
    createdBy: data.createdBy || data.authorId,
    createdByName: data.authorName || data.createdByName,
    authorId: data.authorId || data.createdBy,
    authorName: data.authorName || data.createdByName,
    role: data.role || 'student',
    category: data.category || 'General',
    tags: data.tags || [],
    timestamp: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    likes: 0,
    replies: 0,
    views: 0,
    isPinned: false,
  })
}

/**
 * Update discussion
 */
export const updateDiscussion = async (id, data) => {
  await updateDoc(doc(db, "discussions", id), {
    ...data,
    updatedAt: serverTimestamp()
  });
};

/**
 * Delete discussion
 */
export const deleteDiscussion = async (id) => {
  await deleteDoc(doc(db, "discussions", id));
};

/**
 * Like/Unlike discussion
 */
export const toggleDiscussionLike = async (discussionId, userId, isLiked) => {
  const discussionRef = doc(db, "discussions", discussionId);
  const discussion = await getDoc(discussionRef);
  
  if (discussion.exists()) {
    const currentLikes = discussion.data().likes || 0;
    const likedBy = discussion.data().likedBy || [];
    
    if (isLiked) {
      // Unlike
      await updateDoc(discussionRef, {
        likes: Math.max(0, currentLikes - 1),
        likedBy: likedBy.filter(id => id !== userId)
      });
    } else {
      // Like
      await updateDoc(discussionRef, {
        likes: currentLikes + 1,
        likedBy: [...likedBy, userId]
      });
    }
  }
};

/**
 * REAL-TIME subscription to events
 */
export const subscribeToEvents = (callback, options = {}) => {
  const { upcomingOnly = true } = options;
  let q = query(
    collection(db, "events"),
    orderBy("date", "asc")
  );

  if (upcomingOnly) {
    const now = new Date().toISOString();
    q = query(q, where("date", ">=", now));
  }

  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(data);
  });
};

/**
 * Get single event by ID
 */
export const getEventById = async (id) => {
  const snapshot = await getDoc(doc(db, "events", id));
  return snapshot.exists()
    ? { id: snapshot.id, ...snapshot.data() }
    : null;
};

/**
 * Create new event
 */
export const createEvent = async (data) => {
  return await addDoc(collection(db, "events"), {
    ...data,
    createdAt: serverTimestamp(),
    attendees: [],
    attendeeCount: 0
  });
};

/**
 * Update event
 */
export const updateEvent = async (id, data) => {
  await updateDoc(doc(db, "events", id), data);
};

/**
 * Join event
 */
export const joinEvent = async (eventId, userId) => {
  const eventRef = doc(db, "events", eventId);
  const event = await getDoc(eventRef);
  
  if (event.exists()) {
    const attendees = event.data().attendees || [];
    if (!attendees.includes(userId)) {
      await updateDoc(eventRef, {
        attendees: [...attendees, userId],
        attendeeCount: attendees.length + 1
      });
    }
  }
};

/**
 * Leave event
 */
export const leaveEvent = async (eventId, userId) => {
  const eventRef = doc(db, "events", eventId);
  const event = await getDoc(eventRef);
  
  if (event.exists()) {
    const attendees = event.data().attendees || [];
    await updateDoc(eventRef, {
      attendees: attendees.filter(id => id !== userId),
      attendeeCount: Math.max(0, attendees.length - 1)
    });
  }
};

/**
 * REAL-TIME subscription to study groups
 */
const groupsCollection = () => collection(db, 'groups')

export const subscribeToStudyGroups = (callback) => {
  const q = query(groupsCollection(), orderBy('createdAt', 'desc'))

  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }))
      callback(data)
    },
    () => callback([]),
  )
}

export const createStudyGroup = async (data) => {
  return await addDoc(groupsCollection(), {
    ...data,
    createdAt: serverTimestamp(),
    members: [],
    memberCount: 0,
  })
}

export const joinStudyGroup = async (groupId, userId) => {
  const groupRef = doc(db, 'groups', groupId)
  const group = await getDoc(groupRef);
  
  if (group.exists()) {
    const members = group.data().members || [];
    if (!members.includes(userId)) {
      await updateDoc(groupRef, {
        members: [...members, userId],
        memberCount: members.length + 1
      });
    }
  }
};

