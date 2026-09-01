"use client";

import { useState, useEffect } from "react";
import { Star, Pencil, Check, RefreshCw, Tag, X } from "lucide-react";
import { updatePostAction } from "@/actions/postActions";

interface EditableJournalReviewProps {
  postId: string;
  initialReview: string;
  tagsList?: string[];
  isAdmin?: boolean;
}

export function EditableJournalReview({
  postId,
  initialReview,
  tagsList = [],
  isAdmin: propIsAdmin,
}: EditableJournalReviewProps) {
  const [isAdminState, setIsAdminState] = useState(false);
  const isAdmin = propIsAdmin !== undefined ? propIsAdmin : isAdminState;

  const [isEditing, setIsEditing] = useState(false);
  const [review, setReview] = useState(initialReview);
  const [editText, setEditText] = useState(initialReview);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If isAdmin prop is not explicitly passed, check via API
  useEffect(() => {
    if (propIsAdmin === undefined) {
      async function checkAdmin() {
        try {
          const res = await fetch("/api/admin/check");
          const data = await res.json();
          setIsAdminState(Boolean(data.authenticated));
        } catch {
          setIsAdminState(false);
        }
      }
      checkAdmin();
    }
  }, [propIsAdmin]);

  const handleStartEditing = () => {
    setEditText(review);
    setErrorMsg(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditText(review);
    setErrorMsg(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editText.trim()) {
      setErrorMsg("Review content cannot be empty.");
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      const res = await updatePostAction(postId, { review: editText.trim() });
      if (res.success && res.post) {
        setReview(res.post.review);
        setEditText(res.post.review);
        setIsEditing(false);
      } else {
        setErrorMsg(res.error || "Failed to save review. Admin access required.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="w-full p-4 sm:p-8 lg:p-10 rounded-lg bg-[#1b1c1e] border border-[#292a2c] space-y-4 sm:space-y-6">
      {/* Header with Title and Edit Icon Button (Admin Only) */}
      <div className="flex items-center justify-between border-b border-[#292a2c] pb-3 sm:pb-4 gap-2">
        <h2 className="font-headline text-lg sm:text-2xl font-bold text-[#e3e2e5] flex items-center gap-2">
          <Star className="w-4 sm:w-5 h-4 sm:h-5 text-[#f2ca50] fill-[#f2ca50] shrink-0" /> Journal
          Entry & Critical Review
        </h2>

        {isAdmin && !isEditing && (
          <button
            type="button"
            onClick={handleStartEditing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#121315] hover:bg-[#292a2c] text-[#99907c] hover:text-[#f2ca50] border border-[#292a2c] hover:border-[#f2ca50]/40 font-headline font-bold text-xs transition-colors cursor-pointer shrink-0"
            title="Edit Journal Review"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        )}
      </div>

      {/* Editor or Static Display */}
      {isEditing ? (
        <div className="space-y-4">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            disabled={saving}
            className="w-full min-h-[200px] p-3.5 sm:p-4 rounded-md bg-[#121315] border border-[#4d4635] text-[#e3e2e5] font-journal text-base sm:text-lg leading-relaxed focus:outline-none focus:border-[#f2ca50] focus:ring-1 focus:ring-[#f2ca50] transition-colors resize-y disabled:opacity-50"
            placeholder="Write your review and thoughts..."
            rows={8}
          />

          {errorMsg && (
            <p className="text-xs text-rose-400 font-label">{errorMsg}</p>
          )}

          <div className="flex items-center justify-end gap-3 font-label">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center gap-1 px-4 py-2 rounded-md bg-[#1b1c1e] hover:bg-[#292a2c] text-[#99907c] hover:text-[#e3e2e5] border border-[#292a2c] font-headline font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#f2ca50] hover:bg-[#e9c349] text-[#121315] font-headline font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Review</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="font-journal text-[#d0c5af] text-base sm:text-lg leading-relaxed space-y-4 whitespace-pre-line">
          {review}
        </div>
      )}

      {/* Tags Footer */}
      {tagsList.length > 0 && (
        <div className="pt-4 sm:pt-6 border-t border-[#292a2c] flex items-center gap-2 flex-wrap font-label">
          <span className="text-xs font-semibold text-[#99907c] flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-[#f2ca50]" /> Tags:
          </span>
          {tagsList.map((tag, idx) => (
            <span
              key={idx}
              className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-sm bg-[#121315] text-[#c6c6c9] text-xs font-medium border border-[#292a2c]"
            >
              #{tag.trim()}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
