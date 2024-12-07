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
  ExclamationTriangleIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import ComposeModal from './ComposeModal';
import { useTheme } from '../context/ThemeContext';
import LoadingSpinner from './LoadingSpinner';

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
  onSearchChange: (value: string) => void;
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
  const { theme, toggleTheme } = useTheme();

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

      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700/50">
        <div className="flex items-center gap-4 p-2">
          {/* Selection info */}
          <div className="flex items-center gap-2">
            <div 
              onClick={onSelectAll}
              className={`
                w-5 h-5 rounded border cursor-pointer flex items-center justify-center transition-colors
                ${selectedCount > 0 
                  ? 'bg-blue-500 border-blue-500 dark:bg-blue-600 dark:border-blue-600' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }
              `}
            >
              {selectedCount > 0 && (
                <span className="text-xs text-white">
                  {selectedCount === totalCount ? '✓' : '-'}
                </span>
              )}
            </div>
            {selectedCount > 0 && (
              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                <span>{selectedCount}</span>
                <span>selected</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={loading}
              className={`
                p-2 rounded-lg transition-all duration-200
                ${loading 
                  ? 'text-gray-400 dark:text-gray-600' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }
              `}
            >
              {loading ? (
                <LoadingSpinner size="small" />
              ) : (
                <ArrowPathIcon className="w-5 h-5" />
              )}
            </button>

            {selectedCount > 0 && (
              <>
                <button
                  onClick={onArchive}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200"
                >
                  <ArchiveBoxIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={onMarkSpam}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200"
                >
                  <ExclamationTriangleIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={onDelete}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search in emails"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-gray-100 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 rounded-lg pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              {searchQuery && (
                <button
                  onClick={onClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
                >
                  <XMarkIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <SunIcon className="w-5 h-5" />
            ) : (
              <MoonIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </>
  );
} 