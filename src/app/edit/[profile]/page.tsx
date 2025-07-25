// src/app/edit/[profile]/page.tsx
'use client';

import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import LinkPageTemplate from '@/components/LinkPageTemplate';
import { blankProfile, Profile as ProfileData, Link as LinkData } from '@/lib/profiles';
import { ChevronsLeft, Save, Link as LinkIcon, Plus, Trash2, User, Copy, Palette, UploadCloud, Loader2 } from 'lucide-react';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const profileKey = params.profile as string;
  
  const [profileData, setProfileData] = useState<ProfileData>(blankProfile);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState<{ profile: boolean; background: boolean }>({ profile: false, background: false });
  const [username, setUsername] = useState(profileKey === 'custom' ? '' : profileKey);
  const pageRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (authLoading) {
      return; // Wait until Firebase auth state is determined
    }
    if (!user) {
      router.push('/login'); // Redirect to login if not authenticated
      return;
    }

    async function fetchProfile() {
      if (profileKey === 'custom') {
        // For a new profile, assign the current user's UID
        setProfileData(prev => ({ ...prev, uid: user.uid }));
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/profiles/${profileKey}`);
      if (res.ok) {
        const data = await res.json();
        // SECURITY CHECK: Verify the logged-in user owns this profile
        if (data.uid !== user.uid) {
          alert("Permission Denied: You do not have access to edit this profile.");
          router.push('/');
          return;
        }
        const theme = { ...blankProfile.theme, ...data.theme };
        theme.background = { ...blankProfile.theme.background, ...theme.background };
        setProfileData({ ...blankProfile, ...data, theme });
      } else {
        // If profile doesn't exist, treat it like a new one but keep the attempted username
        setUsername(profileKey);
        setProfileData(prev => ({ ...prev, uid: user.uid }));
      }
      setLoading(false);
    }
    fetchProfile();
  }, [user, authLoading, profileKey, router]);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>, type: 'profile' | 'background') => {
    if (!user) {
      alert("You must be logged in to upload images.");
      return;
    }
    if (!username.trim()) {
      alert('Please enter a username before uploading images.');
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
        alert(`File is too large. Please select a file smaller than 5MB.`);
        e.target.value = '';
        return;
    }

    setIsUploading(prev => ({ ...prev, [type]: true }));
    
    // Use the user's UID in the path for security
    const filePath = `profiles/${user.uid}/${type === 'profile' ? 'profilePicture' : 'backgroundImage'}_${Date.now()}`;
    const storageRef = ref(storage, filePath);

    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      if (type === 'profile') {
        setProfileData(prev => ({ ...prev, imageUrl: downloadURL }));
      } else {
        setProfileData(prev => ({
          ...prev,
          theme: { ...prev.theme, background: { ...prev.theme.background, imageUrl: downloadURL } }
        }));
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload image. Please try again.");
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
    if (!username.trim()) {
        alert("Please enter a username.");
        return;
    }
    setIsSaving(true);
    try {
      const dataToSave = { ...profileData, uid: user.uid }; // Ensure UID is included
      await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: username, data: dataToSave }),
      });
      alert('Profile saved successfully!');
      if (shareableLink) {
        window.open(shareableLink, '_blank');
      }
      if (profileKey !== username) {
        router.push(`/edit/${username}`);
      }
    } catch {
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
  
  const handleButtonStyleChange = (style: 'rounded' | 'full' | 'square') => {
    setProfileData(prev => ({ ...prev, theme: { ...prev.theme, buttonStyle: style } }));
    };


  const handleBackgroundChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, theme: { ...prev.theme, background: { ...prev.theme.background, [name]: value } } }));
  };

  const handleLinkChange = (index: number, field: keyof LinkData, value: string) => {
    setProfileData(prev => {
      const newLinks = [...prev.links];
      newLinks[index] = { ...newLinks[index], [field]: value };
      return { ...prev, links: newLinks };
    });
  };

  const addLink = () => {
    setProfileData(prev => ({ ...prev, links: [...prev.links, { title: '', url: '' }] }));
  };

  const removeLink = (index: number) => {
    setProfileData(prev => ({ ...prev, links: prev.links.filter((_, i) => i !== index) }));
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

  if (authLoading || loading) return <div className="text-center p-12">Loading...</div>;
  if (!user) return null; // Render nothing while redirecting

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
              <button onClick={handleSave} disabled={isSaving || !username} className="py-2.5 px-6 inline-flex items-center gap-2 text-sm font-semibold rounded-lg border-transparent bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg disabled:bg-indigo-300 disabled:cursor-not-allowed">
                <Save size={16}/> {isSaving ? 'Saving...' : 'Save Page'}
              </button>
            </div>
          </div>
          <div className="mt-4 border-t border-slate-200/80 pt-4">
            <label className="block text-sm font-medium text-slate-600 mb-2">Your Unique Username</label>
            <div className="flex items-center gap-2">
              <div className="flex items-center w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg">
                <span className="text-slate-400 text-sm">{typeof window !== 'undefined' ? `${window.location.origin}/` : '.../'}</span>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="your-cool-username" className="w-full bg-transparent outline-none text-indigo-600 font-semibold" />
              </div>
              <button onClick={handleCopyToClipboard} className="py-2.5 px-4 inline-flex items-center gap-2 text-sm font-semibold rounded-lg bg-slate-600 text-white hover:bg-slate-700 shadow-sm transition-all">
                <Copy size={16}/>
              </button>
            </div>
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
                <label htmlFor="profile-upload" className="w-full border-2 border-dashed border-slate-300 rounded-lg p-3 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/80 transition-all group flex items-center justify-center gap-2">
                  {isUploading.profile ? <Loader2 className="animate-spin" size={20}/> : <UploadCloud className="text-slate-400 group-hover:text-indigo-600" size={20}/>}
                  <span className="text-slate-600 font-semibold">{isUploading.profile ? 'Uploading...' : 'Upload Image (<5MB)'}</span>
                </label>
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
                  <label htmlFor="background-upload" className="w-full border-2 border-dashed border-slate-300 rounded-lg p-3 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/80 group flex items-center justify-center gap-2">
                    {isUploading.background ? <Loader2 className="animate-spin" size={20}/> : <UploadCloud className="text-slate-400 group-hover:text-indigo-600" size={20}/>}
                    <span className="text-slate-600 font-semibold">{isUploading.background ? 'Uploading...' : 'Upload Image (<5MB)'}</span>
                  </label>
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
            </div>
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center"><LinkIcon size={20} className="mr-2"/>Links</h3>
              <div className="space-y-4">
                {profileData.links.map((link, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center p-3 bg-slate-50/80 rounded-lg border border-slate-200/60">
                    <input type="text" value={link.title} onChange={(e) => handleLinkChange(index, 'title', e.target.value)} placeholder="Link Title" className="sm:col-span-5 px-3 py-2 bg-white border border-slate-200 rounded-lg"/>
                    <input type="url" value={link.url} onChange={(e) => handleLinkChange(index, 'url', e.target.value)} placeholder="https://example.com" className="sm:col-span-6 px-3 py-2 bg-white border border-slate-200 rounded-lg"/>
                    <button onClick={() => removeLink(index)} className="sm:col-span-1 text-red-500 hover:text-red-700 flex justify-center items-center h-full"><Trash2 size={18}/></button>
                  </div>
                ))}
                <button onClick={addLink} className="w-full py-2 border-dashed border-2 border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold flex items-center justify-center gap-2"><Plus size={16}/>Add Link</button>
              </div>
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="lg:sticky top-12 p-4 rounded-3xl" style={getBackgroundStyle(profileData.theme.background)}>
              <div className="w-full max-w-[340px] mx-auto rounded-2xl shadow-2xl overflow-hidden aspect-[9/19.5]">
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