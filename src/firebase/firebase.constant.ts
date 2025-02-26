import * as admin from 'firebase-admin';
export const FIREBASE_ADMIN = 'FIREBASE_ADMIN';

export interface IFirebaseApp extends admin.app.App {}
