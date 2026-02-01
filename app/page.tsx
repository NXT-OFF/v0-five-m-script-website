import { Suspense } from 'react';
import { MainLayout } from '@/components/main-layout';
import { ResourceGrid } from '@/components/resource-grid';
import { ResourceGridSkeleton } from '@/components/resource-grid-skeleton';
import { CATEGORIES } from '@/lib/types';

interface PageProps {
  searchParams: Promise<{ category?: string; search?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const category = params.category || 'all';
  const search = params.search || '';
  
  const categoryName = CATEGORIES.find(c => c.id === category)?.name || 'All Scripts';

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">{categoryName}</h1>
        {search && (
          <p className="mt-2 text-muted-foreground">
            Search results for: <span className="text-primary">{search}</span>
          </p>
        )}
      </div>
      
      <Suspense fallback={<ResourceGridSkeleton />}>
        <ResourceGrid category={category} search={search} />
      </Suspense>
    </MainLayout>
  );
}
