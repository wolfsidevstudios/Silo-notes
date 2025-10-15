import React, { useState } from 'react';
import { CloseIcon, SendIcon } from './icons';

declare global {
  interface Window { gapi: any; }
}

interface ShareViaEmailModalProps {
  noteTitle: string;
  noteContent: string;
  onClose: () => void;
}

const ShareViaEmailModal: React.FC<ShareViaEmailModalProps> = ({ noteTitle, noteContent, onClose }) => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState(noteTitle);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const createDraft = async () => {
    if (!to.trim() || !subject.trim()) {
      setError('Please fill in the recipient and subject fields.');
      return;
    }
    setStatus('loading');
    setError('');

    const emailLines = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      `<h1>${noteTitle}</h1>`,
      noteContent
    ];
    const email = emailLines.join('\r\n');
    
    // Using btoa which is sufficient for this use case as UTF-8 characters will be in the HTML body
    const base64EncodedEmail = btoa(email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    
    try {
      await window.gapi.client.gmail.users.drafts.create({
        'userId': 'me',
        'resource': {
          'message': {
            'raw': base64EncodedEmail
          }
        }
      });
      setStatus('success');
      setTimeout(onClose, 1500);
    } catch (e) {
      console.error("Error creating draft", e);
      setStatus('error');
      setError('Failed to create draft. Check console for details.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg m-4 flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Share Note via Email</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><CloseIcon /></button>
        </div>
        <div className="p-6 space-y-4">
            <div>
                <label htmlFor="email-to" className="block text-sm font-medium text-gray-700 mb-1">To:</label>
                <input type="email" id="email-to" value={to} onChange={e => setTo(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black" placeholder="recipient@example.com" />
            </div>
             <div>
                <label htmlFor="email-subject" className="block text-sm font-medium text-gray-700 mb-1">Subject:</label>
                <input type="text" id="email-subject" value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Body:</label>
                <div className="w-full p-3 h-48 border border-gray-200 rounded-md bg-gray-50 overflow-y-auto" dangerouslySetInnerHTML={{ __html: noteContent }}></div>
            </div>
        </div>
        <div className="p-6 border-t flex justify-end items-center gap-4">
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
                onClick={createDraft}
                disabled={status === 'loading' || status === 'success'}
                className="bg-black text-white font-semibold py-2 px-6 rounded-full hover:bg-gray-800 transition-colors disabled:bg-gray-400 flex items-center gap-2"
            >
                {status === 'idle' && <><SendIcon /> Create Draft</>}
                {status === 'loading' && 'Creating...'}
                {status === 'success' && 'Draft Created!'}
                {status === 'error' && 'Try Again'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ShareViaEmailModal;