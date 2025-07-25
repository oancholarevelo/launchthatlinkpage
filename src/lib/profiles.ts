// src/lib/profiles.ts
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface Background {
  type: 'solid' | 'gradient' | 'image';
  color: string;
  gradientStart: string;
  gradientEnd: string;
  imageUrl: string;
}

export interface Theme {
  background: Background;
  containerColor: string; // NEW: Add property for the mobile container's color
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
  uid: string; // NEW: The Firebase Auth User ID of the owner
  name: string;
  bio: string;
  imageUrl: string;
  links: Link[];
  theme: Theme;
}

// getProfile and saveProfile functions remain exactly the same
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
  const docRef = doc(db, 'profiles', key);
  await setDoc(docRef, data, { merge: true });
};

// UPDATE: Add a default value for the new containerColor
export const blankProfile: Profile = {
  uid: '',
  name: '',
  bio: '',
  imageUrl: '',
  links: [{ title: 'My Website', url: '' }],
  theme: {
    background: {
      type: 'solid',
      color: '#f1f5f9', // Page Background
      gradientStart: '#e0e7ff',
      gradientEnd: '#e0f2fe',
      imageUrl: '',
    },
    containerColor: '#ffffff', // NEW: Default container color is white
    buttonColor: '#ffffff',
    textColor: '#4f46e5',
    buttonStyle: 'rounded',
    font: 'inter',
  }
};