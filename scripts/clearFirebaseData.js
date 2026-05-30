/**
 * Script to delete all data from Firebase Firestore
 * Run with: node scripts/clearFirebaseData.js
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";

// Your Firebase config (same as in firebase.js)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// All collections to clear
const COLLECTIONS = [
  "users",
  "internships",
  "applications",
  "notifications",
  "achievements",
  "achievementTemplates",
  "discussions",
  "events",
  "studyGroups"
];

async function deleteCollection(collectionName) {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    let deletedCount = 0;

    for (const docSnapshot of querySnapshot.docs) {
      await deleteDoc(doc(db, collectionName, docSnapshot.id));
      deletedCount++;
    }

    console.log(`✓ ${collectionName}: Deleted ${deletedCount} documents`);
    return deletedCount;
  } catch (error) {
    console.error(`✗ Error deleting ${collectionName}:`, error.message);
    return 0;
  }
}

async function clearAllData() {
  console.log("🔄 Starting database cleanup...\n");

  let totalDeleted = 0;

  for (const collectionName of COLLECTIONS) {
    const count = await deleteCollection(collectionName);
    totalDeleted += count;
  }

  console.log(`\n✅ Cleanup complete! Total documents deleted: ${totalDeleted}`);
  process.exit(0);
}

clearAllData().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
