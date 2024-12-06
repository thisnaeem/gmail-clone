export default function LoadingSpinner({ size = 'large' }: { size?: 'small' | 'medium' | 'large' }) {
  const sizeClasses = {
    small: 'w-5 h-5',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-700 border-t-blue-500 ease-linear`}
      />
    </div>
  );
}

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center flex-col gap-4">
      <LoadingSpinner size="large" />
      <p className="text-gray-300 animate-pulse">Loading your emails...</p>
    </div>
  );
}

export function LoadingEmailItem() {
  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-700/50 animate-pulse">
      {/* Checkbox */}
      <div className="w-5 h-5 bg-gray-700 rounded" />
      
      {/* Star */}
      <div className="w-5 h-5 bg-gray-700" />
      
      {/* Content */}
      <div className="flex-1 flex items-center gap-4">
        {/* Sender */}
        <div className="w-48">
          <div className="h-4 bg-gray-700 rounded w-32" />
        </div>
        
        {/* Subject and Snippet */}
        <div className="flex-1">
          <div className="h-4 bg-gray-700 rounded w-2/3" />
        </div>
        
        {/* Date */}
        <div className="w-20">
          <div className="h-4 bg-gray-700 rounded w-16 ml-auto" />
        </div>
      </div>
    </div>
  );
} 