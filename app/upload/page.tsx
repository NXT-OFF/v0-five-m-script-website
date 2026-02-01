'use client';

import React from "react"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, ArrowLeft, ImageIcon, Link as LinkIcon, FileText } from 'lucide-react';
import { CATEGORIES } from '@/lib/types';

export default function UploadPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [version, setVersion] = useState('1.0');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          thumbnail_url: thumbnailUrl || null,
          download_url: downloadUrl,
          file_size: fileSize || null,
          version: version || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          toast({
            title: 'Authentication Required',
            description: 'Please login to upload resources',
            variant: 'destructive',
          });
          router.push('/login');
          return;
        }
        toast({
          title: 'Error',
          description: data.error || 'Failed to upload resource',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Resource Submitted!',
        description: 'Your resource is pending approval.',
      });

      router.push('/dashboard');
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

  const filteredCategories = CATEGORIES.filter(c => c.id !== 'all');

  return (
    <div className="min-h-screen bg-background stars-bg">
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                <Upload className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl text-foreground">Upload Resource</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Share your FiveM scripts, MLO, maps and more
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Title *
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Advanced Police System v2"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="bg-input border-border text-foreground"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-foreground">Category *</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {filteredCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id} className="text-foreground">
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your resource in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={5}
                  className="bg-input border-border text-foreground resize-none"
                />
              </div>

              {/* Thumbnail URL */}
              <div className="space-y-2">
                <Label htmlFor="thumbnail" className="text-foreground flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Thumbnail URL
                </Label>
                <Input
                  id="thumbnail"
                  type="url"
                  placeholder="https://i.imgur.com/example.png"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  className="bg-input border-border text-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  Upload your image to Imgur or similar and paste the direct link
                </p>
              </div>

              {/* Download URL */}
              <div className="space-y-2">
                <Label htmlFor="download" className="text-foreground flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Download URL *
                </Label>
                <Input
                  id="download"
                  type="url"
                  placeholder="https://github.com/user/repo or https://drive.google.com/..."
                  value={downloadUrl}
                  onChange={(e) => setDownloadUrl(e.target.value)}
                  required
                  className="bg-input border-border text-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  GitHub, Google Drive, Mega, Mediafire, etc.
                </p>
              </div>

              {/* File Size and Version */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fileSize" className="text-foreground">File Size</Label>
                  <Input
                    id="fileSize"
                    placeholder="e.g., 45 MB"
                    value={fileSize}
                    onChange={(e) => setFileSize(e.target.value)}
                    className="bg-input border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="version" className="text-foreground">Version</Label>
                  <Input
                    id="version"
                    placeholder="e.g., 1.0"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="bg-input border-border text-foreground"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Submit Resource
                    </>
                  )}
                </Button>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                Your resource will be reviewed before being published
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
