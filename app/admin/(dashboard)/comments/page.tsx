'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Comment } from '@/types';
import { formatRelativeTime } from '@/lib/helpers';
import toast from 'react-hot-toast';
import {
  Check,
  X,
  Trash2,
  Loader2,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteComment, setDeleteComment] = useState<Comment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const res = await fetch('/api/comments?admin=true&limit=100');
      const data = await res.json();
      if (data.success) {
        setComments(data.data.comments);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (comment: Comment, approve: boolean) => {
    setProcessingId(comment._id);
    try {
      const res = await fetch(`/api/comments/${comment._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: approve }),
      });

      if (res.ok) {
        setComments(
          comments.map((c) =>
            c._id === comment._id ? { ...c, isApproved: approve } : c
          )
        );
        toast.success(approve ? 'Comment approved' : 'Comment rejected');
      } else {
        toast.error('Failed to update comment');
      }
    } catch {
      toast.error('Failed to update comment');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteComment) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/comments/${deleteComment._id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setComments(comments.filter((c) => c._id !== deleteComment._id));
        toast.success('Comment deleted');
      } else {
        toast.error('Failed to delete comment');
      }
    } catch {
      toast.error('Failed to delete comment');
    } finally {
      setIsDeleting(false);
      setDeleteComment(null);
    }
  };

  const pendingComments = comments.filter((c) => !c.isApproved);
  const approvedComments = comments.filter((c) => c.isApproved);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Comments</h1>
        <p className="text-muted-foreground">
          Manage and moderate user comments
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">Total Comments</p>
          <p className="text-2xl font-bold">{comments.length}</p>
        </div>
        <div className="bg-amber-500/10 rounded-xl border border-amber-500/20 p-4">
          <p className="text-sm text-amber-600">Pending Approval</p>
          <p className="text-2xl font-bold text-amber-600">
            {pendingComments.length}
          </p>
        </div>
        <div className="bg-green-500/10 rounded-xl border border-green-500/20 p-4">
          <p className="text-sm text-green-600">Approved</p>
          <p className="text-2xl font-bold text-green-600">
            {approvedComments.length}
          </p>
        </div>
      </div>

      {/* Pending Comments */}
      {pendingComments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-500" />
            Pending Approval ({pendingComments.length})
          </h2>
          <div className="border border-amber-500/30 rounded-xl overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Author</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Post</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingComments.map((comment) => (
                  <TableRow key={comment._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{comment.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {comment.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="max-w-[300px] truncate">{comment.content}</p>
                    </TableCell>
                    <TableCell>
                      {typeof comment.post === 'object' && (
                        <Link
                          href={`/article/${comment.post.slug}`}
                          target="_blank"
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          {comment.post.title?.substring(0, 30)}...
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatRelativeTime(comment.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-green-500 hover:text-green-600 hover:bg-green-500/10"
                          onClick={() => handleApprove(comment, true)}
                          disabled={processingId === comment._id}
                        >
                          {processingId === comment._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteComment(comment)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* All Comments */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">All Comments</h2>
        <div className="border border-border rounded-xl overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Author</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Post</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : comments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-12 text-muted-foreground"
                  >
                    No comments yet
                  </TableCell>
                </TableRow>
              ) : (
                comments.map((comment) => (
                  <TableRow key={comment._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{comment.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {comment.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="max-w-[300px] truncate">{comment.content}</p>
                    </TableCell>
                    <TableCell>
                      {typeof comment.post === 'object' && (
                        <Link
                          href={`/article/${comment.post.slug}`}
                          target="_blank"
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          {comment.post.title?.substring(0, 20)}...
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </TableCell>
                    <TableCell>
                      {comment.isApproved ? (
                        <Badge className="bg-green-500/10 text-green-500">
                          Approved
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500/10 text-amber-500">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatRelativeTime(comment.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {comment.isApproved ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleApprove(comment, false)}
                            disabled={processingId === comment._id}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-green-500"
                            onClick={() => handleApprove(comment, true)}
                            disabled={processingId === comment._id}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => setDeleteComment(comment)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog
        open={!!deleteComment}
        onOpenChange={() => setDeleteComment(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment by{' '}
              {deleteComment?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
