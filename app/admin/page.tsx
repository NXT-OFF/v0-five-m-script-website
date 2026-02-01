import { redirect } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { 
  Users, Upload, Eye, Download, MessageSquare, 
  Clock, CheckCircle, XCircle, TrendingUp, Activity
} from 'lucide-react';

async function getAdminStats() {
  try {
    // Total users
    const usersResult = await query<[{ total: number }]>('SELECT COUNT(*) as total FROM users');
    
    // Total resources
    const resourcesResult = await query<[{ total: number; pending: number; approved: number }]>(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved
       FROM resources`
    );

    // Total views and downloads
    const statsResult = await query<[{ total_views: number; total_downloads: number }]>(
      'SELECT SUM(views) as total_views, SUM(downloads) as total_downloads FROM resources'
    );

    // Total comments
    const commentsResult = await query<[{ total: number }]>('SELECT COUNT(*) as total FROM comments');

    // Recent resources pending approval
    const pendingResources = await query<{ id: number; title: string; category: string; created_at: Date; username: string }[]>(
      `SELECT r.id, r.title, r.category, r.created_at, u.username 
       FROM resources r 
       JOIN users u ON r.author_id = u.id 
       WHERE r.status = 'pending' 
       ORDER BY r.created_at DESC 
       LIMIT 5`
    );

    return {
      totalUsers: usersResult[0]?.total || 0,
      totalResources: resourcesResult[0]?.total || 0,
      pendingResources: resourcesResult[0]?.pending || 0,
      approvedResources: resourcesResult[0]?.approved || 0,
      totalViews: statsResult[0]?.total_views || 0,
      totalDownloads: statsResult[0]?.total_downloads || 0,
      totalComments: commentsResult[0]?.total || 0,
      recentPending: pendingResources,
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return {
      totalUsers: 0,
      totalResources: 0,
      pendingResources: 0,
      approvedResources: 0,
      totalViews: 0,
      totalDownloads: 0,
      totalComments: 0,
      recentPending: [],
    };
  }
}

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    redirect('/');
  }

  const stats = await getAdminStats();

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your FiveM Hub platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Registered accounts</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Resources</CardTitle>
              <Upload className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalResources.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{stats.approvedResources} approved</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Downloads</CardTitle>
              <Download className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalDownloads.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card border-l-4 border-l-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{stats.pendingResources}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pending Resources */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                Pending Approval
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Resources waiting for review
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recentPending.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-primary mx-auto mb-3" />
                  <p className="text-muted-foreground">All caught up! No pending resources.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentPending.map((resource) => (
                    <div key={resource.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground truncate">{resource.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>by {resource.username}</span>
                          <span>-</span>
                          <Badge variant="secondary" className="capitalize text-xs">{resource.category}</Badge>
                        </div>
                      </div>
                      <Link href={`/admin/resources?status=pending`}>
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 cursor-pointer hover:bg-yellow-500/30">
                          Review
                        </Badge>
                      </Link>
                    </div>
                  ))}
                  {stats.pendingResources > 5 && (
                    <Link href="/admin/resources?status=pending" className="block text-center text-sm text-primary hover:underline">
                      View all {stats.pendingResources} pending resources
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Platform Overview
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Key metrics at a glance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-blue-400" />
                  <span className="text-foreground">Total Page Views</span>
                </div>
                <span className="font-bold text-foreground">{stats.totalViews.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <Download className="h-5 w-5 text-primary" />
                  <span className="text-foreground">Total Downloads</span>
                </div>
                <span className="font-bold text-foreground">{stats.totalDownloads.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-purple-400" />
                  <span className="text-foreground">Total Comments</span>
                </div>
                <span className="font-bold text-foreground">{stats.totalComments.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  <span className="text-foreground">Approved Resources</span>
                </div>
                <span className="font-bold text-foreground">{stats.approvedResources.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Link href="/admin/resources">
            <Card className="border-border bg-card hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Manage Resources</h3>
                  <p className="text-sm text-muted-foreground">Approve, reject, or edit resources</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/admin/users">
            <Card className="border-border bg-card hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Manage Users</h3>
                  <p className="text-sm text-muted-foreground">View and manage user accounts</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/">
            <Card className="border-border bg-card hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <Eye className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">View Site</h3>
                  <p className="text-sm text-muted-foreground">Go to the public homepage</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
