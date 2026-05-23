# Firebase Project Setup Guide for Comment2DM

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `comment2dm` (or your preferred name)
4. Click **"Create project"**
5. Wait for project provisioning (takes ~30 seconds)

## Step 2: Register Web App

1. In Firebase Console, click the **Web icon** ( `</>` ) to add a web app
2. Enter app nickname: `Comment2DM Web`
3. Check **"Also set up Firebase Hosting"** (optional)
4. Click **"Register app"**
5. You'll see Firebase config object:
   ```js
   const firebaseConfig = {
     apiKey: "AIzaSyXXXXXXXXXXXX",
     authDomain: "comment2dm.firebaseapp.com",
     projectId: "comment2dm",
     storageBucket: "comment2dm.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123..."
   };
   ```
6. **Copy these values** into `.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXX
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=comment2dm.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=comment2dm
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=comment2dm.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
   ```

## Step 3: Enable Authentication

1. In Firebase Console, go to **Build > Authentication**
2. Click **"Get started"**
3. Under **Sign-in providers**, click **Email/Password**
4. Enable it, click **Save**

## Step 4: Create Firestore Database

1. Go to **Build > Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (we'll secure it later)
4. Select region closest to you (e.g., `asia-south1` for India)
5. Click **"Enable"**

## Step 5: Add Firebase Security Rules

Copy these rules into **Firestore Database > Rules** tab:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper: Check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper: Check if user owns this document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Helper: Check if user is admin
    function isAdmin() {
      return isAuthenticated() && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Users collection
    match /users/{userId} {
      // Users can read their own data, admins can read all
      allow read: if isOwner(userId) || isAdmin();
      // Users can create their own document during signup
      allow create: if isOwner(userId);
      // Users can update their own data, admins can update any
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }

    // Automations collection
    match /automations/{automationId} {
      // Users can read their own automations
      allow read: if isAuthenticated() && 
        (resource.data.userId == request.auth.uid || isAdmin());
      // Users can create automations for themselves
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid;
      // Users can update/delete their own
      allow update, delete: if isAuthenticated() && 
        (resource.data.userId == request.auth.uid || isAdmin());
    }

    // Activity logs collection
    match /activity_logs/{logId} {
      allow read: if isAuthenticated() && 
        (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if isAuthenticated();
      allow delete: if isAdmin();
    }

    // Analytics collection
    match /analytics/{analyticsId} {
      allow read: if isAuthenticated() && 
        (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if isAuthenticated();
    }

    // Instagram tokens collection (private)
    match /instagram_tokens/{userId} {
      allow read, write: if isOwner(userId);
    }

    // Usage logs collection
    match /usage_logs/{logId} {
      allow read: if isAdmin();
      allow create: if isAuthenticated();
    }
  }
}
```

## Step 6: Create Firestore Indexes

Go to **Firestore Database > Indexes** tab, click **"Add index"**, and create:

### Index 1: Automations by user
- Collection: `automations`
- Fields:
  - `userId`: Ascending
  - `createdAt`: Descending

### Index 2: Activity logs by user
- Collection: `activity_logs`
- Fields:
  - `userId`: Ascending
  - `timestamp`: Descending

### Index 3: Analytics by user
- Collection: `analytics`
- Fields:
  - `userId`: Ascending
  - `date`: Ascending

## Step 7: Create Initial Admin User

Since the app can create users via signup, follow these steps:

1. Start the app: `npm run dev`
2. Go to `http://localhost:9002/signup`
3. Create an account (e.g., `admin@comment2dm.com`)
4. In Firebase Console > **Firestore Database > Data** tab
5. Find the `users` collection > your new user document
6. Manually change the `role` field from `"user"` to `"admin"`
7. Now when you sign in, the **Admin Panel** link will appear in the sidebar

## Step 8: Verify Setup

Run these checks:
```
npm run dev
```
Visit `http://localhost:9002/signup` → Create account → Redirects to dashboard
Visit `http://localhost:9002/signin` → Login → Shows real user data
Create automation → Saved to Firestore → Appears in list

## Optional: Install Firebase Admin SDK (for server-side)

If you need server-side operations (comment detection webhook, etc.):
```bash
npm install firebase-admin
```
Then create `src/lib/firebase-admin.ts`:
```typescript
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);

const app = getApps().length === 0
  ? initializeApp({ credential: cert(serviceAccount) })
  : getApps()[0];

export const adminDb = getFirestore(app);
```

Get service account key from: **Project Settings > Service Accounts > Generate new private key**