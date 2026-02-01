'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Eye, Download, Play } from 'lucide-react';
import type { Resource } from '@/lib/types';

interface ResourceCardProps {
  resource: Resource;
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
}

export function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <div className="resource-card group overflow-hidden rounded-xl border border-border bg-card">
      {/* Thumbnail */}
      <Link href={`/resource/${resource.id}`} className="relative block aspect-video overflow-hidden">
        <Image
          src={resource.thumbnail_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=250&fit=crop'}
          alt={resource.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        
        {/* Play button on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/90 text-primary-foreground">
            <Play className="h-5 w-5" />
          </div>
        </div>

        {/* New badge */}
        {resource.is_new && (
          <Badge className="absolute right-3 top-3 bg-accent text-accent-foreground border-0">
            NEW
          </Badge>
        )}
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link href={`/resource/${resource.id}`}>
          <h3 className="mb-2 line-clamp-1 text-lg font-semibold text-foreground hover:text-primary transition-colors">
            {resource.title}
          </h3>
        </Link>
        
        <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
          {resource.description}
        </p>

        {/* Meta info */}
        <div className="mb-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(resource.created_at)}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {formatNumber(resource.views)}
          </span>
          <span className="flex items-center gap-1 text-primary">
            <Download className="h-3.5 w-3.5" />
            {formatNumber(resource.downloads)}
          </span>
        </div>

        {/* Download button */}
        <Link href={`/resource/${resource.id}`}>
          <Button className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </Link>
      </div>
    </div>
  );
}
