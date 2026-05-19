'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { StatsResponse, Post, Category } from '@/types';
import {
  FileText,
  Eye,
  MessageSquare,
  Users,
  TrendingUp,
  ArrowRight,
  Plus,
  AlertCircle,
} from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Failed to load dashboard data</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Posts',
      value: data.stats.totalPosts,
      subtitle: `${data.stats.publishedPosts} published, ${data.stats.draftPosts} drafts`,
      icon: FileText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total Views',
      value: data.stats.totalViews.toLocaleString(),
      subtitle: 'All time page views',
      icon: Eye,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Comments',
      value: data.stats.totalComments,
      subtitle: `${data.stats.pendingComments} pending approval`,
      icon: MessageSquare,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Subscribers',
      value: data.stats.totalSubscribers,
      subtitle: 'Newsletter subscribers',
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your news portal</p>
        </div>
        <Link href="/admin/posts/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.subtitle}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Posts */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Posts</CardTitle>
            <Link href="/admin/posts">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {data.recentPosts.length > 0 ? (
              <div className="space-y-4">
                {data.recentPosts.map((post: Post) => (
                  <div
                    key={post._id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{post.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span
                          className={`px-2 py-0.5 rounded-full ${
                            post.status === 'published'
                              ? 'bg-green-500/10 text-green-500'
                              : post.status === 'draft'
                              ? 'bg-amber-500/10 text-amber-500'
                              : 'bg-blue-500/10 text-blue-500'
                          }`}
                        >
                          {post.status}
                        </span>
                        <span>{post.views} views</span>
                      </div>
                    </div>
                    <Link href={`/admin/posts/${post.slug || post._id}`}>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                No posts yet. Create your first post!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Top Performing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Top Performing
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topPosts.length > 0 ? (
              <div className="space-y-4">
                {data.topPosts.map((post: Post, index: number) => (
                  <div
                    key={post._id}
                    className="flex items-center gap-3 py-2"
                  >
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/article/${post.slug}`}
                        className="text-sm font-medium hover:text-primary truncate block"
                      >
                        {post.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {post.views.toLocaleString()} views
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground text-sm">
                No data available yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Posts by Category</CardTitle>
          <Link href="/admin/categories">
            <Button variant="ghost" size="sm">
              Manage
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {data.postsByCategory.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {data.postsByCategory.map((category: Category) => (
                <div
                  key={category._id}
                  className="text-center p-4 rounded-xl bg-muted/50"
                >
                  <div
                    className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center"
                    style={{ backgroundColor: category.color + '20' }}
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                  </div>
                  <p className="font-medium text-sm">{category.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {category.postCount} posts
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              No categories yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
