import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, onSnapshot, writeBatch, deleteDoc } from 'firebase/firestore';
import { Employee, OffSiteRequest, OffSitePlan } from '../types';

const firebaseConfig = {
  projectId: "gen-lang-client-0385270180",
  appId: "1:245860944057:web:5eca59b99ad2d8e4d3b368",
  apiKey: "AIzaSyAXihs_2GN9JrpfJWyy5V7kuoAMishSLCk",
  authDomain: "gen-lang-client-0385270180.firebaseapp.com",
  storageBucket: "gen-lang-client-0385270180.firebasestorage.app",
  messagingSenderId: "245860944057"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-kkoffsitegoapp-440e54cb-f828-4bd0-acc9-cf8cb67cd46a");

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Helper to save/update an employee in Firestore
export async function saveEmployee(employee: Employee) {
  const path = `employees/${employee.id.trim().toUpperCase()}`;
  try {
    const docRef = doc(db, 'employees', employee.id.trim().toUpperCase());
    await setDoc(docRef, employee, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Helper to save/update a request in Firestore
export async function saveRequest(request: OffSiteRequest) {
  const path = `requests/${request.id}`;
  try {
    const docRef = doc(db, 'requests', request.id);
    await setDoc(docRef, request, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Helper to save/update a plan in Firestore
export async function savePlan(plan: OffSitePlan) {
  const path = `plans/${plan.id}`;
  try {
    const docRef = doc(db, 'plans', plan.id);
    await setDoc(docRef, plan, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Helper to delete an employee from Firestore
export async function deleteEmployeeFromFirestore(id: string) {
  const path = `employees/${id.trim().toUpperCase()}`;
  try {
    const docRef = doc(db, 'employees', id.trim().toUpperCase());
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Helper to delete a request from Firestore
export async function deleteRequestFromFirestore(id: string) {
  const path = `requests/${id}`;
  try {
    const docRef = doc(db, 'requests', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Helper to delete a plan from Firestore
export async function deletePlanFromFirestore(id: string) {
  const path = `plans/${id}`;
  try {
    const docRef = doc(db, 'plans', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
