'use client';

import React from "react"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Star, StarHalf } from 'lucide-react';
import type { Review, User } from '@/lib/types';

interface ReviewSectionProps {
  resourceId: number;
  user: User | null;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function StarRating({ rating, onRatingChange, interactive = false }: { 
  rating: number; 
  onRatingChange?: (rating: number) => void;
  interactive?: boolean;
}) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRatingChange?.(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
        >
          <Star
            className={`h-5 w-5 ${
              (hoverRating || rating) >= star
                ? 'fill-yellow-500 text-yellow-500'
                : 'text-muted-foreground'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function ReviewSection({ resourceId, user }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, [resourceId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/resources/${resourceId}/reviews`);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load reviews',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({
        title: 'Rating required',
        description: 'Please select a rating',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/resources/${resourceId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, content }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast({
          title: 'Error',
          description: data.error || 'Failed to submit review',
          variant: 'destructive',
        });
        return;
      }

      setRating(0);
      setContent('');
      fetchReviews();
      toast({
        title: 'Review submitted',
        description: 'Thank you for your feedback!',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to submit review',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
          <h3 className="font-semibold text-foreground">Reviews ({reviews.length})</h3>
        </div>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <StarRating rating={Math.round(averageRating)} />
            <span className="text-foreground font-medium">{averageRating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Review Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-6 p-4 rounded-lg bg-secondary/50">
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">Your Rating</label>
            <StarRating rating={rating} onRatingChange={setRating} interactive />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">Your Review (optional)</label>
            <Textarea
              placeholder="Share your experience with this resource..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-input border-border text-foreground resize-none"
              rows={3}
            />
          </div>
          <Button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Star className="h-4 w-4" />
            )}
            Submit Review
          </Button>
        </form>
      ) : (
        <div className="mb-6 p-4 rounded-lg bg-secondary text-center">
          <p className="text-muted-foreground">
            Please <a href="/login" className="text-primary hover:underline">login</a> to leave a review
          </p>
        </div>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8">
          <Star className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="p-4 rounded-lg bg-secondary/50">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={review.avatar_url || undefined} />
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    {review.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-foreground">{review.username}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
                  </div>
                  <StarRating rating={review.rating} />
                  {review.content && (
                    <p className="mt-2 text-foreground text-sm whitespace-pre-wrap">{review.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
