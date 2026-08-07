'use client';

import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { toggleVoteAction, getUserVoteStatusAction } from '@/actions/postActions';
import { getOrCreateDeviceToken } from '@/lib/deviceToken';
import confetti from 'canvas-confetti';

interface LikeDislikeButtonsProps {
  postId: string;
  initialLikes: number;
  initialDislikes: number;
  size?: 'sm' | 'md' | 'lg';
}

export function LikeDislikeButtons({
  postId,
  initialLikes,
  initialDislikes,
  size = 'md',
}: LikeDislikeButtonsProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [userVote, setUserVote] = useState<'LIKE' | 'DISLIKE' | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchUserVote() {
      const deviceToken = getOrCreateDeviceToken();
      const res = await getUserVoteStatusAction(postId, deviceToken);
      if (res.success) {
        setUserVote(res.userVote as 'LIKE' | 'DISLIKE' | null);
      }
    }
    fetchUserVote();
  }, [postId]);

  const handleVote = async (voteType: 'LIKE' | 'DISLIKE') => {
    if (loading) return;
    setLoading(true);

    const deviceToken = getOrCreateDeviceToken();
    const res = await toggleVoteAction(postId, voteType, deviceToken);

    if (res.success) {
      setLikes(res.likesCount ?? likes);
      setDislikes(res.dislikesCount ?? dislikes);
      setUserVote(res.userVote ?? null);

      if (res.userVote === 'LIKE') {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.8 },
          colors: ['#f2ca50', '#d4af37', '#e3e2e5'],
        });
      }
    }

    setLoading(false);
  };

  const btnPadding = size === 'sm' ? 'px-2.5 py-1 text-xs' : size === 'lg' ? 'px-4 py-2 text-sm font-semibold' : 'px-3 py-1.5 text-xs font-medium';
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  return (
    <div className="inline-flex items-center gap-2 font-label">
      {/* Like Button */}
      <button
        onClick={() => handleVote('LIKE')}
        disabled={loading}
        className={`flex items-center gap-1.5 rounded-sm transition-all duration-200 cursor-pointer ${btnPadding} ${
          userVote === 'LIKE'
            ? 'bg-[#f2ca50]/20 text-[#f2ca50] border border-[#f2ca50]/50'
            : 'bg-[#1b1c1e] text-[#c6c6c9] hover:bg-[#292a2c] hover:text-[#f2ca50] border border-[#292a2c]'
        }`}
        title="Like entry"
      >
        <ThumbsUp className={`${iconSize} ${userVote === 'LIKE' ? 'fill-[#f2ca50]' : ''}`} />
        <span>{likes}</span>
      </button>

      {/* Dislike Button */}
      <button
        onClick={() => handleVote('DISLIKE')}
        disabled={loading}
        className={`flex items-center gap-1.5 rounded-sm transition-all duration-200 cursor-pointer ${btnPadding} ${
          userVote === 'DISLIKE'
            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
            : 'bg-[#1b1c1e] text-[#c6c6c9] hover:bg-[#292a2c] hover:text-rose-400 border border-[#292a2c]'
        }`}
        title="Dislike entry"
      >
        <ThumbsDown className={`${iconSize} ${userVote === 'DISLIKE' ? 'fill-rose-400' : ''}`} />
        <span>{dislikes}</span>
      </button>
    </div>
  );
}
