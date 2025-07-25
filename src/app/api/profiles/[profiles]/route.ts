// src/app/api/profiles/[profile]/route.ts
import { getProfile } from '@/lib/profiles';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { profile: string } }
) {
  try {
    const profileKey = params.profile;
    const profileData = await getProfile(profileKey);

    if (profileData) {
      return NextResponse.json(profileData);
    } else {
      return new NextResponse('Profile not found', { status: 404 });
    }
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}