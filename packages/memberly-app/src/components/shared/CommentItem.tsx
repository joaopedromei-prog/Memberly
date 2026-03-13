'use client';

import { useState } from 'react';
import { formatRelativeDate } from '@/lib/utils/format';
import { CommentForm } from '@/components/shared/CommentForm';

export interface CommentProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: 'member' | 'admin';
}

export interface CommentData {
  id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  profile: CommentProfile;
  replies?: CommentData[];
}

interface CommentItemProps {
  comment: CommentData;
  lessonId: string;
  onReplyAdded: (parentId: string, reply: CommentData) => void;
}

export function CommentItem({ comment, lessonId, onReplyAdded }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);

  const initial = comment.profile.full_name?.charAt(0).toUpperCase() || '?';
  const isAdmin = comment.profile.role === 'admin';
  const isReply = comment.parent_id !== null;

  function handleReplySuccess(reply: CommentData) {
    onReplyAdded(comment.id, reply);
    setShowReplyForm(false);
  }

  return (
    <div role="listitem">
      <div className="flex gap-3">
        {/* Avatar */}
        {comment.profile.avatar_url ? (
          <img
            src={comment.profile.avatar_url}
            alt={comment.profile.full_name}
            className="h-8 w-8 flex-shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-dark-card text-sm font-semibold text-white">
            {initial}
          </div>
        )}

        <div className="min-w-0 flex-1">
          {/* Author + date */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">
              {comment.profile.full_name}
            </span>
            {isAdmin && (
              <span
                className="inline-flex items-center rounded px-2 py-0.5 text-xs font-bold text-white"
                style={{ backgroundColor: 'var(--color-primary)' }}
                aria-label="Administrador"
              >
                Admin
              </span>
            )}
            <span className="text-sm text-[#808080]">
              {formatRelativeDate(comment.created_at)}
            </span>
          </div>

          {/* Content */}
          <p className="mt-1 whitespace-pre-line text-base text-white">
            {comment.content}
          </p>

          {/* Reply button (only for top-level comments) */}
          {!isReply && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              aria-expanded={showReplyForm}
              className="mt-1 min-h-[44px] text-sm text-[#B3B3B3] transition-colors hover:text-white"
            >
              Responder
            </button>
          )}

          {/* Reply form */}
          {showReplyForm && (
            <div className="mt-2 animate-[fadeIn_200ms_ease-out]">
              <CommentForm
                lessonId={lessonId}
                parentId={comment.id}
                onSuccess={handleReplySuccess}
                onCancel={() => setShowReplyForm(false)}
                isReply
              />
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div
              role="list"
              className="mt-3 space-y-3 border-l border-dark-border pl-4 sm:pl-6 lg:pl-8"
            >
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  lessonId={lessonId}
                  onReplyAdded={onReplyAdded}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
