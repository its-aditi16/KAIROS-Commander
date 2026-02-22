import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

const INCIDENTS_COLLECTION = "incidents";

/**
 * Generate a human-readable incident ID like INC-491
 */
const generateIncidentId = () => {
  const num = Math.floor(400 + Math.random() * 600);
  return `INC-${num}`;
};

/**
 * Create a new incident in Firestore.
 * @param {Object} incidentData - Partial or full incident data.
 * @returns {Promise<string>} - Firestore document ID
 */
export const createIncident = async (incidentData) => {
  const incidentId = incidentData.incidentId || generateIncidentId();

  const docRef = await addDoc(collection(db, INCIDENTS_COLLECTION), {
    incidentId,
    title: incidentData.title || "Unknown Incident",
    severity: incidentData.severity || "MINOR",
    status: "Active",
    createdAt: serverTimestamp(),
    resolvedAt: null,
    durationMinutes: null,

    metricsSnapshot: incidentData.metricsSnapshot || {
      cpuUsage: 0,
      memoryUsage: 0,
      errorRate: 0,
      requestLatency: 0,
      activeUsers: 0,
    },

    timeline: incidentData.timeline || [],

    aiAnalysis: incidentData.aiAnalysis || {
      rootCause: "Pending analysis",
      impact: "Unknown",
      recommendation: "Investigating...",
    },
  });

  return docRef.id;
};

/**
 * Mark an incident as resolved.
 * @param {string} docId - Firestore document ID
 * @param {number} durationMinutes - How long the incident lasted
 */
export const resolveIncident = async (docId, durationMinutes) => {
  const ref = doc(db, INCIDENTS_COLLECTION, docId);
  await updateDoc(ref, {
    status: "Resolved",
    resolvedAt: serverTimestamp(),
    durationMinutes,
  });
};

/**
 * Fetch a single incident by its Firestore document ID.
 * @param {string} docId - Firestore document ID
 * @returns {Promise<Object|null>}
 */
export const getIncidentById = async (docId) => {
  const ref = doc(db, INCIDENTS_COLLECTION, docId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

/**
 * Real-time listener for all incidents, sorted newest first.
 * @param {Function} callback - Called with array of incident objects on every change
 * @returns {Function} unsubscribe function
 */
export const subscribeToIncidents = (callback) => {
  const q = query(
    collection(db, INCIDENTS_COLLECTION),
    orderBy("createdAt", "desc")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const incidents = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    callback(incidents);
  });

  return unsubscribe;
};

/**
 * Convenience wrapper — save a full incident snapshot to Firebase.
 * Equivalent to createIncident. Use when AI detects an anomaly.
 * @param {Object} incidentData
 * @returns {Promise<string>} Firestore document ID
 */
export const saveIncidentToFirebase = async (incidentData) => {
  return createIncident(incidentData);
};
