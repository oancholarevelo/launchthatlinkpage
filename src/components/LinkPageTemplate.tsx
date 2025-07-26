// src/components/LinkPageTemplate.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Profile as ProfileData, blankProfile, SocialLink, ContentBlock } from '@/lib/profiles';
import { Pencil, Github, Twitter, Linkedin, Instagram, Youtube, Globe, Facebook, Twitch, Music, MessageSquare, Image as ImageIcon } from 'lucide-react';

interface LinkPageTemplateProps {
  data: ProfileData;
  profileKey?: string;
}

const SocialIcon = ({ platform, url }: SocialLink) => {
  const icons = {
    github: <Github size={20} />,
    twitter: <Twitter size={20} />,
    linkedin: <Linkedin size={20} />,
    instagram: <Instagram size={20} />,
    youtube: <Youtube size={20} />,
    website: <Globe size={20} />,
    facebook: <Facebook size={20} />,
    twitch: <Twitch size={20} />,
    pinterest: <ImageIcon size={20} />,
    tiktok: <Music size={20} />,
    discord: <MessageSquare size={20} />,
  };

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-indigo-600 transition-colors">
      {icons[platform] || <Globe size={20} />}
    </a>
  );
};

// Component to render different block types
const BlockRenderer = ({ block, buttonStyle, buttonColor, textColor }: { block: ContentBlock, buttonStyle: string, buttonColor: string, textColor: string }) => {
  const isFeatured = block.featured;
  const featuredClasses = isFeatured 
    ? 'scale-105 ring-2 ring-indigo-500 ring-offset-2 animate-pulse' 
    : 'hover:scale-105';

  switch (block.type) {
    case 'gif':
      if (block.url) {
        return (
          <div className="w-full overflow-hidden rounded-lg shadow-md">
             <Image src={block.url} alt={block.title || 'GIF'} width={500} height={300} className="w-full h-auto" />
          </div>
        )
      }
      return <p className="text-center text-xs text-red-500">GIF not available</p>;

    case 'embed':
      return (
        <div className="w-full overflow-hidden rounded-lg shadow-md" dangerouslySetInnerHTML={{ __html: block.url }} />
      );
    
    case 'text':
      return (
        <div className="w-full text-center p-4 bg-white rounded-lg shadow-md text-slate-700">
          <p style={{ whiteSpace: 'pre-wrap' }}>{block.url}</p>
        </div>
      );

    case 'link':
    default:
      if (!block.url) {
        return (
          <div
            className={`block w-full p-4 text-center shadow-md transition-all duration-200 ${buttonStyle} opacity-50 cursor-not-allowed`}
            style={{ backgroundColor: buttonColor, color: textColor }}
          >
            <p className="font-semibold">{block.title || 'Link (no URL provided)'}</p>
          </div>
        );
      }
      return (
        <a 
          href={block.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`block w-full p-4 text-center shadow-md hover:shadow-lg transition-all duration-200 ${buttonStyle} ${featuredClasses}`}
          style={{ backgroundColor: buttonColor, color: textColor }}
        >
          <p className="font-semibold">{block.title}</p>
        </a>
      );
  }
};


const LinkPageTemplate = React.forwardRef<HTMLDivElement, LinkPageTemplateProps>(({ data }, ref) => {
  const theme = { ...blankProfile.theme, ...data.theme };
  theme.background = { ...blankProfile.theme.background, ...theme.background };
  // Ensure overlay object exists
  theme.overlay = { ...blankProfile.theme.overlay, ...theme.overlay };

  const getFontClass = (font: string) => {
    switch (font) {
      case 'inter': return 'font-inter';
      case 'lato': return 'font-lato';
      case 'source-code-pro': return 'font-source-code-pro';
      case 'poppins': return 'font-poppins';
      case 'roboto-mono': return 'font-roboto-mono';
      case 'playfair-display': return 'font-playfair-display';
      case 'lora': return 'font-lora';
      default: return 'font-inter';
    }
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
      className={`relative flex flex-col items-center p-6 sm:p-8 w-full min-h-[600px] transition-colors duration-300 ${getFontClass(theme.font)} rounded-2xl shadow-xl overflow-hidden`}
      style={{ backgroundColor: theme.containerColor }}
    >
      {/* Page Content Wrapper */}
      <div className="relative z-10 flex flex-col items-center w-full flex-grow">
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

        {data.socials && data.socials.length > 0 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            {data.socials.map((social, index) => (
              <SocialIcon key={index} {...social} />
            ))}
          </div>
        )}

        <div className="w-full mt-8 space-y-4">
          {(data.blocks || []).map((block, index) => (
            <BlockRenderer 
              key={index} 
              block={block}
              buttonStyle={getButtonStyleClass(theme.buttonStyle)}
              buttonColor={theme.buttonColor}
              textColor={theme.textColor}
            />
          ))}
        </div>
        
        <div className="mt-auto pt-8 text-center space-y-3">
          <div className="inline-block bg-white border border-slate-200/60 shadow-sm px-3 py-1 rounded-full">
              <a href="https://buildthatthing.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-600 hover:text-indigo-600 font-semibold">
                Powered by <strong>Build That Thing</strong>
              </a>
          </div>
        </div>
      </div>
    </div>
  );
});

LinkPageTemplate.displayName = 'LinkPageTemplate';
export default LinkPageTemplate;