// src/services/organizationService.js
import { db, auth } from "./firebase/client";
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
  serverTimestamp,
  limit
} from "firebase/firestore";

/**
 * VERIFY that current user owns this organization
 */
const verifyOrgOwnership = async (orgId) => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("Not authenticated");
  }
  if (currentUser.uid !== orgId) {
    throw new Error("Unauthorized: You do not have permission to perform this action");
  }
};

/**
 * Get organization by ID
 */
export const getOrganizationById = async (orgId) => {
  const snapshot = await getDoc(doc(db, "users", orgId));
  return snapshot.exists()
    ? { id: snapshot.id, ...snapshot.data() }
    : null;
};

/**
 * REAL-TIME subscription to organization's internships
 */
export const subscribeToOrgInternships = (orgId, callback) => {
  const q = query(
    collection(db, "internships"),
    where("orgId", "==", orgId),
    orderBy("createdAt", "desc"),
    limit(100)
  );

  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(data);
  }, (error) => {
    console.error('Error fetching org internships:', error);
    callback([]);
  });
};

/**
 * REAL-TIME subscription to organization's applications
 */
export const subscribeToOrgApplications = (orgId, callback) => {
  const q = query(
    collection(db, "applications"),
    where("orgId", "==", orgId),
    orderBy("appliedAt", "desc"),
    limit(200)
  );

  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(data);
  }, (error) => {
    console.error('Error fetching org applications:', error);
    callback([]);
  });
};

/**
 * Update application status WITH AUTHORIZATION
 */
export const updateApplicationStatus = async (applicationId, status, notes = "") => {
  try {
    const appRef = doc(db, "applications", applicationId);
    const appSnap = await getDoc(appRef);

    if (!appSnap.exists()) {
      throw new Error("Application not found");
    }

    const appData = appSnap.data();
    
    // Verify org ownership
    await verifyOrgOwnership(appData.orgId);

    // Validate status
    const validStatuses = ["Pending", "Accepted", "Rejected", "Withdrawn"];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    await updateDoc(appRef, {
      status,
      notes,
      updatedAt: serverTimestamp(),
      reviewedAt: serverTimestamp(),
      reviewedBy: auth.currentUser.uid
    });

    return true;
  } catch (error) {
    console.error('Error updating application status:', error);
    throw error;
  }
};

/**
 * Create new internship WITH VALIDATION
 */
export const createInternship = async (data) => {
  try {
    // Verify org ownership
    await verifyOrgOwnership(data.orgId);

    // Validate required fields
    const requiredFields = ['title', 'company', 'description', 'orgId'];
    for (const field of requiredFields) {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        throw new Error(`Validation error: ${field} is required`);
      }
    }

    const internshipData = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: data.status || "pending",
      approved: false,
      views: 0,
      applicationsCount: 0
    };

    const ref = await addDoc(collection(db, "internships"), internshipData);
    return ref;
  } catch (error) {
    console.error('Error creating internship:', error);
    throw error;
  }
};

/**
 * Update internship WITH AUTHORIZATION
 */
export const updateInternship = async (internshipId, data) => {
  try {
    const internRef = doc(db, "internships", internshipId);
    const internSnap = await getDoc(internRef);

    if (!internSnap.exists()) {
      throw new Error("Internship not found");
    }

    // Verify org ownership
    await verifyOrgOwnership(internSnap.data().orgId);

    await updateDoc(internRef, {
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
 * Delete internship WITH AUTHORIZATION
 */
export const deleteInternship = async (internshipId) => {
  try {
    const internRef = doc(db, "internships", internshipId);
    const internSnap = await getDoc(internRef);

    if (!internSnap.exists()) {
      throw new Error("Internship not found");
    }

    // Verify org ownership
    await verifyOrgOwnership(internSnap.data().orgId);

    await deleteDoc(internRef);
    return true;
  } catch (error) {
    console.error('Error deleting internship:', error);
    throw error;
  }
};

