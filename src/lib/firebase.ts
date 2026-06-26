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

// Helper to save/update an employee in Firestore
export async function saveEmployee(employee: Employee) {
  const docRef = doc(db, 'employees', employee.id.trim().toUpperCase());
  await setDoc(docRef, employee, { merge: true });
}

// Helper to save/update a request in Firestore
export async function saveRequest(request: OffSiteRequest) {
  const docRef = doc(db, 'requests', request.id);
  await setDoc(docRef, request, { merge: true });
}

// Helper to save/update a plan in Firestore
export async function savePlan(plan: OffSitePlan) {
  const docRef = doc(db, 'plans', plan.id);
  await setDoc(docRef, plan, { merge: true });
}

// Helper to delete an employee from Firestore
export async function deleteEmployeeFromFirestore(id: string) {
  const docRef = doc(db, 'employees', id.trim().toUpperCase());
  await deleteDoc(docRef);
}

// Helper to delete a request from Firestore
export async function deleteRequestFromFirestore(id: string) {
  const docRef = doc(db, 'requests', id);
  await deleteDoc(docRef);
}

// Helper to delete a plan from Firestore
export async function deletePlanFromFirestore(id: string) {
  const docRef = doc(db, 'plans', id);
  await deleteDoc(docRef);
}
