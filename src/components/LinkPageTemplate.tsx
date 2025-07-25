// src/components/LinkPageTemplate.tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Profile as ProfileData, blankProfile } from '@/lib/profiles';
import { Pencil } from 'lucide-react';

interface LinkPageTemplateProps {
  data: ProfileData;
  profileKey?: string;
}

const LinkPageTemplate = React.forwardRef<HTMLDivElement, LinkPageTemplateProps>(({ data, profileKey }, ref) => {
  
  const theme = { ...blankProfile.theme, ...data.theme };
  theme.background = { ...blankProfile.theme.background, ...theme.background };

  const getFontClass = (font: string) => {
    return `font-${font.replace(/ /g, '-').toLowerCase()}`;
  };
  
  const getButtonStyleClass = (style: string) => {
    switch(style) {
        case 'full': return 'rounded-full';
        case 'square': return 'rounded-none';
        default: return 'rounded-lg';
    }
  }

  return (
    <div 
      ref={ref} 
      className={`flex flex-col items-center p-6 sm:p-8 w-full min-h-full transition-colors duration-300 ${getFontClass(theme.font)}`}
      style={{ backgroundColor: theme.containerColor }}
    >
      <div className="text-center">
        {data.imageUrl ? (
          <Image 
            src={data.imageUrl} 
            alt={`${data.name}'s profile picture`} 
            width={96} height={96} 
            className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-white/50 shadow-lg"
          />
        ) : (
          <div className="w-24 h-24 rounded-full mx-auto bg-slate-300 border-4 border-white/50 shadow-lg flex items-center justify-center">
            <span className="text-slate-500 text-3xl font-bold">{data.name.charAt(0)}</span>
          </div>
        )}
        <h1 className="text-2xl font-bold text-slate-900 mt-4">{data.name}</h1>
        <p className="text-slate-600 mt-2 text-center max-w-xs">{data.bio}</p>
      </div>

      <div className="w-full mt-8 space-y-4">
        {data.links.map((link, index) => (
          <a 
            href={link.url}
            key={index}
            target="_blank"
            rel="noopener noreferrer"
            className={`block w-full p-4 text-center shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 ${getButtonStyleClass(theme.buttonStyle)}`}
            style={{ backgroundColor: theme.buttonColor, color: theme.textColor }}
          >
            <p className="font-semibold">{link.title}</p>
          </a>
        ))}
      </div>
      
      <div className="mt-auto pt-8 text-center space-y-3">
        {profileKey && (
          <Link href={`/edit/${profileKey}`} className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-indigo-600 font-semibold transition-colors">
            <Pencil size={12} />
            Edit this Page
          </Link>
        )}
        {/* UPDATED: Changed the classes to create a solid white container */}
        <div className="inline-block bg-white border border-slate-200/60 shadow-sm px-3 py-1 rounded-full">
            <a href="https://buildthatthing.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-600 hover:text-indigo-600 font-semibold">
              Powered by <strong>Build That Thing</strong>
            </a>
        </div>
      </div>
    </div>
  );
});

LinkPageTemplate.displayName = 'LinkPageTemplate';
export default LinkPageTemplate;