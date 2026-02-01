import { redirect } from 'next/navigation';
import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/db';
import type { User } from '@/lib/types';
import { Shield, User as UserIcon, Users } from 'lucide-react';

async function getUsers() {
  try {
    const users = await query<(User & { resource_count: number })[]>(
      `SELECT u.id, u.username, u.email, u.avatar_url, u.role, u.created_at,
              (SELECT COUNT(*) FROM resources WHERE author_id = u.id) as resource_count
       FROM users u
       ORDER BY u.created_at DESC`
    );
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

function getRoleBadge(role: string) {
  switch (role) {
    case 'admin':
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><Shield className="h-3 w-3 mr-1" />Admin</Badge>;
    case 'moderator':
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30"><Shield className="h-3 w-3 mr-1" />Moderator</Badge>;
    default:
      return <Badge variant="secondary"><UserIcon className="h-3 w-3 mr-1" />User</Badge>;
  }
}

export default async function AdminUsersPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== 'admin') {
    redirect('/');
  }

  const users = await getUsers();

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Manage Users</h1>
          <p className="text-muted-foreground mt-1">View and manage user accounts</p>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Resources</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                              {user.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-foreground">{user.username}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                      <td className="py-3 px-4">{getRoleBadge(user.role)}</td>
                      <td className="py-3 px-4 text-right text-foreground">{user.resource_count}</td>
                      <td className="py-3 px-4 text-right text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
