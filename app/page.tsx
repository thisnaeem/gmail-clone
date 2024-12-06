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
import ComposeModal from './components/ComposeModal';

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

// Add this new component for better loading skeleton
const LoadingEmailSkeleton = () => (
  <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-700/50 animate-pulse">
    {/* Checkbox */}
    <div className="w-5 h-5 rounded bg-gray-700/50"></div>
    {/* Star */}
    <div className="w-5 h-5 rounded bg-gray-700/50"></div>
    {/* Content */}
    <div className="flex-1 flex items-center gap-4 min-w-0">
      {/* Sender */}
      <div className="w-[180px] h-5 bg-gray-700/50 rounded"></div>
      {/* Subject and snippet */}
      <div className="flex-1 space-y-2">
        <div className="w-full flex gap-2">
          <div className="w-1/3 h-5 bg-gray-700/50 rounded"></div>
          <div className="w-2/3 h-5 bg-gray-700/50 rounded"></div>
        </div>
      </div>
      {/* Date */}
      <div className="w-20 h-5 bg-gray-700/50 rounded"></div>
    </div>
  </div>
);

export default function Home() {
  const { data: session, status } = useSession();
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState(new Set<string>());
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('primary');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'trash' | 'archive' | 'spam';
    message: string;
  } | null>(null);

  const observerTarget = useRef<HTMLDivElement>(null);
  const deleteSound = useRef<HTMLAudioElement | null>(null);

  const folders = [
    { name: 'Inbox', icon: InboxIcon, id: 'inbox' },
    { name: 'Starred', icon: StarIcon, id: 'starred' },
    { name: 'Sent', icon: PaperAirplaneIcon, id: 'sent' },
    { name: 'Trash', icon: TrashIcon, id: 'trash' },
  ];

  const fetchEmails = async (pageToken?: string) => {
    try {
      const params = new URLSearchParams();
      if (pageToken) {
        params.append('pageToken', pageToken);
      }
      const response = await fetch(`/api/emails?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch emails');
      return await response.json();
    } catch (error) {
      console.error('Error fetching emails:', error);
      return null;
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

  useEffect(() => {
    if (session) {
      loadInitialEmails();
    }
  }, [session]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading && !loadingMore && hasMore) {
          loadMoreEmails();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, nextPageToken]);

  useEffect(() => {
    setSelectedEmails(new Set());
  }, [searchQuery]);

  useEffect(() => {
    // Initialize audio element
    deleteSound.current = new Audio('/delete.mp3');
  }, []);

  const toggleSelectAll = () => {
    if (selectedEmails.size === filteredEmails.length) {
      // If all are selected, clear selection
      setSelectedEmails(new Set());
    } else {
      // If not all are selected, select all visible emails
      const newSelection = new Set(filteredEmails.map(email => email.id));
      setSelectedEmails(newSelection);
    }
  };

  const toggleEmailSelection = (emailId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelection = new Set(selectedEmails);
    if (newSelection.has(emailId)) {
      newSelection.delete(emailId);
    } else {
      newSelection.add(emailId);
    }
    setSelectedEmails(newSelection);
  };

  const handleAction = (type: 'trash' | 'archive' | 'spam') => {
    const actionMessages = {
      trash: {
        title: 'Delete',
        message: `Are you sure you want to delete ${selectedEmails.size === 1 ? 'this conversation' : 'these conversations'}?`
      },
      archive: {
        title: 'Archive',
        message: `Are you sure you want to archive ${selectedEmails.size === 1 ? 'this conversation' : 'these conversations'}?`
      },
      spam: {
        title: 'Mark as spam',
        message: `Are you sure you want to mark ${selectedEmails.size === 1 ? 'this conversation' : 'these conversations'} as spam?`
      }
    };

    setConfirmAction({
      type,
      message: actionMessages[type].message
    });
    setShowConfirmModal(true);
  };

  const handleConfirmAction = async () => {
    if (!confirmAction || selectedEmails.size === 0) return;

    try {
      let endpoint = '/api/emails/action';
      if (confirmAction.type === 'trash') {
        endpoint = '/api/emails/delete';
      }

      // First update UI optimistically
      const deletedIds = new Set(Array.from(selectedEmails));
      setEmails(prev => prev.filter(email => !deletedIds.has(email.id)));
      setSelectedEmails(new Set());
      setShowConfirmModal(false);
      setConfirmAction(null);

      // Then make API call
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ids: Array.from(deletedIds),
          action: confirmAction.type,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete emails');
      }

      // Play delete sound if action is 'trash'
      if (confirmAction.type === 'trash' && deleteSound.current) {
        try {
          await deleteSound.current.play();
        } catch (error) {
          console.error('Error playing delete sound:', error);
        }
      }

      // Refresh the email list to ensure sync with server
      await loadInitialEmails();
    } catch (error) {
      console.error('Error performing action:', error);
      // Show error message and revert changes
      alert('Failed to delete emails. Please try again.');
      await loadInitialEmails(); // Reload to revert changes
    }
  };

  const handleRefresh = () => {
    loadInitialEmails();
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const filteredEmails = emails.filter(email => 
    email.category === selectedCategory &&
    (!searchQuery || 
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.snippet.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Calculate counts for each category
  const categoryCounts = emails.reduce((acc, email) => {
    acc[email.category]++;
    return acc;
  }, {
    primary: 0,
    promotions: 0,
    social: 0,
    updates: 0,
  } as CategoryCounts);

  if (status === 'loading') {
    return <LoadingScreen />;
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-sm w-full">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-white">Welcome to Gmail</h1>
              <p className="text-gray-400">Sign in to continue to Gmail</p>
            </div>
            <button
              onClick={() => signIn('google')}
              className="w-full bg-blue-600 text-white rounded-lg py-2 px-4 flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>
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
          <button 
            onClick={() => setIsComposeOpen(true)}
            className="w-full bg-blue-600 text-white rounded-full py-3 px-6 flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
          >
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
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="divide-y divide-gray-700/50">
              {[...Array(8)].map((_, index) => (
                <LoadingEmailSkeleton key={index} />
              ))}
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-gray-400 space-y-4">
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
                <InboxIcon className="w-8 h-8 text-gray-600" />
              </div>
              {searchQuery ? (
                <>
                  <p className="text-lg font-medium">No emails found matching your search</p>
                  <p className="text-sm text-gray-500">Try different keywords or filters</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-medium">No emails found</p>
                  <p className="text-sm text-gray-500">Your inbox is empty</p>
                </>
              )}
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

              {/* Loading more indicator */}
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
      </div>

      {/* Modals */}
      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
      />

      {showConfirmModal && confirmAction && (
        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmAction}
          title={`${confirmAction.type === 'trash' ? 'Delete' : confirmAction.type === 'archive' ? 'Archive' : 'Mark as spam'}`}
          message={confirmAction.message}
          type="danger"
        />
      )}

      {/* Email Detail */}
      {selectedEmailId && (
        <EmailDetail
          emailId={selectedEmailId}
          onClose={() => setSelectedEmailId(null)}
        />
      )}
    </div>
  );
}
