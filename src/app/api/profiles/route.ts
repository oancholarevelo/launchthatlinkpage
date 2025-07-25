// src/app/api/profiles/route.ts
import { saveProfile, Profile } from '@/lib/profiles';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { key, data } = await request.json();

    if (!key || !data) {
      return new NextResponse('Missing profile key or data', { status: 400 });
    }

    // Ensure the UID from the request is included in the data to be saved
    const profileData: Profile = {
      ...data,
      uid: data.uid, // Explicitly include the uid
    };

    await saveProfile(key, profileData);
    return NextResponse.json({ message: 'Profile saved successfully', key });
  } catch (error) {
    console.error("Failed to save profile:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}