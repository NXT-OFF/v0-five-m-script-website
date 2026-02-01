import { ResourceCard } from '@/components/resource-card';
import { query } from '@/lib/db';
import type { Resource } from '@/lib/types';

interface ResourceGridProps {
  category: string;
  search: string;
}

async function getResources(category: string, search: string): Promise<Resource[]> {
  try {
    let sql = `
      SELECT r.*, u.username as author_username 
      FROM resources r 
      JOIN users u ON r.author_id = u.id 
      WHERE r.status = 'approved'
    `;
    const params: (string | number)[] = [];

    if (category && category !== 'all') {
      sql += ' AND r.category = ?';
      params.push(category);
    }

    if (search) {
      sql += ' AND (r.title LIKE ? OR r.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY r.created_at DESC LIMIT 20';

    const resources = await query<Resource[]>(sql, params);
    return resources;
  } catch (error) {
    console.error('Error fetching resources:', error);
    return [];
  }
}

export async function ResourceGrid({ category, search }: ResourceGridProps) {
  const resources = await getResources(category, search);

  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-xl font-semibold text-foreground mb-2">No resources found</h3>
        <p className="text-muted-foreground">
          {search ? 'Try a different search term' : 'Be the first to upload a resource in this category!'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {resources.map((resource) => (
        <ResourceCard key={resource.id} resource={resource} />
      ))}
    </div>
  );
}
