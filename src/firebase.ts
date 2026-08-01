/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch
} from 'firebase/firestore';

// Configuration from firebase-applet-config.json
const firebaseConfig = {
  projectId: "lunar-provider-240ks",
  appId: "1:762201962968:web:8adbd2338dd756c2bb9aad",
  apiKey: "AIzaSyDogCZ0PG3VnD5WqgRaz3euFDTRGT3GPMg",
  authDomain: "lunar-provider-240ks.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-40926d70-8e77-402d-a2da-cc7462af498f",
  storageBucket: "lunar-provider-240ks.firebasestorage.app",
  messagingSenderId: "762201962968"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);

/**
 * Save data using custom sync key or ID
 */
export async function saveUserDataWithSyncCode(syncCode: string, data: {
  accounts: any[];
  transactions: any[];
  dailyExpenses: any[];
  employees: any[];
  employeeTransactions: any[];
  homeNeeds: any[];
}) {
  try {
    const cleanId = syncCode.trim().replace(/[/\\.#$]/g, '_');
    const userDocRef = doc(db, 'users', cleanId);
    await setDoc(userDocRef, {
      accounts: data.accounts,
      transactions: data.transactions,
      dailyExpenses: data.dailyExpenses,
      employees: data.employees,
      employeeTransactions: data.employeeTransactions,
      homeNeeds: data.homeNeeds,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving data to Firestore via sync code", error);
    throw error;
  }
}

/**
 * Load data using custom sync key or ID
 */
export async function loadUserDataWithSyncCode(syncCode: string) {
  try {
    const cleanId = syncCode.trim().replace(/[/\\.#$]/g, '_');
    const userDocRef = doc(db, 'users', cleanId);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error loading data from Firestore via sync code", error);
    throw error;
  }
}

export const saveUserDataToCloud = saveUserDataWithSyncCode;
export const loadUserDataFromCloud = loadUserDataWithSyncCode;
