'use client';

import React from 'react';

export default function GuideModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">How to Play</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">🎄 Decorate Your Christmas Tree</h3>
            <p className="text-gray-600">
              Create your own unique Christmas tree decoration!
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="font-bold text-gray-800 mb-1">1. Choose a Tree</h4>
              <p className="text-gray-600 text-sm">
                Select one of the available trees from the "Trees" menu below.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-1">2. Add Decorations</h4>
              <p className="text-gray-600 text-sm">
                Use the "Items", "Pets", or "Ribbons" menu to add decorations to your tree.
                Click on an item to place it on the canvas.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-1">3. Move and Adjust</h4>
              <p className="text-gray-600 text-sm">
                - Drag and drop to move items<br/>
                - Drag corners to resize<br/>
                - Double click (or double tap on mobile) to remove an item
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-1">4. Save and Share</h4>
              <p className="text-gray-600 text-sm">
                - Click "Save" to save your progress<br/>
                - Click "Clear" to remove everything and start over<br/>
                - Click "Share to X" to export an image and share on X (Twitter)
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-1">5. Share on X</h4>
              <p className="text-gray-600 text-sm">
                After exporting the image, you can:<br/>
                - Copy the image to your clipboard<br/>
                - Save the image to your device<br/>
                - Share directly on X with a pre-filled quote
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Note:</strong> If "Share to X" fails, click "Save" to save your work, then reload the page and try "Share to X" again. This will preserve your decoration.
            </p>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Tip:</strong> You can add multiple items and arrange them as you like to create a unique decoration!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
