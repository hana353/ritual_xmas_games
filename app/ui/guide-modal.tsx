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
            <h3 className="text-xl font-bold text-gray-800 mb-2">🎄 Decorate Your Christmas</h3>
            <p className="text-gray-600">
              Create your own unique Christmas photo decoration! Select a menu option to see available items.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="font-bold text-gray-800 mb-1">1. Select a Menu</h4>
              <p className="text-gray-600 text-sm">
                Click on any menu option (Background, Trees, Pets, Ribbons, Items, or Siggy) to see available items. 
                The item list will appear after selecting a menu option.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-1">2. Choose Background</h4>
              <p className="text-gray-600 text-sm">
                Select a background from the "Background" menu. Only one background can be selected at a time, 
                and it will automatically fill the entire canvas.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-1">3. Add Trees</h4>
              <p className="text-gray-600 text-sm">
                - Select "Trees" from the menu to see available trees<br/>
                - Click on a tree to add it to your canvas (you can add multiple trees!)<br/>
                - On mobile: Click a tree to see its variants (.2, .3, .4) below<br/>
                - On desktop: Tree variants appear next to the selected tree
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-1">4. Add Decorations</h4>
              <p className="text-gray-600 text-sm">
                Use the "Items", "Pets", "Ribbons", or "Siggy" menu to add decorations. 
                Click on an item to place it on the canvas.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-1">5. Move and Adjust</h4>
              <p className="text-gray-600 text-sm">
                - <strong>Drag</strong> items to move them around<br/>
                - <strong>Resize</strong> by dragging the corners<br/>
                - <strong>Rotate</strong> by hovering over an item and dragging the rotation handle at the bottom-right corner<br/>
                - <strong>Delete</strong> items by double-clicking (or double-tapping on mobile)<br/>
                - <strong>Delete trees</strong> by double-clicking on them or using the delete button (🗑️) when hovering
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-1">6. Save and Share</h4>
              <p className="text-gray-600 text-sm">
                - Click <strong>"Save"</strong> to save your progress locally<br/>
                - Click <strong>"Clear"</strong> to remove everything and start over<br/>
                - Click <strong>"Share to X"</strong> to export an image and share on X (Twitter)
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-1">7. Share on X</h4>
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
              <strong>💡 Tips:</strong><br/>
              • You can add multiple trees and decorations to create a unique scene!<br/>
              • On mobile, scroll horizontally to see all items in the menu<br/>
              • Use the rotation controls to fine-tune your decoration angles<br/>
              • Backgrounds automatically fill the canvas - no resizing needed!
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
