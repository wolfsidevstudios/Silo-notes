import React from 'react';

interface PrivacyPolicyProps {
    onNavigate: (path: string) => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onNavigate }) => {
    return (
        <div className="min-h-screen bg-gray-50 p-8 md:p-12 lg:p-16">
            <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-lg shadow-sm border">
                <h1 className="text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
                <div className="prose max-w-none text-gray-700">
                    <p className="lead">Last updated: {new Date().toLocaleDateString()}</p>
                    <p>
                        Welcome to Kyndra Notes. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
                    </p>
                    <h2>1. Collection of Your Information</h2>
                    <p>
                        We may collect information about you in a variety of ways. The information we may collect via the Application depends on the content and materials you use, and includes:
                    </p>
                    <ul>
                        <li><strong>Personal Data:</strong> We do not collect personal data such as your name or email address. Authentication is handled through Google Sign-In, and we do not store your Google account information.</li>
                        <li><strong>Note Data:</strong> All notes, tasks, meetings, spaces, and boards you create are stored exclusively in your web browser's local storage. This data is not transmitted to, or stored on, any external servers. We do not have access to your notes.</li>
                        <li><strong>API Keys:</strong> If you provide an API key (e.g., for Gemini), it is also stored only in your browser's local storage and is used directly by your browser to make requests to the respective third-party service. It is never sent to our servers.</li>
                    </ul>

                    <h2>2. Use of Your Information</h2>
                    <p>
                        Since all data is stored locally on your device, we do not use your information for any purpose. The application uses the data you provide solely to function as intended—to store, organize, and display your notes and other content.
                    </p>
                    
                    <h2>3. Security of Your Information</h2>
                    <p>
                        The security of your data depends on the security of the device and browser you use. Since your data is stored in local storage, anyone with access to your browser could potentially access your data. We recommend using a secure password for your device and keeping your browser software up to date.
                    </p>

                    <h2>4. Contact Us</h2>
                    <p>
                        If you have questions or comments about this Privacy Policy, please contact us at: contact@kyndranotes.app
                    </p>

                    <a href="/" onClick={(e) => { e.preventDefault(); onNavigate('/'); }} className="mt-8 inline-block text-blue-600 hover:underline">
                        &larr; Back to Home
                    </a>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;