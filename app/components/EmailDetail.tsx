'use client';

import { useState, useEffect } from 'react';
import {
  XMarkIcon,
  ArchiveBoxIcon,
  ExclamationCircleIcon,
  TrashIcon,
  ArrowUturnLeftIcon,
  EnvelopeIcon,
  EllipsisHorizontalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
  PrinterIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import LoadingSpinner from './LoadingSpinner';

interface EmailDetailProps {
  emailId: string | null;
  onClose: () => void;
}

interface EmailContent {
  id: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  body: string;
}

const formatDetailDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
};

export default function EmailDetail({ emailId, onClose }: EmailDetailProps) {
  const [email, setEmail] = useState<EmailContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStarred, setIsStarred] = useState(false);
  const [showFullHeader, setShowFullHeader] = useState(false);

  useEffect(() => {
    if (emailId) {
      fetchEmailDetail();
    }
  }, [emailId]);

  const fetchEmailDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/emails/${emailId}`);
      if (!response.ok) throw new Error('Failed to fetch email');
      const data = await response.json();
      setEmail(data);
    } catch (error) {
      console.error('Error fetching email:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!emailId) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-50">
      <div className="w-full max-w-4xl bg-gradient-to-b from-gray-800 to-gray-900 h-full shadow-xl flex flex-col">
        {/* Header */}
        <div className="px-4 py-2 border-b border-gray-700/50 flex items-center justify-between bg-gray-800/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-all duration-200 text-gray-400 hover:text-white"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => {}}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-all duration-200 text-gray-400 hover:text-white"
            >
              <ArchiveBoxIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => {}}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-all duration-200 text-gray-400 hover:text-white"
            >
              <ExclamationCircleIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => {}}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-all duration-200 text-gray-400 hover:text-white"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => {}}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-all duration-200 text-gray-400 hover:text-white"
            >
              <EnvelopeIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => {}}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-all duration-200 text-gray-400 hover:text-white"
            >
              <ArrowUturnLeftIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {}}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-all duration-200 text-gray-400 hover:text-white"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => {}}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-all duration-200 text-gray-400 hover:text-white"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <LoadingSpinner size="medium" />
            </div>
          ) : email ? (
            <div className="p-6 space-y-6">
              {/* Email Header */}
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <h1 className="text-2xl font-semibold text-white flex-1">{email.subject}</h1>
                  <div className="flex items-center gap-2 text-gray-400">
                    <button
                      onClick={() => {}}
                      className="p-2 hover:bg-gray-700/50 rounded-lg transition-all duration-200 hover:text-white"
                    >
                      <PrinterIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {}}
                      className="p-2 hover:bg-gray-700/50 rounded-lg transition-all duration-200 hover:text-white"
                    >
                      <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {}}
                      className="p-2 hover:bg-gray-700/50 rounded-lg transition-all duration-200 hover:text-white"
                    >
                      <EllipsisHorizontalIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Sender Info */}
                <div className="flex items-start justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center font-medium text-lg">
                      {email.from.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{email.from.split('<')[0].trim()}</span>
                        <span className="text-sm text-gray-400">{`<${email.from.split('<')[1]?.replace('>', '')}>`}</span>
                      </div>
                      <button 
                        onClick={() => setShowFullHeader(!showFullHeader)}
                        className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        to {email.to.split('@')[0]}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <span className="text-sm">{formatDetailDate(email.date)}</span>
                    <button
                      onClick={() => setIsStarred(!isStarred)}
                      className="p-2 hover:bg-gray-700/50 rounded-lg transition-all duration-200 hover:text-yellow-400"
                    >
                      {isStarred ? (
                        <StarIconSolid className="w-5 h-5 text-yellow-400" />
                      ) : (
                        <StarIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Full Header Details */}
                {showFullHeader && (
                  <div className="p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl text-sm space-y-2 border border-gray-700/50">
                    <div>
                      <span className="text-gray-400">From: </span>
                      <span className="text-white">{email.from}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">To: </span>
                      <span className="text-white">{email.to}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Date: </span>
                      <span className="text-white">{formatDetailDate(email.date)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Subject: </span>
                      <span className="text-white">{email.subject}</span>
                    </div>
                  </div>
                )}

                {/* Email Body */}
                <div className="mt-6 border-t border-gray-700/50 pt-6">
                  <div 
                    className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-white prose-strong:text-white prose-a:text-blue-400 hover:prose-a:text-blue-300 prose-pre:bg-gray-800/50 prose-pre:text-gray-300 prose-code:text-gray-300 prose-blockquote:text-gray-400 prose-blockquote:border-gray-700"
                    dangerouslySetInnerHTML={{ __html: email.body }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-full text-gray-400">
              Failed to load email content
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 