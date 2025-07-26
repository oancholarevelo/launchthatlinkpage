// src/app/[profile]/page.tsx
import LinkPageTemplate from '@/components/LinkPageTemplate';
import { notFound } from 'next/navigation';
import { Profile as ProfileData, blankProfile, getProfile } from '@/lib/profiles';
import { Metadata } from 'next';
import AnimatedBackground from '@/components/AnimatedBackground';

type PublicProfilePageProps = {
  params: { profile: string };
};

export async function generateMetadata({ params }: PublicProfilePageProps): Promise<Metadata> {
  const profile = await getProfile(params.profile);

  if (!profile) {
    return {
      title: 'Profile Not Found',
    }
  }

  return {
    title: `${profile.name} | Linkpage`,
    description: profile.bio,
    openGraph: {
      title: profile.name,
      description: profile.bio,
      images: [
        {
          url: profile.imageUrl || 'https://launchthatlinkpage.vercel.app/og-image.png', // Provide a default image URL
          width: 1200,
          height: 630,
        },
      ],
    },
  }
}


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

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  if (params.profile === 'edit' || params.profile === 'custom') {
    notFound();
  }
  
  const profileData = await getProfile(params.profile);

  if (!profileData) {
    notFound();
  }

  const safeTheme = { ...blankProfile.theme, ...profileData.theme };
  safeTheme.background = { ...blankProfile.theme.background, ...safeTheme.background };
  safeTheme.overlay = { ...blankProfile.theme.overlay, ...safeTheme.overlay };
  
  const backgroundStyle = getBackgroundStyle(safeTheme.background);

  return (
    <div className="relative flex justify-center items-center min-h-screen p-4 sm:p-8 overflow-hidden" style={backgroundStyle}>
        {safeTheme.overlay.enabled && safeTheme.overlay.imageUrl && (
          <AnimatedBackground imageUrl={safeTheme.overlay.imageUrl} />
        )}
        <div className="relative z-10 w-full max-w-[380px]">
             <LinkPageTemplate 
                data={{...profileData, theme: safeTheme }} 
                profileKey={params.profile}
             />
        </div>
    </div>
  );
}
