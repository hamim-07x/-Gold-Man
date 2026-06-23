import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

// Check if we have firebase key
if (!fs.existsSync('./firebase-key.json') && !process.env.FIREBASE_PROJECT_ID) {
  console.log('No admin credentials found to clear DB, skipping script.');
  process.exit(0);
}

// Simple test to clear DB
console.log('Skipping real admin delete in preview script unless requested directly. Doing nothing to prevent error.');
