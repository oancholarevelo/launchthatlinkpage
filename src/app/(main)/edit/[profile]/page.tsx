'use client';

import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import LinkPageTemplate from '@/components/LinkPageTemplate';
import { blankProfile, Profile as ProfileData, ContentBlock, SocialLink, getProfile, saveProfile } from '@/lib/profiles';
import { ChevronsLeft, Save, Link as LinkIcon, Plus, Trash2, User, Copy, Palette, UploadCloud, Loader2, CheckCircle, XCircle, Star, Users, Film, Code } from 'lucide-react';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '@/context/AuthContext';

// A simple debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}


export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const profileKey = params.profile as string;
  
  const [profileData, setProfileData] = useState<ProfileData>(blankProfile);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState<{ profile: boolean; background: boolean; overlay: boolean }>({ profile: false, background: false, overlay: false });
  const [username, setUsername] = useState(profileKey === 'custom' ? '' : profileKey);
  
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const debouncedUsername = useDebounce(username, 500);
  
  const pageRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    async function fetchProfile() {
      if (profileKey === 'custom') {
        setProfileData(prev => ({ ...prev, uid: user.uid }));
        setLoading(false);
        return;
      }
      
      const data = await getProfile(profileKey);

      if (data) {
        if (data.uid !== user.uid) {
          alert("Permission Denied.");
          router.push('/');
          return;
        }
        const theme = { ...blankProfile.theme, ...data.theme };
        theme.background = { ...blankProfile.theme.background, ...theme.background };
        theme.overlay = { ...blankProfile.theme.overlay, ...theme.overlay };
        const socials = data.socials || [];
        const blocks = data.blocks || (data as any).links?.map((l: any) => ({...l, type: 'link'})) || [];
        setProfileData({ ...blankProfile, ...data, theme, socials, blocks });
      } else {
        setUsername(profileKey);
        setProfileData(prev => ({ ...prev, uid: user.uid }));
      }
      setLoading(false);
    }
    fetchProfile();
  }, [user, authLoading, profileKey, router]);

  useEffect(() => {
    const checkUsername = async () => {
      if (!debouncedUsername.trim() || debouncedUsername.length < 3) {
        setUsernameStatus(debouncedUsername.trim() ? 'invalid' : 'idle');
        return;
      }
      if (debouncedUsername === profileKey) {
        setUsernameStatus('idle');
        return;
      }
      setUsernameStatus('checking');
      const existingProfile = await getProfile(debouncedUsername);
      setUsernameStatus(existingProfile ? 'taken' : 'available');
    };
    checkUsername();
  }, [debouncedUsername, profileKey]);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>, type: 'profile' | 'background' | 'overlay') => {
    if (!user || !username.trim()) {
      alert("Please enter a username before uploading images.");
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        alert(`File is too large. Max 5MB.`);
        e.target.value = '';
        return;
    }

    setIsUploading(prev => ({ ...prev, [type]: true }));
    
    const filePath = `profiles/${user.uid}/${type}Image_${Date.now()}`;
    const storageRef = ref(storage, filePath);

    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      if (type === 'profile') {
        setProfileData(prev => ({ ...prev, imageUrl: downloadURL }));
      } else if (type === 'background') {
        setProfileData(prev => ({
          ...prev, theme: { ...prev.theme, background: { ...prev.theme.background, imageUrl: downloadURL } }
        }));
      } else if (type === 'overlay') {
        setProfileData(prev => ({
          ...prev, theme: { ...prev.theme, overlay: { ...prev.theme.overlay, imageUrl: downloadURL } }
        }));
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(prev => ({ ...prev, [type]: false }));
      e.target.value = '';
    }
  };

  const shareableLink = typeof window !== 'undefined' && username ? `${window.location.origin}/${username}` : '';

  const handleSave = async () => {
    if (!user) {
        alert("You must be logged in to save.");
        return;
    }
    if (!username.trim() || usernameStatus === 'taken' || usernameStatus === 'invalid') {
        alert("Please enter a valid and available username.");
        return;
    }
    setIsSaving(true);
    try {
      const existingProfile = await getProfile(username);
      if (existingProfile && existingProfile.uid !== user.uid) {
        alert("This username is already taken. Please choose another one.");
        setIsSaving(false);
        return;
      }

      const dataToSave = { ...profileData, uid: user.uid };
      await saveProfile(username, dataToSave);
      
      alert('Profile saved successfully!');
      if (shareableLink) {
        window.open(shareableLink, '_blank');
      }
      if (profileKey !== username) {
        router.push(`/edit/${username}`);
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCopyToClipboard = () => {
    if (!shareableLink) {
        alert("Please enter a username and save before copying the link.");
        return;
    };
    navigator.clipboard.writeText(shareableLink).then(() => {
        alert('Link copied to clipboard!');
    });
  };
  
  const handleProfileChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleThemeChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, theme: { ...prev.theme, [name]: value } }));
  };

  const handleOverlayChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setProfileData(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        overlay: { ...prev.theme.overlay, [name]: checked }
      }
    }));
  };
  
  const handleButtonStyleChange = (style: 'rounded' | 'full' | 'square') => {
    setProfileData(prev => ({ ...prev, theme: { ...prev.theme, buttonStyle: style } }));
  };

  const handleBackgroundChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, theme: { ...prev.theme, background: { ...prev.theme.background, [name]: value } } }));
  };

  const handleBlockChange = (index: number, field: keyof ContentBlock, value: string) => {
    setProfileData(prev => {
      const newBlocks = [...(prev.blocks || [])];
      newBlocks[index] = { ...newBlocks[index], [field]: value as any };
      return { ...prev, blocks: newBlocks };
    });
  };

  const addBlock = () => {
    setProfileData(prev => ({ ...prev, blocks: [...(prev.blocks || []), { type: 'link', title: '', url: '', featured: false }] }));
  };

  const removeBlock = (index: number) => {
    setProfileData(prev => ({ ...prev, blocks: (prev.blocks || []).filter((_, i) => i !== index) }));
  };

  const handleToggleFeatured = (indexToFeature: number) => {
    setProfileData(prev => {
      const newBlocks = (prev.blocks || []).map((block, index) => ({
        ...block,
        featured: index === indexToFeature ? !block.featured : false,
      }));
      return { ...prev, blocks: newBlocks };
    });
  };

  const handleSocialLinkChange = (index: number, field: keyof SocialLink, value: string) => {
    setProfileData(prev => {
        const newSocials = [...(prev.socials || [])];
        newSocials[index] = { ...newSocials[index], [field]: value as SocialLink['platform'] };
        return { ...prev, socials: newSocials };
    });
  };

  const addSocialLink = () => {
      setProfileData(prev => ({
          ...prev,
          socials: [...(prev.socials || []), { platform: 'website', url: '' }]
      }));
  };

  const removeSocialLink = (index: number) => {
      setProfileData(prev => ({
          ...prev,
          socials: (prev.socials || []).filter((_, i) => i !== index)
      }));
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
  
  const renderUsernameStatus = () => {
    switch (usernameStatus) {
      case 'checking':
        return <p className="text-xs text-slate-500 mt-2 flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Checking availability...</p>;
      case 'available':
        return <p className="text-xs text-green-600 mt-2 flex items-center gap-1"><CheckCircle size={12} /> Username is available!</p>;
      case 'taken':
        return <p className="text-xs text-red-600 mt-2 flex items-center gap-1"><XCircle size={12} /> This username is already taken.</p>;
      case 'invalid':
        return <p className="text-xs text-red-600 mt-2 flex items-center gap-1"><XCircle size={12} /> Username must be at least 3 characters.</p>;
      default:
        return <p className="text-xs text-slate-500 mt-2">Your public page will be at: <span className="font-medium text-slate-700">{shareableLink || "..."}</span></p>;
    }
  };

  if (authLoading || loading) return <div className="text-center p-12">Loading...</div>;
  if (!user) return null;

  return (
    <main className="p-4 sm:p-8 lg:p-12 bg-transparent">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/50 border border-slate-200/50 rounded-xl shadow-md backdrop-blur-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Linkpage Editor</h1>
              <p className="text-slate-500 mt-1">You are editing as <span className="font-semibold text-indigo-600">{user.email}</span></p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors shadow-sm">
                <ChevronsLeft size={16} /> Back
              </Link>
              <button onClick={handleSave} disabled={isSaving || !username || usernameStatus === 'taken' || usernameStatus === 'invalid'} className="py-2.5 px-6 inline-flex items-center gap-2 text-sm font-semibold rounded-lg border-transparent bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg disabled:bg-indigo-300 disabled:cursor-not-allowed">
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16}/>}
                {isSaving ? 'Saving...' : 'Save Page'}
              </button>
            </div>
          </div>
          <div className="mt-4 border-t border-slate-200/80 pt-4">
            <label className="block text-sm font-medium text-slate-600 mb-2">Your Unique Username</label>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} 
                placeholder="your-cool-username" 
                className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-indigo-600 font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" 
              />
              <button onClick={handleCopyToClipboard} className="p-2.5 inline-flex items-center justify-center text-sm font-semibold rounded-lg bg-slate-600 text-white hover:bg-slate-700 shadow-sm transition-all">
                  <Copy size={16}/>
              </button>
            </div>
            {renderUsernameStatus()}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="lg:col-span-2 p-6 bg-white/50 border border-slate-200/50 rounded-xl space-y-6 backdrop-blur-lg shadow-md">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-800 flex items-center"><User size={20} className="mr-2"/>Profile</h3>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Display Name</label>
                <input type="text" id="name" name="name" value={profileData.name} onChange={handleProfileChange} placeholder="e.g., Jane Doe" className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Profile Picture</label>
                {profileData.imageUrl ? (
                  <div className="flex items-center gap-4">
                    <Image src={profileData.imageUrl} alt="Profile preview" width={64} height={64} className="rounded-full object-cover w-16 h-16"/>
                    <div className="flex-grow">
                      <label htmlFor="profile-upload" className="w-full text-center text-sm font-semibold py-2 px-4 rounded-lg bg-white border border-slate-300 cursor-pointer hover:bg-slate-50 transition-colors block">Change</label>
                      <button onClick={() => setProfileData(prev => ({...prev, imageUrl: ''}))} className="w-full text-center text-sm text-slate-500 mt-2 hover:text-red-600">Remove</button>
                    </div>
                  </div>
                ) : (
                  <label htmlFor="profile-upload" className="w-full border-2 border-dashed border-slate-300 rounded-lg p-3 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/80 transition-all group flex items-center justify-center gap-2">
                    {isUploading.profile ? <Loader2 className="animate-spin" size={20}/> : <UploadCloud className="text-slate-400 group-hover:text-indigo-600" size={20}/>}
                    <span className="text-slate-600 font-semibold">{isUploading.profile ? 'Uploading...' : 'Upload Image (<5MB)'}</span>
                  </label>
                )}
                <input id="profile-upload" type="file" accept="image/png, image/jpeg, image/gif" onChange={(e) => handleFileUpload(e, 'profile')} className="hidden" />
              </div>
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-slate-600 mb-2">Bio</label>
                <textarea id="bio" name="bio" value={profileData.bio} onChange={handleProfileChange} placeholder="A short description about you" className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg" rows={3}></textarea>
              </div>
            </div>
            <div className="border-t border-slate-200 pt-6 space-y-4">
              <h3 className="text-xl font-semibold text-slate-800 flex items-center"><Palette size={20} className="mr-2"/> Appearance</h3>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Page Background Type</label>
                <select name="type" value={profileData.theme.background.type} onChange={handleBackgroundChange} className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg">
                  <option value="solid">Solid Color</option>
                  <option value="gradient">Gradient</option>
                  <option value="image">Image</option>
                </select>
              </div>
              {profileData.theme.background.type === 'solid' && (
                <div>
                  <label htmlFor="color" className="block text-sm font-medium text-slate-600 mb-2">Page Background Color</label>
                  <input type="color" id="color" name="color" value={profileData.theme.background.color} onChange={handleBackgroundChange} className="w-full h-10 p-1 bg-white border border-slate-200 rounded-lg cursor-pointer"/>
                </div>
              )}
              {profileData.theme.background.type === 'gradient' && (
                <div className="grid grid-cols-2 gap-4">
                  <div><label htmlFor="gradientStart" className="block text-sm font-medium text-slate-600 mb-2">Start Color</label><input type="color" id="gradientStart" name="gradientStart" value={profileData.theme.background.gradientStart} onChange={handleBackgroundChange} className="w-full h-10 p-1 bg-white border border-slate-200 rounded-lg"/></div>
                  <div><label htmlFor="gradientEnd" className="block text-sm font-medium text-slate-600 mb-2">End Color</label><input type="color" id="gradientEnd" name="gradientEnd" value={profileData.theme.background.gradientEnd} onChange={handleBackgroundChange} className="w-full h-10 p-1 bg-white border border-slate-200 rounded-lg"/></div>
                </div>
              )}
              {profileData.theme.background.type === 'image' && (
                 <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Page Background Image</label>
                  {profileData.theme.background.imageUrl ? (
                    <div className="flex items-center gap-4">
                      <Image src={profileData.theme.background.imageUrl} alt="Background preview" width={64} height={36} className="rounded-md object-cover w-16 h-9"/>
                       <div className="flex-grow">
                        <label htmlFor="background-upload" className="w-full text-center text-sm font-semibold py-2 px-4 rounded-lg bg-white border border-slate-300 cursor-pointer hover:bg-slate-50 transition-colors block">Change</label>
                         <button onClick={() => setProfileData(prev => ({...prev, theme: {...prev.theme, background: {...prev.theme.background, imageUrl: ''}}}))} className="w-full text-center text-sm text-slate-500 mt-2 hover:text-red-600">Remove</button>
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="background-upload" className="w-full border-2 border-dashed border-slate-300 rounded-lg p-3 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/80 group flex items-center justify-center gap-2">
                      {isUploading.background ? <Loader2 className="animate-spin" size={20}/> : <UploadCloud className="text-slate-400 group-hover:text-indigo-600" size={20}/>}
                      <span className="text-slate-600 font-semibold">{isUploading.background ? 'Uploading...' : 'Upload Image (<5MB)'}</span>
                    </label>
                  )}
                  <input id="background-upload" type="file" accept="image/png, image/jpeg, image/gif" onChange={(e) => handleFileUpload(e, 'background')} className="hidden" />
                </div>
              )}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <div>
                  <label htmlFor="containerColor" className="block text-sm font-medium text-slate-600 mb-2">Container Color</label>
                  <input type="color" id="containerColor" name="containerColor" value={profileData.theme.containerColor} onChange={handleThemeChange} className="w-full h-10 p-1 bg-white border border-slate-200 rounded-lg"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label htmlFor="buttonColor" className="block text-sm font-medium text-slate-600 mb-2">Button Color</label><input type="color" id="buttonColor" name="buttonColor" value={profileData.theme.buttonColor} onChange={handleThemeChange} className="w-full h-10 p-1 bg-white border border-slate-200 rounded-lg"/></div>
                  <div><label htmlFor="textColor" className="block text-sm font-medium text-slate-600 mb-2">Button Text Color</label><input type="color" id="textColor" name="textColor" value={profileData.theme.textColor} onChange={handleThemeChange} className="w-full h-10 p-1 bg-white border border-slate-200 rounded-lg"/></div>
                </div>
              </div>
              <div>
                <label htmlFor="font" className="block text-sm font-medium text-slate-600 mb-2">Font</label>
                <select id="font" name="font" value={profileData.theme.font} onChange={handleThemeChange} className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg">
                  <option value="inter">Inter</option><option value="poppins">Poppins</option><option value="lato">Lato</option><option value="lora">Lora (Serif)</option><option value="playfair-display">Playfair Display (Serif)</option><option value="roboto-mono">Roboto Mono (Monospace)</option><option value="source-code-pro">Source Code Pro (Monospace)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Button Style</label>
                <div className="grid grid-cols-3 gap-2">
                    {(['rounded', 'full', 'square'] as const).map(style => (
                        <button key={style} onClick={() => handleButtonStyleChange(style)} className={`py-2 text-sm font-semibold border-2 rounded-lg transition-colors ${profileData.theme.buttonStyle === style ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-300'}`}>
                           {style.charAt(0).toUpperCase() + style.slice(1)}
                        </button>
                    ))}
                </div>
              </div>
              <div className="pt-4 border-t border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="overlayEnabled" className="block text-sm font-medium text-slate-600">Floating Icon</label>
                  <input
                    type="checkbox"
                    id="overlayEnabled"
                    name="enabled"
                    checked={profileData.theme.overlay?.enabled || false}
                    onChange={handleOverlayChange}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
                {profileData.theme.overlay?.enabled && (
                  <div>
                  {profileData.theme.overlay.imageUrl ? (
                    <div className="flex items-center gap-4 mt-2">
                      <Image src={profileData.theme.overlay.imageUrl} alt="Overlay preview" width={48} height={48} className="object-contain w-12 h-12"/>
                      <div className="flex-grow">
                        <label htmlFor="overlay-upload" className="w-full text-center text-sm font-semibold py-2 px-4 rounded-lg bg-white border border-slate-300 cursor-pointer hover:bg-slate-50 transition-colors block">Change</label>
                        <button onClick={() => setProfileData(prev => ({...prev, theme: {...prev.theme, overlay: {...prev.theme.overlay, imageUrl: ''}}}))} className="w-full text-center text-sm text-slate-500 mt-2 hover:text-red-600">Remove</button>
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="overlay-upload" className="mt-2 w-full border-2 border-dashed border-slate-300 rounded-lg p-3 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/80 transition-all group flex items-center justify-center gap-2">
                      {isUploading.overlay ? <Loader2 className="animate-spin" size={20}/> : <UploadCloud className="text-slate-400 group-hover:text-indigo-600" size={20}/>}
                      <span className="text-slate-600 font-semibold">{isUploading.overlay ? 'Uploading...' : 'Upload Icon (<5MB)'}</span>
                    </label>
                  )}
                  <input id="overlay-upload" type="file" accept="image/png, image/jpeg, image/gif" onChange={(e) => handleFileUpload(e, 'overlay')} className="hidden" />
                </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center"><Users size={20} className="mr-2"/>Social Links</h3>
              <div className="space-y-4">
                {(profileData.socials || []).map((social, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center p-3 bg-slate-50/80 rounded-lg border border-slate-200/60">
                    <select
                      value={social.platform}
                      onChange={(e) => handleSocialLinkChange(index, 'platform', e.target.value)}
                      className="sm:col-span-4 px-3 py-2 bg-white border border-slate-200 rounded-lg"
                    >
                      <option value="website">Website</option>
                      <option value="github">GitHub</option>
                      <option value="twitter">Twitter</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="instagram">Instagram</option>
                      <option value="youtube">YouTube</option>
                      <option value="facebook">Facebook</option>
                      <option value="tiktok">TikTok</option>
                      <option value="twitch">Twitch</option>
                      <option value="pinterest">Pinterest</option>
                      <option value="discord">Discord</option>
                    </select>
                    <input type="url" value={social.url} onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)} placeholder="https://example.com" className="sm:col-span-7 px-3 py-2 bg-white border border-slate-200 rounded-lg"/>
                    <button onClick={() => removeSocialLink(index)} className="sm:col-span-1 text-red-500 hover:text-red-700 flex justify-center items-center h-full"><Trash2 size={18}/></button>
                  </div>
                ))}
                <button onClick={addSocialLink} className="w-full py-2 border-dashed border-2 border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold flex items-center justify-center gap-2"><Plus size={16}/>Add Social Link</button>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center"><LinkIcon size={20} className="mr-2"/>Content Blocks</h3>
              <div className="space-y-4">
                {(profileData.blocks || []).map((block, index) => (
                  <div key={index} className="p-3 bg-slate-50/80 rounded-lg border border-slate-200/60 space-y-3">
                    <div className="grid grid-cols-12 gap-2 items-center">
                       <select value={block.type} onChange={(e) => handleBlockChange(index, 'type', e.target.value)} className="col-span-11 px-3 py-2 bg-white border border-slate-200 rounded-lg">
                         <option value="link">Link Button</option>
                         <option value="video">Video / GIF</option>
                         <option value="embed">Embed</option>
                       </select>
                       <button onClick={() => removeBlock(index)} className="col-span-1 text-red-500 hover:text-red-700 flex justify-center items-center h-full"><Trash2 size={18}/></button>
                    </div>

                    {block.type === 'link' && (
                       <div className="grid grid-cols-12 gap-2 items-center">
                         <button onClick={() => handleToggleFeatured(index)} title="Mark as featured" className="col-span-1 flex justify-center items-center h-full">
                           <Star size={18} className={block.featured ? 'text-yellow-500 fill-current' : 'text-slate-400'} />
                         </button>
                         <input type="text" value={block.title} onChange={(e) => handleBlockChange(index, 'title', e.target.value)} placeholder="Link Title" className="col-span-11 px-3 py-2 bg-white border border-slate-200 rounded-lg"/>
                       </div>
                    )}

                    {block.type === 'video' && (
                       <input type="url" value={block.url} onChange={(e) => handleBlockChange(index, 'url', e.target.value)} placeholder="YouTube or .gif URL" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg"/>
                    )}

                    {block.type === 'embed' && (
                      <textarea value={block.url} onChange={(e) => handleBlockChange(index, 'url', e.target.value)} placeholder="Paste your <iframe> embed code here" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono text-xs" rows={4}></textarea>
                    )}
                    
                    {block.type !== 'video' && block.type !== 'embed' && <input type="url" value={block.url} onChange={(e) => handleBlockChange(index, 'url', e.target.value)} placeholder="https://example.com" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg"/>}
                  </div>
                ))}
                <button onClick={addBlock} className="w-full py-2 border-dashed border-2 border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold flex items-center justify-center gap-2"><Plus size={16}/>Add Block</button>
              </div>
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="lg:sticky top-12 p-4 rounded-3xl" style={getBackgroundStyle(profileData.theme.background)}>
              <div className="w-full max-w-[340px] mx-auto overflow-hidden">
                <div className="overflow-y-auto h-full">
                  <LinkPageTemplate data={profileData} ref={pageRef} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}