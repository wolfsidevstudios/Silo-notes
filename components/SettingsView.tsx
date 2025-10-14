import React, { useState, useEffect } from 'react';
import { View } from '../types';
import { BookOpenIcon, ChevronRightIcon, ZoomIcon } from './icons';

interface UserProfile {
    name: string;
    picture: string;
    email: string;
}

interface SettingsViewProps {
  userProfile: UserProfile | null;
  onKeyUpdate: (key: string) => void;
  onLogout: () => void;
  onViewChange: (view: View) => void;
  zoomUser: any | null;
  onZoomDisconnect: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ userProfile, onKeyUpdate, onLogout, onViewChange, zoomUser, onZoomDisconnect }) => {
  const [apiKey, setApiKey] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini-api-key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSave = () => {
    setSaveStatus('saving');
    localStorage.setItem('gemini-api-key', apiKey);
    onKeyUpdate(apiKey);
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000); 
    }, 500);
  };
  
  const handleZoomConnect = async () => {
    const generateRandomString = (length: number) => {
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let text = '';
        for (let i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    };
    const generateCodeChallenge = async (verifier: string) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(verifier);
        const digest = await window.crypto.subtle.digest('SHA-256', data);
        return btoa(String.fromCharCode(...new Uint8Array(digest)))
            .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    };
    
    const clientId = 'qy8KhVTKRZG1Pl4dhQwZSw';
    const redirectUri = window.location.origin + window.location.pathname;

    const verifier = generateRandomString(128);
    sessionStorage.setItem('zoom_code_verifier', verifier);
    const challenge = await generateCodeChallenge(verifier);

    const authUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&code_challenge=${challenge}&code_challenge_method=S256`;
    window.location.href = authUrl;
  };


  return (
    <div className="p-8 lg:p-12">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
        <p className="text-lg text-gray-500 mt-2">Manage your account and application settings.</p>
      </header>

      <div className="max-w-2xl mx-auto space-y-8">
        {userProfile && (
            <div className="bg-gray-100 rounded-full p-2 flex items-center justify-between shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                    <img src={userProfile.picture} alt="Profile" className="w-12 h-12 rounded-full" />
                    <span className="font-semibold text-gray-800">{userProfile.name}</span>
                </div>
                <button
                    onClick={onLogout}
                    className="bg-white text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors py-2 px-5 rounded-full border border-gray-200"
                >
                    Logout
                </button>
            </div>
        )}
        
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Third-Party Integrations</h2>
            {zoomUser ? (
                 <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <img src={zoomUser.pic_url} alt="Zoom profile" className="w-12 h-12 rounded-full" />
                        <div>
                            <p className="font-semibold text-gray-800">{zoomUser.first_name} {zoomUser.last_name}</p>
                            <p className="text-sm text-gray-500">{zoomUser.email}</p>
                        </div>
                    </div>
                    <button onClick={onZoomDisconnect} className="text-sm font-semibold text-red-600 bg-white border rounded-full px-4 py-1.5 hover:bg-red-50">Disconnect</button>
                </div>
            ) : (
                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full"><ZoomIcon className="w-8 h-8" /></div>
                        <div>
                            <p className="font-semibold text-gray-800">Zoom</p>
                            <p className="text-sm text-gray-500">Sync your meetings</p>
                        </div>
                    </div>
                    <button onClick={handleZoomConnect} className="text-sm font-semibold text-blue-600 bg-white border rounded-full px-4 py-1.5 hover:bg-blue-50">Connect</button>
                </div>
            )}
            <div className="text-center mt-6 p-4 bg-gray-100 rounded-lg border-2 border-dashed">
                <p className="text-sm text-gray-500">More integrations coming soon!</p>
            </div>
        </div>


        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">API Configuration</h2>
            
            <div className="mb-6">
            <label htmlFor="gemini-api-key" className="block text-sm font-medium text-gray-700 mb-2">
                Gemini API Key
            </label>
            <p className="text-xs text-gray-500 mb-3">
                Your API key is stored only in your browser's local storage. 
                Providing a key will unlock AI writing tools in the note editor.
            </p>
            <input
                id="gemini-api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            />
            </div>

            <div className="flex justify-end">
            <button
                onClick={handleSave}
                className={`bg-black text-white font-semibold py-2 px-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${
                saveStatus === 'saved' ? 'bg-green-600' : 'hover:bg-gray-800'
                }`}
                disabled={saveStatus === 'saving'}
            >
                {saveStatus === 'idle' && 'Save Key'}
                {saveStatus === 'saving' && 'Saving...'}
                {saveStatus === 'saved' && 'Saved!'}
            </button>
            </div>
        </div>

        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">About Silo Notes</h2>
            
            <button
                onClick={() => onViewChange(View.DOCUMENTATION)}
                className="w-full flex items-center justify-between p-6 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className="bg-gray-200 p-3 rounded-full">
                        <BookOpenIcon />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg text-gray-800 text-left">Documentation</h3>
                        <p className="text-sm text-gray-600 text-left">Explore how our tools work and our third-party integrations.</p>
                    </div>
                </div>
                <ChevronRightIcon />
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;