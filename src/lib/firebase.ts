import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
// @ts-ignore
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export async function testFirebaseConnection() {
  try {
    // Basic connectivity test
    await getDocFromServer(doc(db, '_connection_test', 'status'));
    console.log('Firebase connection successful');
  } catch (error) {
    console.error('Firebase connection failed:', error);
  }
}
