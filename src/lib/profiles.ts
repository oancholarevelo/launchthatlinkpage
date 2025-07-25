// src/lib/profiles.ts
import { db } from './firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';

export interface Background {
  type: 'solid' | 'gradient' | 'image';
  color: string;
  gradientStart: string;
  gradientEnd: string;
  imageUrl: string;
}

export interface Theme {
  background: Background;
  containerColor: string;
  buttonColor: string;
  textColor: string;
  buttonStyle: 'rounded' | 'full' | 'square';
  font: 'inter' | 'lato' | 'source-code-pro' | 'poppins' | 'roboto-mono' | 'playfair-display' | 'lora';
}

export interface Link {
  title: string;
  url: string;
}

export interface Profile {
  uid: string;
  name: string;
  bio: string;
  imageUrl: string;
  links: Link[];
  theme: Theme;
}

export const getProfile = async (key: string): Promise<Profile | null> => {
  if (!key) return null;
  const docRef = doc(db, 'profiles', key);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as Profile;
  } else {
    return null;
  }
};

export const saveProfile = async (key: string, data: Profile): Promise<void> => {
  if (!key || key.trim() === '') {
    throw new Error("Profile key (username) cannot be empty.");
  }
   if (!data.uid) {
    throw new Error("User ID (uid) is required to save a profile.");
  }
  const docRef = doc(db, 'profiles', key);
  await setDoc(docRef, data, { merge: true });
};

export const getProfileKeyByUid = async (uid: string): Promise<string | null> => {
  if (!uid) return null;
  const profilesRef = collection(db, 'profiles');
  const q = query(profilesRef, where("uid", "==", uid), limit(1));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].id;
  }
  return null;
};

export const blankProfile: Profile = {
  uid: '',
  name: '',
  bio: '',
  imageUrl: '',
  links: [{ title: 'My Website', url: '' }],
  theme: {
    background: {
      type: 'solid',
      color: '#f1f5f9',
      gradientStart: '#e0e7ff',
      gradientEnd: '#e0f2fe',
      imageUrl: '',
    },
    containerColor: '#ffffff',
    buttonColor: '#ffffff',
    textColor: '#4f46e5',
    buttonStyle: 'rounded',
    font: 'inter',
  }
};