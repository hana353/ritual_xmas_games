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
          <h2 className="text-2xl font-bold text-gray-800">Hướng dẫn cách chơi</h2>
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
            <h3 className="text-xl font-bold text-gray-800 mb-2">🎄 Trang trí cây thông Giáng sinh</h3>
            <p className="text-gray-600">
              Tạo ra tác phẩm trang trí cây thông Giáng sinh độc đáo của riêng bạn!
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="font-bold text-gray-800 mb-1">1. Chọn cây thông</h4>
              <p className="text-gray-600 text-sm">
                Chọn một trong các loại cây thông có sẵn từ menu "Trees" ở phía dưới.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-1">2. Thêm đồ trang trí</h4>
              <p className="text-gray-600 text-sm">
                Chọn menu "Items", "Pets", hoặc "Ribbons" để thêm các đồ trang trí vào cây thông của bạn.
                Nhấp vào item để thêm vào canvas.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-1">3. Di chuyển và điều chỉnh</h4>
              <p className="text-gray-600 text-sm">
                - Kéo thả để di chuyển các item<br/>
                - Kéo góc để thay đổi kích thước<br/>
                - Double click (hoặc double tap trên mobile) để xóa item
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-1">4. Lưu và chia sẻ</h4>
              <p className="text-gray-600 text-sm">
                - Nhấn "Save" để lưu tiến trình<br/>
                - Nhấn "Clear" để xóa tất cả và bắt đầu lại<br/>
                - Nhấn "Share to X" để xuất ảnh và chia sẻ lên X (Twitter)
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-1">5. Chia sẻ lên X</h4>
              <p className="text-gray-600 text-sm">
                Sau khi xuất ảnh, bạn có thể:<br/>
                - Copy ảnh vào clipboard<br/>
                - Lưu ảnh về máy<br/>
                - Chia sẻ trực tiếp lên X với quote có sẵn
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Lưu ý:</strong> Nếu khi bấm "Share to X" bị lỗi, hãy nhấn "Save" để lưu tác phẩm, sau đó reload lại trang và thử lại "Share to X". Lúc này sẽ giữ được tác phẩm của bạn.
            </p>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Mẹo:</strong> Bạn có thể thêm nhiều item và sắp xếp chúng theo ý thích để tạo ra tác phẩm độc đáo!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
}

