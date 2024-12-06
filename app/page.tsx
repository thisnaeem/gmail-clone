'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { 
  InboxIcon, 
  StarIcon, 
  PaperAirplaneIcon, 
  TrashIcon,
  ArrowRightOnRectangleIcon,
  EnvelopeIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import LoadingSpinner, { LoadingScreen, LoadingEmailItem } from './components/LoadingSpinner';
import EmailDetail from './components/EmailDetail';
import Header from './components/Header';
import EmailTabs from './components/EmailTabs';
import ConfirmModal from './components/ConfirmModal';

interface Email {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  date: string;
  category: 'primary' | 'promotions' | 'social' | 'updates';
}

type CategoryCounts = {
  primary: number;
  promotions: number;
  social: number;
  updates: number;
};

const formatEmailDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const emailDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // If it's today, show time
  if (emailDate.getTime() === today.getTime()) {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: 'numeric',
      hour12: true 
    });
  }

  // If it's this year, show month and day
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }

  // If it's a different year, show year
  return date.toLocaleDateString('en-US', { 
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function Home() {
  const { data: session, status } = useSession();
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [selectedCategory, setSelectedCategory] = useState('primary');
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action: 'trash' | 'archive' | 'spam' | null;
    title: string;
    message: string;
  }>({
    isOpen: false,
    action: null,
    title: '',
    message: ''
  });

  const observerTarget = useRef<HTMLDivElement>(null);

  const folders = [
    { name: 'Inbox', icon: InboxIcon, id: 'inbox' },
    { name: 'Starred', icon: StarIcon, id: 'starred' },
    { name: 'Sent', icon: PaperAirplaneIcon, id: 'sent' },
    { name: 'Trash', icon: TrashIcon, id: 'trash' },
  ];

  const fetchEmails = async (pageToken?: string) => {
    try {
      const url = new URL('/api/emails', window.location.origin);
      if (pageToken) {
        url.searchParams.set('pageToken', pageToken);
      }
      url.searchParams.set('category', selectedCategory);

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch emails');
      }

      const data = await response.json();
      
      // Sort emails by date before returning
      if (data.emails) {
        data.emails.sort((a: Email, b: Email) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching emails:', error);
    }
  };

  const loadInitialEmails = async () => {
    setLoading(true);
    const data = await fetchEmails();
    if (data) {
      setEmails(data.emails);
      setNextPageToken(data.nextPageToken);
      setHasMore(!!data.nextPageToken);
    }
    setLoading(false);
  };

  const loadMoreEmails = async () => {
    if (loadingMore || !hasMore || !nextPageToken) return;

    setLoadingMore(true);
    const data = await fetchEmails(nextPageToken);
    if (data) {
      setEmails(prev => [...prev, ...data.emails]);
      setNextPageToken(data.nextPageToken);
      setHasMore(!!data.nextPageToken);
    }
    setLoadingMore(false);
  };

  // Initial load
  useEffect(() => {
    if (status === 'authenticated') {
      loadInitialEmails();
    }
  }, [status, selectedFolder, selectedCategory]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMoreEmails();
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, nextPageToken]);

  // Reset selected emails when search query changes
  useEffect(() => {
    setSelectedEmails(new Set());
  }, [searchQuery]);

  const filteredEmails = emails.filter(email => {
    const searchLower = searchQuery.toLowerCase();
    return (
      email.from.toLowerCase().includes(searchLower) ||
      email.subject.toLowerCase().includes(searchLower) ||
      email.snippet.toLowerCase().includes(searchLower)
    );
  });

  const toggleEmailSelection = (emailId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEmails(prev => {
      const newSet = new Set(prev);
      if (newSet.has(emailId)) {
        newSet.delete(emailId);
      } else {
        newSet.add(emailId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = useCallback(() => {
    if (selectedEmails.size === filteredEmails.length) {
      setSelectedEmails(new Set());
    } else {
      setSelectedEmails(new Set(filteredEmails.map(email => email.id)));
    }
  }, [filteredEmails, selectedEmails.size]);

  const handleAction = (action: 'trash' | 'archive' | 'spam') => {
    const actionMessages = {
      trash: {
        title: 'Move to Trash',
        message: `Are you sure you want to move ${selectedEmails.size} ${selectedEmails.size === 1 ? 'email' : 'emails'} to trash?`
      },
      archive: {
        title: 'Archive Emails',
        message: `Are you sure you want to archive ${selectedEmails.size} ${selectedEmails.size === 1 ? 'email' : 'emails'}?`
      },
      spam: {
        title: 'Mark as Spam',
        message: `Are you sure you want to mark ${selectedEmails.size} ${selectedEmails.size === 1 ? 'email' : 'emails'} as spam?`
      }
    };

    setConfirmModal({
      isOpen: true,
      action,
      title: actionMessages[action].title,
      message: actionMessages[action].message
    });
  };

  const performAction = async (action: 'trash' | 'archive' | 'spam') => {
    try {
      const response = await fetch('/api/emails/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ids: Array.from(selectedEmails),
          action,
        }),
      });

      if (!response.ok) throw new Error(`Failed to ${action} emails`);

      // Remove affected emails from the list
      setEmails(prev => prev.filter(email => !selectedEmails.has(email.id)));
      setSelectedEmails(new Set());
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
    }
  };

  const handleRefresh = () => {
    loadInitialEmails();
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedEmails(new Set());
  };

  // Calculate counts for each category
  const categoryCounts = emails.reduce<CategoryCounts>((acc, email) => {
    acc[email.category] = (acc[email.category] || 0) + 1;
    return acc;
  }, {
    primary: 0,
    promotions: 0,
    social: 0,
    updates: 0,
  });

  if (status === 'loading') {
    return <LoadingScreen />;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="relative w-full max-w-md p-8 mx-4">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl backdrop-blur-xl"></div>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-10 blur-2xl animate-pulse"></div>
          
          {/* Content */}
          <div className="relative bg-gray-900/60 p-8 rounded-2xl border border-gray-700/50 backdrop-blur-xl shadow-2xl">
            <div className="flex flex-col items-center space-y-8">
              {/* Logo */}
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full shadow-lg">
                <EnvelopeIcon className="w-8 h-8 text-white" />
              </div>

              {/* Text */}
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  Welcome to Gmail
                </h1>
                <p className="text-gray-400">
                  Sign in with your Google account to continue
                </p>
              </div>

              {/* Sign in Button */}
              <button
                onClick={() => signIn('google', { callbackUrl: '/' })}
                className="group relative w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl py-4 px-8 hover:opacity-95 transition-all duration-200 shadow-lg hover:shadow-blue-500/20"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl opacity-0 group-hover:opacity-100 blur transition-opacity"></div>
                <div className="relative flex items-center justify-center gap-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z"
                    />
                  </svg>
                  <span className="font-medium">Sign in with Google</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex-shrink-0">
        <div className="p-4">
          <button className="w-full bg-blue-600 text-white rounded-full py-3 px-6 flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
            Compose
          </button>
        </div>
        <div className="px-4 py-2 border-b border-gray-700">
          <div className="flex items-center gap-2">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || 'User avatar'}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <UserCircleIcon className="w-8 h-8 text-gray-400" />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-white truncate">
                {session?.user?.name || 'User'}
              </div>
              <div className="text-gray-400 text-sm truncate">
                {session?.user?.email || 'Loading...'}
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-full transition-colors tooltip"
              data-tooltip="Sign out"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
        <nav className="mt-2">
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setSelectedFolder(folder.id)}
              className={`w-full flex items-center gap-3 px-6 py-3 text-sm ${
                selectedFolder === folder.id
                  ? 'bg-gray-700 text-blue-400'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <folder.icon className="w-5 h-5" />
              {folder.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-900 min-w-0">
        {/* Header */}
        <Header
          selectedCount={selectedEmails.size}
          totalCount={filteredEmails.length}
          onSelectAll={toggleSelectAll}
          onDelete={() => handleAction('trash')}
          onArchive={() => handleAction('archive')}
          onMarkSpam={() => handleAction('spam')}
          onRefresh={handleRefresh}
          loading={loading || loadingMore}
          searchQuery={searchQuery}
          onSearchChange={(value) => setSearchQuery(value)}
          onClearSearch={clearSearch}
        />

        {/* Email Tabs */}
        <EmailTabs
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          counts={categoryCounts}
          newCounts={{
            primary: 0,
            promotions: 0,
            social: 17,
            updates: 50
          }}
        />

        {/* Email List */}
        <div className="flex-1 overflow-auto hide-scrollbar">
          {loading ? (
            <div className="space-y-1">
              <LoadingEmailItem />
              <LoadingEmailItem />
              <LoadingEmailItem />
              <LoadingEmailItem />
              <LoadingEmailItem />
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="text-center p-8 text-gray-400">
              {searchQuery ? 'No emails found matching your search' : 'No emails found'}
            </div>
          ) : (
            <>
              {filteredEmails.map((email) => (
                <div
                  key={email.id}
                  onClick={() => setSelectedEmailId(email.id)}
                  className="group flex items-center gap-2 px-4 py-2 hover:bg-gray-800/50 cursor-pointer border-b border-gray-700/50"
                >
                  {/* Checkbox */}
                  <div 
                    onClick={(e) => toggleEmailSelection(email.id, e)}
                    className={`
                      w-5 h-5 rounded border cursor-pointer flex items-center justify-center transition-colors
                      ${selectedEmails.has(email.id)
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-600 group-hover:border-gray-400'
                      }
                    `}
                  >
                    {selectedEmails.has(email.id) && (
                      <CheckIcon className="w-3 h-3 text-white" />
                    )}
                  </div>

                  {/* Star */}
                  <button 
                    className="text-gray-500 hover:text-yellow-400 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add star functionality here
                    }}
                  >
                    <StarIcon className="w-5 h-5" />
                  </button>

                  {/* Email Content */}
                  <div className="flex-1 min-w-0 flex items-center gap-4">
                    {/* Sender */}
                    <div className="w-48 truncate font-medium text-gray-200">
                      {email.from.split('<')[0].trim()}
                    </div>

                    {/* Subject and Snippet */}
                    <div className="flex-1 truncate">
                      <span className="text-gray-200">{email.subject}</span>
                      <span className="text-gray-400 mx-2">-</span>
                      <span className="text-gray-400">{email.snippet}</span>
                    </div>

                    {/* Date */}
                    <div className="w-20 text-right text-sm text-gray-400 whitespace-nowrap">
                      {formatEmailDate(email.date)}
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              <div ref={observerTarget} className="py-4">
                {loadingMore && (
                  <div className="flex justify-center">
                    <LoadingSpinner size="small" />
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Email Detail Modal */}
        {selectedEmailId && (
          <EmailDetail
            emailId={selectedEmailId}
            onClose={() => setSelectedEmailId(null)}
          />
        )}

        {/* Confirmation Modal */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
          onConfirm={() => {
            if (confirmModal.action) {
              performAction(confirmModal.action);
            }
          }}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText="OK"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </div>
  );
}
