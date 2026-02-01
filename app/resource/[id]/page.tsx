import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MainLayout } from '@/components/main-layout';
import { DownloadButton } from '@/components/download-button';
import { CommentSection } from '@/components/comment-section';
import { ReviewSection } from '@/components/review-section';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import type { Resource } from '@/lib/types';
import { ArrowLeft, Calendar, Eye, Download, User, Tag, HardDrive, GitBranch, Star } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getResource(id: string) {
  try {
    const resources = await query<(Resource & { 
      author_username: string; 
      author_avatar: string | null;
      avg_rating?: number;
      total_reviews?: number;
    })[]>(
      `SELECT r.*, u.username as author_username, u.avatar_url as author_avatar
       FROM resources r 
       JOIN users u ON r.author_id = u.id 
       WHERE r.id = ? AND r.status = 'approved'`,
      [id]
    );

    if (resources.length === 0) return null;

    // Get average rating
    const ratingResult = await query<[{ avg_rating: number; total_reviews: number }]>(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews FROM reviews WHERE resource_id = ?',
      [id]
    );

    // Increment view count
    await query('UPDATE resources SET views = views + 1 WHERE id = ?', [id]);

    return {
      ...resources[0],
      avg_rating: ratingResult[0]?.avg_rating || 0,
      total_reviews: ratingResult[0]?.total_reviews || 0,
    };
  } catch (error) {
    console.error('Error fetching resource:', error);
    return null;
  }
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function ResourcePage({ params }: PageProps) {
  const { id } = await params;
  const resource = await getResource(id);
  const user = await getCurrentUser();

  if (!resource) {
    notFound();
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        {/* Back button */}
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Resources
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Thumbnail */}
            <div className="relative aspect-video overflow-hidden rounded-xl border border-border">
              <Image
                src={resource.thumbnail_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=450&fit=crop'}
                alt={resource.title}
                fill
                className="object-cover"
                priority
              />
              {resource.is_new && (
                <Badge className="absolute right-4 top-4 bg-accent text-accent-foreground border-0">
                  NEW
                </Badge>
              )}
            </div>

            {/* Title and Meta */}
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-4">{resource.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {formatDate(resource.created_at)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  {resource.views} views
                </span>
                <span className="flex items-center gap-1.5 text-primary">
                  <Download className="h-4 w-4" />
                  {resource.downloads} downloads
                </span>
                {resource.total_reviews > 0 && (
                  <span className="flex items-center gap-1.5 text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    {resource.avg_rating.toFixed(1)} ({resource.total_reviews} reviews)
                  </span>
                )}
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="bg-secondary border border-border">
                <TabsTrigger value="description" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Description
                </TabsTrigger>
                <TabsTrigger value="comments" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Comments
                </TabsTrigger>
                <TabsTrigger value="reviews" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Reviews
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-4">
                <div className="rounded-xl border border-border bg-card p-6">
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                    {resource.description}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="comments" className="mt-4">
                <CommentSection resourceId={resource.id} user={user} />
              </TabsContent>

              <TabsContent value="reviews" className="mt-4">
                <ReviewSection resourceId={resource.id} user={user} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Download Card */}
            <div className="rounded-xl border border-border bg-card p-6">
              <DownloadButton resourceId={resource.id} downloadUrl={resource.download_url} />
            </div>

            {/* Info Card */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h3 className="font-semibold text-foreground">Resource Info</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Author:</span>
                  <span className="text-foreground font-medium">{resource.author_username}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Category:</span>
                  <Badge variant="secondary" className="capitalize">
                    {resource.category}
                  </Badge>
                </div>

                {resource.version && (
                  <div className="flex items-center gap-3">
                    <GitBranch className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Version:</span>
                    <span className="text-foreground">{resource.version}</span>
                  </div>
                )}

                {resource.file_size && (
                  <div className="flex items-center gap-3">
                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Size:</span>
                    <span className="text-foreground">{resource.file_size}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Author Card */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground mb-4">Author</h3>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                    {resource.author_username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{resource.author_username}</p>
                  <p className="text-xs text-muted-foreground">Resource Creator</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
