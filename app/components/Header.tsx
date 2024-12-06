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
      ? `All ${totalCount} selected` 
      : `${selectedCount} selected`;

  return (
    <>
      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
      />

      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-6 py-3">
            {/* Left Section */}
            <div className="flex items-center gap-3">
              <div className="relative flex items-center">
                <button
                  onClick={onSelectAll}
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200 ${
                    selectedCount > 0
                      ? 'bg-blue-500 border-blue-500 scale-105'
                      : 'border-gray-600 hover:border-gray-400 hover:scale-105'
                  }`}
                  title={selectedCount === totalCount ? "Deselect all" : "Select all"}
                >
                  {selectedCount > 0 && selectedCount === totalCount ? (
                    <CheckIcon className="w-3 h-3 text-white" />
                  ) : selectedCount > 0 ? (
                    <div className="w-2 h-2 bg-white"></div>
                  ) : null}
                </button>
                {selectedCount > 0 && (
                  <span className="ml-3 text-sm text-gray-300 font-medium whitespace-nowrap">
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
                      className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded-lg transition-all duration-200 hover:scale-105"
                      title="Archive"
                    >
                      <ArchiveBoxIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={onMarkSpam}
                      className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded-lg transition-all duration-200 hover:scale-105"
                      title="Report spam"
                    >
                      <ExclamationCircleIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={onDelete}
                      className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded-lg transition-all duration-200 hover:scale-105"
                      title="Delete"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={onRefresh}
                    className={`p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded-lg transition-all duration-200 hover:scale-105 ${
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
            <div className="flex-1 max-w-2xl mx-6">
              <div className="group relative">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                <div className="relative flex items-center gap-3 bg-gray-800/90 backdrop-blur-lg rounded-full px-4 py-2.5 border border-gray-700/50 shadow-lg transition-all duration-300 group-hover:border-gray-600/50">
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-300 transition-colors duration-200" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search emails"
                    className="bg-transparent w-full outline-none text-sm text-white placeholder-gray-400 group-hover:placeholder-gray-300 transition-colors duration-200"
                  />
                  {searchQuery && (
                    <button
                      onClick={onClearSearch}
                      className="text-gray-400 hover:text-gray-200 transition-colors duration-200"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400 font-medium">
                1-{totalCount} of {totalCount}
              </span>
              <div className="flex items-center gap-1">
                <button
                  className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded-lg transition-all duration-200 hover:scale-105"
                  title="Newer"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <button
                  className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded-lg transition-all duration-200 hover:scale-105"
                  title="Older"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
              <button
                className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded-lg transition-all duration-200 hover:scale-105"
                title="Settings"
              >
                <Cog6ToothIcon className="w-5 h-5" />
              </button>
              <button
                className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded-lg transition-all duration-200 hover:scale-105"
                title="More"
              >
                <EllipsisHorizontalIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Selection Info Bar */}
          {selectedCount > 0 && (
            <div className="bg-gray-700/30 backdrop-blur-sm px-6 py-2.5 text-sm text-gray-300 transition-all duration-200">
              <div className="flex items-center justify-between max-w-7xl mx-auto">
                <span className="flex-1">
                  {selectedCount === totalCount ? (
                    <span className="flex items-center gap-2">
                      <span>All conversations on this page are selected.</span>
                      <button 
                        className="text-blue-400 hover:text-blue-300 transition-colors duration-200 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-1 focus:ring-offset-gray-800 rounded px-2 py-0.5" 
                        onClick={onSelectAll}
                      >
                        Deselect all
                      </button>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span>{selectedCount} selected</span>
                      <button 
                        className="text-blue-400 hover:text-blue-300 transition-colors duration-200 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-1 focus:ring-offset-gray-800 rounded px-2 py-0.5" 
                        onClick={onSelectAll}
                      >
                        Select all {totalCount} conversations
                      </button>
                    </span>
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 