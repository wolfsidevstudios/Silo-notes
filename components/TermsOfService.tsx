import React from 'react';

interface TermsOfServiceProps {
    onNavigate: (path: string) => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onNavigate }) => {
    return (
        <div className="min-h-screen bg-gray-50 p-8 md:p-12 lg:p-16">
            <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-lg shadow-sm border">
                <h1 className="text-4xl font-bold text-gray-900 mb-6">Terms of Service</h1>
                <div className="prose max-w-none text-gray-700">
                    <p className="lead">Last updated: {new Date().toLocaleDateString()}</p>
                    <p>
                        By accessing or using Silo Notes (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the terms, then you may not access the Service.
                    </p>
                    <h2>1. Use of Service</h2>
                    <p>
                        Silo Notes is a note-taking application that stores all user-generated data in the browser's local storage. You are responsible for the content you create and for safeguarding your device to protect this data.
                    </p>
                    
                    <h2>2. User Accounts</h2>
                    <p>
                        Authentication is managed via third-party services like Google Sign-In. You are responsible for maintaining the security of your third-party account. We are not liable for any loss or damage from your failure to comply with this security obligation.
                    </p>
                    
                    <h2>3. Third-Party Services</h2>
                    <p>
                        The Service may allow you to use third-party API keys (e.g., Google Gemini). Your use of these third-party services is governed by their respective terms of service and privacy policies. We are not responsible for the data processing practices of any third party.
                    </p>
                    
                    <h2>4. Disclaimer of Warranty</h2>
                    <p>
                        The Service is provided "as is". We make no warranty that the Service will meet your requirements or be available on an uninterrupted, secure, or error-free basis. Since all data is stored locally, we are not responsible for any data loss.
                    </p>
                    
                    <h2>5. Changes to Terms</h2>
                    <p>
                        We reserve the right to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms of Service on this page.
                    </p>

                    <a href="/" onClick={(e) => { e.preventDefault(); onNavigate('/'); }} className="mt-8 inline-block text-blue-600 hover:underline">
                        &larr; Back to Home
                    </a>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
