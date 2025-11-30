'use client';

export default function CapturingModal({
  isOpen,
}: {
  isOpen: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 text-center max-w-sm">
        <div className="mb-6">
          <div className="inline-block">
            <div className="animate-spin">
              <svg
                className="w-16 h-16 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Capturing Image</h2>
        <p className="text-gray-600">Please wait while we prepare your decoration...</p>
      </div>
    </div>
  );
}
