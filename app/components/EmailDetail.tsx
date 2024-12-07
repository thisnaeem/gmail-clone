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
  ExclamationTriangleIcon,
  UserCircleIcon,
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
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 h-full shadow-xl flex flex-col">
        {/* Header */}
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => {}}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArchiveBoxIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => {}}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ExclamationTriangleIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => {}}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => {}}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <EnvelopeIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => {}}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowUturnLeftIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {}}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => {}}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
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
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {email.subject}
                  </h1>
                  <button
                    onClick={() => setIsStarred(!isStarred)}
                    className={`p-1 rounded-full transition-colors ${
                      isStarred
                        ? 'text-yellow-500 bg-yellow-500/10'
                        : 'text-gray-400 dark:text-gray-500 hover:text-yellow-500 hover:bg-yellow-500/10'
                    }`}
                  >
                    <StarIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <UserCircleIcon className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {email.from.split('<')[0].trim()}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {`<${email.from.split('<')[1]?.replace('>', '')}>`}
                        </span>
                      </div>
                      <button
                        onClick={() => setShowFullHeader(!showFullHeader)}
                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        {showFullHeader ? 'Show less' : 'Show more'}
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(email.date).toLocaleString()}
                  </div>
                </div>

                {showFullHeader && (
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">To: </span>
                      <span className="text-gray-900 dark:text-gray-100">{email.to}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Date: </span>
                      <span className="text-gray-900 dark:text-gray-100">
                        {new Date(email.date).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Email Body */}
              <div className="prose dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: email.body }} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-gray-500 dark:text-gray-400">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <ExclamationTriangleIcon className="w-8 h-8 text-gray-400 dark:text-gray-600" />
              </div>
              <p className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                Failed to load email
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Please try again later
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 