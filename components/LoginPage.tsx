import React, { useEffect, useRef } from 'react';

// FIX: Add google to window type to fix TypeScript errors.
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

interface LoginPageProps {
    onLoginSuccess: (profile: UserProfile) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
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
            // Handle decode error if necessary
            console.error("Could not process login.")
        }
    };

    useEffect(() => {
        if (window.google && signInButtonRef.current) {
            window.google.accounts.id.initialize({
                client_id: '127898517822-hsudnhvhfc71gs1948b70949mcq6qe71.apps.googleusercontent.com',
                callback: handleCredentialResponse,
            });
            window.google.accounts.id.renderButton(
                signInButtonRef.current,
                { theme: 'outline', size: 'large', type: 'standard', width: '300' } 
            );
        }
    }, []);

    return (
        <div className="flex h-screen bg-white">
            {/* Left Side (Visual) */}
            <div className="hidden lg:flex w-1/2 items-center justify-center bg-gray-50 p-12">
                 <div className="text-left max-w-md">
                     <div className="flex items-center mb-4">
                        <img src="https://i.ibb.co/7J7XQxy/IMG-3995.png" alt="Silo Notes Logo" className="w-12 h-12" />
                        <span className="ml-4 font-bold text-3xl">Silo Notes</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                        Capture Your Brilliance.
                    </h1>
                    <p className="mt-4 text-gray-600">
                        Join a community of creators and thinkers. Log in to access your personal space for ideas and inspiration.
                    </p>
                </div>
            </div>

            {/* Right Side (Login Form) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="max-w-sm w-full text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
                    <p className="text-gray-500 mb-8">Sign in to continue to Silo Notes.</p>
                    
                    <div ref={signInButtonRef} className="flex justify-center"></div>

                    <p className="text-xs text-gray-400 mt-12">
                        By continuing, you agree to our 
                        <a href="#/terms" className="underline hover:text-black"> Terms of Service</a> and 
                        <a href="#/privacy" className="underline hover:text-black"> Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;