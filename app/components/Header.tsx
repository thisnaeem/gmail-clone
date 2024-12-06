'use client';

import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import {
  ArchiveBoxIcon,
  ExclamationCircleIcon,
  TrashIcon,
  EnvelopeIcon,
  FolderIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import ComposeModal from './ComposeModal';

interface HeaderProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onMarkSpam: () => void;
  onRefresh: () => void;
  loading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
}

export default function Header({
  selectedCount,
  totalCount,
  onSelectAll,
  onDelete,
  onArchive,
  onMarkSpam,
  onRefresh,
  loading,
  searchQuery,
  onSearchChange,
  onClearSearch,
}: HeaderProps) {
  const { data: session } = useSession();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  const selectionText = selectedCount === 0 
    ? '' 
    : selectedCount === totalCount 
      ? `All ${totalCount} conversations selected` 
      : `${selectedCount} selected`;

  return (
    <>
      <header className="bg-gray-900 border-b border-gray-700 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center flex-1 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search in emails"
                className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700 transition-colors"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowTooltip(!showTooltip)}
                className="relative flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              >
                <span className="sr-only">Open user menu</span>
                {session?.user?.image ? (
                  <Image
                    className="h-8 w-8 rounded-full"
                    src={session.user.image}
                    alt=""
                    width={32}
                    height={32}
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-700" />
                )}
              </button>

              {showTooltip && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <button
                    onClick={() => signOut()}
                    className="block w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 text-left"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 px-4 py-2">
          <button
            onClick={() => setIsComposeOpen(true)}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors flex items-center gap-2"
          >
            Compose
          </button>
        </div>
      </header>

      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
      />

      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-4 py-2">
            {/* Left Section */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={onSelectAll}
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                    selectedCount > 0
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-600 hover:border-gray-400'
                  }`}
                >
                  {selectedCount > 0 && selectedCount === totalCount ? (
                    <CheckIcon className="w-3 h-3 text-white" />
                  ) : selectedCount > 0 ? (
                    <div className="w-2 h-2 bg-white"></div>
                  ) : null}
                </button>
                {selectedCount > 0 && (
                  <span className="absolute left-7 top-1/2 -translate-y-1/2 text-sm text-gray-300">
                    {selectionText}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 ml-4">
                {selectedCount > 0 ? (
                  <>
                    <button
                      onClick={onArchive}
                      className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-full"
                      title="Archive"
                    >
                      <ArchiveBoxIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={onMarkSpam}
                      className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-full"
                      title="Report spam"
                    >
                      <ExclamationCircleIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={onDelete}
                      className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-full"
                      title="Delete"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={onRefresh}
                    className={`p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-full ${
                      loading ? 'animate-spin' : ''
                    }`}
                    title="Refresh"
                  >
                    <ArrowPathIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-4">
              <div className="flex items-center gap-2 bg-gray-700/50 rounded-lg px-4 py-2">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search emails"
                  className="bg-transparent w-full outline-none text-sm text-white placeholder-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={onClearSearch}
                    className="text-gray-400 hover:text-gray-300"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">
                1-{totalCount} of {totalCount}
              </span>
              <div className="flex items-center">
                <button
                  className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-full"
                  title="Newer"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <button
                  className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-full"
                  title="Older"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
              <button
                className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-full"
                title="Settings"
              >
                <Cog6ToothIcon className="w-5 h-5" />
              </button>
              <button
                className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-full"
                title="More"
              >
                <EllipsisHorizontalIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Selection Info Bar */}
          {selectedCount > 0 && (
            <div className="bg-gray-700/50 px-4 py-2 text-sm text-gray-300">
              <span>
                {selectedCount === totalCount ? (
                  <>
                    All {totalCount} conversations on this page are selected.{' '}
                    <button className="text-blue-400 hover:text-blue-300" onClick={onSelectAll}>
                      Select all {totalCount} conversations
                    </button>
                  </>
                ) : (
                  `${selectedCount} selected`
                )}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 