'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import type { Resource } from '@/lib/types';
import { CheckCircle, XCircle, Clock, Eye, ExternalLink, Loader2 } from 'lucide-react';

interface ResourceManagementProps {
  resources: (Resource & { author_username: string })[];
  currentStatus: string;
}

export function ResourceManagement({ resources, currentStatus }: ResourceManagementProps) {
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleStatusChange = async (resourceId: number, newStatus: 'approved' | 'rejected') => {
    setLoadingId(resourceId);

    try {
      const res = await fetch(`/api/admin/resources/${resourceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast({
          title: 'Error',
          description: data.error || 'Failed to update resource',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Resource Updated',
        description: `Resource has been ${newStatus}`,
      });

      router.refresh();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update resource',
        variant: 'destructive',
      });
    } finally {
      setLoadingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
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
  };

  return (
    <div>
      {/* Status Filter */}
      <Tabs value={currentStatus} className="mb-6">
        <TabsList className="bg-secondary border border-border">
          <TabsTrigger
            value="all"
            onClick={() => router.push('/admin/resources')}
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            All
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            onClick={() => router.push('/admin/resources?status=pending')}
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Pending
          </TabsTrigger>
          <TabsTrigger
            value="approved"
            onClick={() => router.push('/admin/resources?status=approved')}
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Approved
          </TabsTrigger>
          <TabsTrigger
            value="rejected"
            onClick={() => router.push('/admin/resources?status=rejected')}
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Rejected
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Resources List */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">
            Resources ({resources.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {resources.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No resources found</h3>
              <p className="text-muted-foreground">
                {currentStatus === 'pending' 
                  ? 'No resources pending approval' 
                  : 'No resources match the selected filter'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {resources.map((resource) => (
                <div
                  key={resource.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  {/* Thumbnail */}
                  {resource.thumbnail_url && (
                    <img
                      src={resource.thumbnail_url || "/placeholder.svg"}
                      alt={resource.title}
                      className="w-24 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-foreground">{resource.title}</h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <span>by {resource.author_username}</span>
                          <span>-</span>
                          <Badge variant="secondary" className="capitalize text-xs">
                            {resource.category}
                          </Badge>
                          <span>-</span>
                          <span>{new Date(resource.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {resource.description}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        {getStatusBadge(resource.status)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4">
                      {resource.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(resource.id, 'approved')}
                            disabled={loadingId === resource.id}
                            className="gap-1 bg-green-600 hover:bg-green-700 text-white"
                          >
                            {loadingId === resource.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusChange(resource.id, 'rejected')}
                            disabled={loadingId === resource.id}
                            className="gap-1"
                          >
                            {loadingId === resource.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                            Reject
                          </Button>
                        </>
                      )}
                      {resource.status === 'approved' && (
                        <Link href={`/resource/${resource.id}`}>
                          <Button size="sm" variant="outline" className="gap-1 bg-transparent">
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                        </Link>
                      )}
                      {resource.status === 'rejected' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(resource.id, 'approved')}
                          disabled={loadingId === resource.id}
                          className="gap-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          {loadingId === resource.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                          Approve
                        </Button>
                      )}
                      <a href={resource.download_url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="ghost" className="gap-1 text-muted-foreground">
                          <ExternalLink className="h-4 w-4" />
                          Download Link
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
