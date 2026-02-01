'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Download, Loader2, ExternalLink } from 'lucide-react';

interface DownloadButtonProps {
  resourceId: number;
  downloadUrl: string;
}

export function DownloadButton({ resourceId, downloadUrl }: DownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    setIsLoading(true);

    try {
      const res = await fetch(`/api/resources/${resourceId}/download`, {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: 'Error',
          description: data.error || 'Failed to process download',
          variant: 'destructive',
        });
        return;
      }

      // Open download URL in new tab
      window.open(data.download_url || downloadUrl, '_blank');
      
      toast({
        title: 'Download Started',
        description: 'Your download should begin shortly.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={handleDownload}
        disabled={isLoading}
        className="w-full h-12 text-lg gap-2 bg-primary hover:bg-primary/90 text-primary-foreground glow-primary"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Download className="h-5 w-5" />
            Download
          </>
        )}
      </Button>
      <Button
        variant="outline"
        onClick={() => window.open(downloadUrl, '_blank')}
        className="w-full gap-2"
      >
        <ExternalLink className="h-4 w-4" />
        Direct Link
      </Button>
    </div>
  );
}
