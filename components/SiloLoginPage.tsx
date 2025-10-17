import React, { useEffect, useRef } from 'react';
import { AppLogoIcon, YahooIcon, SlackIcon } from './icons';

declare global {
  interface Window {
    google: any;
  }
}

interface UserProfile {
    name: string;
    picture: string;
    email: string;
}

interface SiloLoginPageProps {
    onLoginSuccess: (profile: UserProfile) => void;
    onNavigate: (path: string) => void;
}

const SiloLoginPage: React.FC<SiloLoginPageProps> = ({ onLoginSuccess, onNavigate }) => {
    const signInButtonRef = useRef<HTMLDivElement>(null);

    const decodeJwtResponse = (token: string) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error("Error decoding JWT", e);
            return null;
        }
    }

    const handleCredentialResponse = (response: any) => {
        const decoded = decodeJwtResponse(response.credential);
        if (decoded) {
            const userProfile: UserProfile = {
                name: decoded.name,
                picture: decoded.picture,
                email: decoded.email
            };
            onLoginSuccess(userProfile);
        } else {
            console.error("Could not process login.")
        }
    };
    
    const handleYahooLogin = () => {
        const clientId = 'dj0yJmk9cGFERnI4WExsS2JhJmQ9WVdrOVdrSk9TVUV6V1dZbWNHbzlNQT09JnM9Y29uc3VtZXJzZWNyZXQmc3Y9MCZ4PWQz';
        const redirectUri = window.location.origin;
        const nonce = Math.random().toString(36).substring(2);
        sessionStorage.setItem('yahoo_nonce', nonce);
        
        const authUrl = `https://api.login.yahoo.com/oauth2/request_auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=id_token token&scope=openid profile email&nonce=${nonce}`;
        
        window.location.href = authUrl;
    };

    const handleSlackLogin = async () => {
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
        
        const clientId = '7938298429665.9726628658528';
        const redirectUri = window.location.origin;
    
        const verifier = generateRandomString(128);
        sessionStorage.setItem('slack_code_verifier', verifier);
        const challenge = await generateCodeChallenge(verifier);
    
        const scope = "openid profile email";
        const authUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scope}&redirect_uri=${encodeURIComponent(redirectUri)}&code_challenge=${challenge}&code_challenge_method=S256&response_type=code`;
        window.location.href = authUrl;
    };

    useEffect(() => {
        if (window.google && signInButtonRef.current) {
            window.google.accounts.id.initialize({
                client_id: '127898517822-hsudnhvhfc71gs1948b70949mcq6qe71.apps.googleusercontent.com',
                callback: handleCredentialResponse,
            });
            window.google.accounts.id.renderButton(
                signInButtonRef.current,
                { theme: 'outline', size: 'large', type: 'standard', width: '300', shape: 'pill' } 
            );
        }
    }, []);

    return (
        <div className="flex h-screen bg-gray-50 items-center justify-center p-8">
            <div className="max-w-sm w-full text-center bg-white p-8 rounded-2xl shadow-lg border">
                <div className="flex justify-center mb-6">
                    <AppLogoIcon className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome to Silo</h2>
                <p className="text-gray-500 mb-10">Sign in to continue.</p>
                
                <div className="flex flex-col items-center gap-4">
                    <div ref={signInButtonRef}></div>
                    <button
                      onClick={handleYahooLogin}
                      className="flex justify-center items-center gap-2 w-[300px] h-[40px] bg-[#6001D2] text-white rounded-full shadow-sm text-sm font-bold hover:bg-[#5001b0] transition-colors"
                    >
                      <YahooIcon />
                      Sign in with Yahoo
                    </button>
                     <button
                      onClick={handleSlackLogin}
                      className="flex justify-center items-center gap-3 w-[300px] h-[40px] bg-white text-black border border-gray-300 rounded-full shadow-sm text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      <SlackIcon className="w-5 h-5"/>
                      Sign in with Slack
                    </button>
                </div>

                <p className="text-xs text-gray-400 mt-12">
                    By continuing, you agree to our 
                    <a href="/terms" onClick={(e) => { e.preventDefault(); onNavigate('/terms'); }} className="underline hover:text-black"> Terms of Service</a> and 
                    <a href="/privacy" onClick={(e) => { e.preventDefault(); onNavigate('/privacy'); }} className="underline hover:text-black"> Privacy Policy</a>.
                </p>
            </div>
        </div>
    );
};

export default SiloLoginPage;