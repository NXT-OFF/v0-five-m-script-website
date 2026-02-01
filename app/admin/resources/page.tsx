import { redirect } from 'next/navigation';
import { MainLayout } from '@/components/main-layout';
import { ResourceManagement } from '@/components/admin/resource-management';
import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/db';
import type { Resource } from '@/lib/types';

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

async function getResources(status?: string) {
  try {
    let sql = `
      SELECT r.*, u.username as author_username 
      FROM resources r 
      JOIN users u ON r.author_id = u.id
    `;
    const params: string[] = [];

    if (status && status !== 'all') {
      sql += ' WHERE r.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY r.created_at DESC';

    const resources = await query<(Resource & { author_username: string })[]>(sql, params);
    return resources;
  } catch (error) {
    console.error('Error fetching resources:', error);
    return [];
  }
}

export default async function AdminResourcesPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  const params = await searchParams;

  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    redirect('/');
  }

  const status = params.status || 'all';
  const resources = await getResources(status === 'all' ? undefined : status);

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Manage Resources</h1>
          <p className="text-muted-foreground mt-1">Review and manage uploaded resources</p>
        </div>

        <ResourceManagement resources={resources} currentStatus={status} />
      </div>
    </MainLayout>
  );
}
