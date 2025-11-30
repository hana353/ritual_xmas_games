'use client';

import React from 'react';

export default function ExportModal({
  isOpen,
  imageUrl,
  onClose,
  onCopy,
  onSave,
  onShare,
  isCopying,
  isSaving,
}: {
  isOpen: boolean;
  imageUrl: string | null;
  onClose: () => void;
  onCopy: () => void;
  onSave: () => void;
  onShare: () => void;
  isCopying: boolean;
  isSaving: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Your Decoration</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Image Preview */}
        {imageUrl && (
          <div className="p-6 flex justify-center bg-gray-50">
            <img
              src={imageUrl}
              alt="Exported decoration"
              className="max-w-full h-auto rounded-lg shadow-md max-h-[400px] object-contain"
              onError={(e) => {
                console.error('Failed to load exported image');
                // If image fails to load, it might be invalid - show placeholder
                e.currentTarget.style.display = 'none';
              }}
              onLoad={() => {
                // Image loaded successfully
                console.log('Exported image loaded successfully');
              }}
            />
          </div>
        )}
        {!imageUrl && (
          <div className="p-6 flex justify-center bg-gray-50">
            <div className="text-gray-500 text-center">
              <p>No image available. Please export again.</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 flex gap-3 justify-center flex-wrap">
          <button
            onClick={onCopy}
            disabled={isCopying}
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition"
          >
            {isCopying ? 'Copying...' : '📋 Copy Image'}
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition"
          >
            {isSaving ? 'Saving...' : '💾 Save Image'}
          </button>
          <button
            onClick={onShare}
            className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-6 rounded-lg transition flex items-center gap-2"
          >
            Share to X
          </button>
        </div>
      </div>
    </div>
  );
}
