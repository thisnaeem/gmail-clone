'use client';

import { useState } from 'react';
import { 
  XMarkIcon, 
  MinusIcon,
  PencilIcon, 
  PaperClipIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListBulletIcon as ListNumberIcon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from './LoadingSpinner';

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ComposeModal({ isOpen, onClose }: ComposeModalProps) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const isValid = to.trim() !== '' && subject.trim() !== '' && content.trim() !== '';

  const handleSend = async () => {
    if (!isValid) return;

    try {
      setSending(true);
      const response = await fetch('/api/emails/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject,
          content,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      // Clear form and close modal
      setTo('');
      setSubject('');
      setContent('');
      onClose();
    } catch (error) {
      console.error('Error sending email:', error);
      // Show error message to user
      alert('Failed to send email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleDiscard = () => {
    if (to || subject || content) {
      if (window.confirm('Are you sure you want to discard this draft?')) {
        setTo('');
        setSubject('');
        setContent('');
        onClose();
      }
    } else {
      onClose();
    }
  };

  const toggleFormatting = () => {
    setShowFormatting(!showFormatting);
  };

  const toggleAttachment = () => {
    // Implement attachment functionality
  };

  const handleFormat = (type: string) => {
    // Implement formatting functionality
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleMaximize = () => {
    setIsMinimized(false);
  };

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-0 right-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-t-lg shadow-lg w-80">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {subject || 'New Message'}
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={handleMaximize}
                className="p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <MinusIcon className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        className={`absolute bottom-4 right-4 w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl transform transition-all duration-300 ${
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">New Message</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleMinimize}
              className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <MinusIcon className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Recipients */}
          <div>
            <input
              type="text"
              placeholder="Recipients"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-3 py-2 bg-transparent text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 focus:outline-none focus:border-blue-500 dark:focus:border-blue-600"
            />
          </div>

          {/* Subject */}
          <div>
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 bg-transparent text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 focus:outline-none focus:border-blue-500 dark:focus:border-blue-600"
            />
          </div>

          {/* Message */}
          <div className="flex-1">
            <textarea
              placeholder="Write your message..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-64 px-3 py-2 bg-transparent text-gray-900 dark:text-gray-100 resize-none focus:outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSend}
              disabled={sending || !isValid}
              className={`
                px-4 py-2 rounded-lg font-medium transition-colors
                ${isValid
                  ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {sending ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="small" />
                  <span>Sending...</span>
                </div>
              ) : (
                'Send'
              )}
            </button>
            <button
              onClick={handleDiscard}
              className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Discard
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFormatting}
              className={`
                p-2 rounded-lg transition-colors
                ${showFormatting
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              <PencilIcon className="w-5 h-5" />
            </button>
            <button
              onClick={toggleAttachment}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <PaperClipIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Formatting toolbar */}
        {showFormatting && (
          <div className="absolute bottom-full left-0 right-0 p-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-t-lg shadow-lg">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFormat('bold')}
                className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <BoldIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleFormat('italic')}
                className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <ItalicIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleFormat('underline')}
                className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <UnderlineIcon className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
              <button
                onClick={() => handleFormat('list')}
                className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <ListBulletIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleFormat('numbered-list')}
                className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <ListNumberIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 