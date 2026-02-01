import { redirect } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/db';
import type { Resource } from '@/lib/types';
import { 
  Upload, Eye, Download, MessageSquare, Star, Clock, 
  CheckCircle, XCircle, AlertCircle, Plus, TrendingUp 
} from 'lucide-react';

async function getUserStats(userId: number) {
  try {
    // Get user's resources
    const resources = await query<Resource[]>(
      'SELECT * FROM resources WHERE author_id = ? ORDER BY created_at DESC',
      [userId]
    );

    // Get total views and downloads
    const statsResult = await query<[{ total_views: number; total_downloads: number }]>(
      'SELECT SUM(views) as total_views, SUM(downloads) as total_downloads FROM resources WHERE author_id = ?',
      [userId]
    );

    // Get total comments received
    const commentsResult = await query<[{ total: number }]>(
      `SELECT COUNT(*) as total FROM comments c 
       JOIN resources r ON c.resource_id = r.id 
       WHERE r.author_id = ?`,
      [userId]
    );

    // Get average rating
    const ratingResult = await query<[{ avg_rating: number; total_reviews: number }]>(
      `SELECT AVG(rv.rating) as avg_rating, COUNT(*) as total_reviews 
       FROM reviews rv 
       JOIN resources r ON rv.resource_id = r.id 
       WHERE r.author_id = ?`,
      [userId]
    );

    return {
      resources,
      totalViews: statsResult[0]?.total_views || 0,
      totalDownloads: statsResult[0]?.total_downloads || 0,
      totalComments: commentsResult[0]?.total || 0,
      avgRating: ratingResult[0]?.avg_rating || 0,
      totalReviews: ratingResult[0]?.total_reviews || 0,
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      resources: [],
      totalViews: 0,
      totalDownloads: 0,
      totalComments: 0,
      avgRating: 0,
      totalReviews: 0,
    };
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'approved':
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
    case 'pending':
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    case 'rejected':
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const stats = await getUserStats(user.id);

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {user.username}!</p>
          </div>
          <Link href="/upload">
            <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="h-4 w-4" />
              Upload Resource
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Resources</CardTitle>
              <Upload className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.resources.length}</div>
              <p className="text-xs text-muted-foreground">
                {stats.resources.filter(r => r.status === 'approved').length} approved
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across all resources</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Downloads</CardTitle>
              <Download className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalDownloads.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across all resources</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">{stats.totalReviews} reviews</p>
            </CardContent>
          </Card>
        </div>

        {/* Resources Table */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Your Resources</CardTitle>
            <CardDescription className="text-muted-foreground">
              Manage and track your uploaded resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.resources.length === 0 ? (
              <div className="text-center py-12">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No resources yet</h3>
                <p className="text-muted-foreground mb-4">Start sharing your FiveM content with the community</p>
                <Link href="/upload">
                  <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Plus className="h-4 w-4" />
                    Upload Your First Resource
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Resource</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Category</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Views</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Downloads</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.resources.map((resource) => (
                      <tr key={resource.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-medium text-foreground line-clamp-1">{resource.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(resource.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary" className="capitalize">{resource.category}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(resource.status)}
                        </td>
                        <td className="py-3 px-4 text-right text-foreground">
                          {resource.views.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right text-primary">
                          {resource.downloads.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {resource.status === 'approved' ? (
                            <Link href={`/resource/${resource.id}`}>
                              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                                View
                              </Button>
                            </Link>
                          ) : (
                            <Button variant="ghost" size="sm" disabled className="text-muted-foreground">
                              Pending
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
