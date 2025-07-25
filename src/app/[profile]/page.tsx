// src/app/[profile]/page.tsx
import LinkPageTemplate from '@/components/LinkPageTemplate';
import { notFound } from 'next/navigation';
import { Profile as ProfileData, blankProfile, getProfile } from '@/lib/profiles';

// Define a type for the component's props
type PublicProfilePageProps = {
  params: { profile: string };
};

const getBackgroundStyle = (background: ProfileData['theme']['background']) => {
  switch (background.type) {
    case 'gradient':
      return { backgroundImage: `linear-gradient(to bottom right, ${background.gradientStart}, ${background.gradientEnd})` };
    case 'image':
      return { backgroundImage: `url(${background.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    case 'solid':
    default:
      return { backgroundColor: background.color };
  }
};

// Use the new type for the component's props
export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  if (params.profile === 'edit' || params.profile === 'custom') {
    notFound();
  }
  
  // Directly call the function to get data from Firestore
  const profileData = await getProfile(params.profile);

  if (!profileData) {
    notFound();
  }

  const safeTheme = { ...blankProfile.theme, ...profileData.theme };
  safeTheme.background = { ...blankProfile.theme.background, ...safeTheme.background };
  
  const backgroundStyle = getBackgroundStyle(safeTheme.background);

  return (
    <div className="flex justify-center items-center min-h-screen p-4" style={backgroundStyle}>
        <div className="w-full max-w-[380px] mx-auto rounded-2xl shadow-2xl overflow-hidden aspect-[9/19.5]">
            <div className="overflow-y-auto h-full">
                <LinkPageTemplate 
                  data={{...profileData, theme: safeTheme }} 
                  profileKey={params.profile} 
                />
            </div>
        </div>
    </div>
  );
}