// src/services/applicationService.js
import { fetchStudentApplications } from '@/services/api/studentApi'
import { applyToInternshipApi } from '@/services/api/applicationsApi'
import { db, auth } from "./firebase/client";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  getDocs,
  doc,
  getDoc,
  serverTimestamp,
  limit,
  updateDoc
} from "firebase/firestore";

/**
 * VALIDATE application data before writing
 */
const validateApplicationData = (data) => {
  const requiredFields = ['internshipId', 'studentId', 'studentEmail', 'orgId', 'title'];
  
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      throw new Error(`Validation error: ${field} is required`);
    }
  }

  if (!data.studentEmail.includes('@')) {
    throw new Error('Invalid email format');
  }

  if (data.internshipId.length === 0 || data.studentId.length === 0) {
    throw new Error('Invalid student or internship ID');
  }
};

/**
 * CHECK if student already applied for this internship
 */
const checkDuplicateApplication = async (internshipId, studentId) => {
  const existing = await getDocs(query(
    collection(db, "applications"),
    where("internshipId", "==", internshipId),
    where("studentId", "==", studentId)
  ));

  if (!existing.empty) {
    throw new Error('You have already applied for this internship');
  }
};

/**
 * VERIFY internship exists and is approved
 */
const verifyInternshipExists = async (internshipId) => {
  const interneship = await getDoc(doc(db, "internships", internshipId));
  
  if (!interneship.exists()) {
    throw new Error('Internship not found or has been removed');
  }

  const internshipData = interneship.data();
  if (internshipData.approved === false) {
    throw new Error('This internship is not yet approved');
  }

  return internshipData;
};

/**
 * APPLY to an internship with full validation
 */
export const applyToInternship = async (data) => {
  try {
    validateApplicationData(data);

    try {
      const result = await applyToInternshipApi(data);
      return result;
    } catch (apiError) {
      if (apiError.message?.includes('already applied')) throw apiError;
    }

    await checkDuplicateApplication(data.internshipId, data.studentId);
    await verifyInternshipExists(data.internshipId);

    const applicationRef = await addDoc(collection(db, "applications"), {
      ...data,
      appliedAt: serverTimestamp(),
      status: "Pending",
      statusUpdatedAt: serverTimestamp(),
      progress: 0,
      approved: false,
      withdrawn: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return applicationRef;
  } catch (error) {
    console.error('Application submission error:', error);
    throw error;
  }
};

/**
 * REAL-TIME applications for a student with pagination
 */
export const subscribeToApplicationsByStudent = (studentId, callback, pageSize = 50) => {
  const q = query(
    collection(db, "applications"),
    where("studentId", "==", studentId),
    limit(pageSize)
  );

  return onSnapshot(q, (snapshot) => {
    const apps = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(apps);
  }, (error) => {
    console.error('Error fetching student applications:', error);
    if (typeof callback === 'function') {
      callback([], error);
    }
  });
};

/**
 * REAL-TIME applications for an organization
 */
export const subscribeToApplicationsByOrg = (orgId, callback, pageSize = 100) => {
  const q = query(
    collection(db, "applications"),
    where("orgId", "==", orgId),
    limit(pageSize)
  );

  return onSnapshot(q, (snapshot) => {
    const apps = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(apps);
  }, (error) => {
    console.error('Error fetching org applications:', error);
    callback([]);
  });
};

/**
 * One-time fetch for student (optional)
 */
export const getApplicationsByUser = async (uid) => {
  const q = query(collection(db, "applications"), where("studentId", "==", uid), limit(100));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const getStudentApplicationsEnriched = async () => {
  try {
    const data = await fetchStudentApplications()
    return data.applications || []
  } catch {
    const user = auth.currentUser
    if (!user) return []
    return getApplicationsByUser(user.uid)
  }
};

/**
 * WITHDRAW application (for students only)
 */
export const withdrawApplication = async (applicationId, studentId) => {
  try {
    const appRef = doc(db, "applications", applicationId);
    const appSnap = await getDoc(appRef);

    if (!appSnap.exists()) {
      throw new Error('Application not found');
    }

    const appData = appSnap.data();
    if (appData.studentId !== studentId) {
      throw new Error('You can only withdraw your own applications');
    }

    if (appData.status === "Accepted") {
      throw new Error('Cannot withdraw accepted applications. Contact the organization.');
    }

    // Use Firestore transaction to update
    await updateDoc(appRef, {
      status: "Withdrawn",
      withdrawn: true,
      withdrawnAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error('Error withdrawing application:', error);
    throw error;
  }
};
