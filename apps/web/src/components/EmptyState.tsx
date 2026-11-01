'use client';

import React from 'react';
import { Coffee } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title = 'Không tìm thấy dữ liệu',
  description = 'Hiện chưa có sản phẩm hoặc thông tin phù hợp.',
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center my-8">
      <div className="w-16 h-16 rounded-full bg-brew-50 text-brew-600 flex items-center justify-center mb-4">
        <Coffee className="w-8 h-8" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-xs mb-4">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-brew-600 text-white rounded-xl text-xs font-medium hover:bg-brew-700 transition"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
