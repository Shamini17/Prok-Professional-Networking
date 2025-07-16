import React, { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { postsApi, type PostFilters, type Category, type PopularTag } from './api';
import type { Post } from '../../types';
import LazyImage from '../ui/LazyImage';
import LoadingSpinner from '../ui/LoadingSpinner';
import Skeleton from '../ui/Skeleton';

// IMPORTANT: In production, set VITE_API_URL in your environment to your backend's deployed URL (e.g., https://your-backend-url.onrender.com)

const PostList: React.FC = () => {
  // State management
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [popularTags, setPopularTags] = useState<PopularTag[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedVisibility, setSelectedVisibility] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'created_at' | 'likes_count' | 'views_count' | 'comments_count'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Debounced search
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Load initial data
  useEffect(() => {
    loadCategories();
    loadPopularTags();
  }, []);

  // Load posts when filters change
  useEffect(() => {
    const loadInitialPosts = async () => {
      setCurrentPage(1);
      setPosts([]);
      setHasMore(true);
      await loadPosts(true);
    };
    loadInitialPosts();
  }, [debouncedSearch, selectedCategory, selectedVisibility, selectedTags, sortBy, sortOrder]);

  const loadCategories = async () => {
    setCategoriesLoading(true);
    setCategoriesError(null);
    try {
      const response = await postsApi.getCategories();
      setCategories(response.categories);
    } catch (err) {
      setCategoriesError('Failed to load categories. Please try again later.');
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadPopularTags = async () => {
    try {
      const response = await postsApi.getPopularTags();
      setPopularTags(response.tags);
    } catch (err) {
      console.error('Failed to load popular tags:', err);
    }
  };

  const loadPosts = useCallback(async (reset = false) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const filters: PostFilters = {
        search: debouncedSearch,
        category: selectedCategory,
        visibility: selectedVisibility,
        tags: selectedTags.join(','),
        sort_by: sortBy,
        sort_order: sortOrder,
        page: reset ? 1 : currentPage,
        per_page: 10,
      };

      const response = await postsApi.getPosts(filters);
      
      if (reset) {
        setPosts(response.posts || []);
      } else {
        setPosts(prev => [...prev, ...(response.posts || [])]);
      }
      
      setHasMore(response.pagination?.has_next || false);
      setCurrentPage(response.pagination?.page || 1);
    } catch (err) {
      setError('Failed to load posts. Please try again.');
      console.error('Error loading posts:', err);
      // Set empty posts on error to prevent infinite loading
      if (reset) {
        setPosts([]);
      }
    } finally {
      setLoading(false);
    }
  }, [loading, debouncedSearch, selectedCategory, selectedVisibility, selectedTags, sortBy, sortOrder, currentPage]);

  const loadMore = useCallback(async () => {
    if (!loading && hasMore) {
      setCurrentPage(prev => prev + 1);
      await loadPosts();
    }
  }, [loading, hasMore, loadPosts]);

  const infiniteScrollRef = useInfiniteScroll({
    hasMore,
    isLoading: loading,
    onLoadMore: loadMore,
  });

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleDelete = async (postId: number) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await postsApi.deletePost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      alert('Failed to delete post.');
    }
  };

  const handleLike = async (postId: number) => {
    try {
      await postsApi.likePost(postId);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: (p.likes_count || 0) + 1 } : p));
    } catch (err) {
      alert('Failed to like post.');
    }
  };

  const handleShare = (postId: number) => {
    const url = `${window.location.origin}/posts/${postId}`;
    navigator.clipboard.writeText(url);
    alert('Post URL copied to clipboard!');
  };

  const handleComment = (postId: number) => {
    alert('Comment feature coming soon!');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedVisibility('');
    setSelectedTags([]);
    setSortBy('created_at');
    setSortOrder('desc');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderPostCard = (post: Post) => (
    <div key={post.id} className="bg-white rounded-lg shadow-md p-6 mb-6 hover:shadow-lg transition-shadow">
      {/* Post Header */}
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
          {post.user.image_url ? (
            <LazyImage
              src={post.user.image_url}
              alt={`${post.user.username}'s profile`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
              {post.user.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-gray-900">
            {post.user.first_name && post.user.last_name 
              ? `${post.user.first_name} ${post.user.last_name}`
              : post.user.username
            }
          </div>
          <div className="text-sm text-gray-500">{formatDate(post.created_at)}</div>
        </div>
        {/* Delete Button */}
        <button
          onClick={() => handleDelete(post.id)}
          className="ml-2 p-2 rounded-full hover:bg-red-100 text-red-600 transition"
          title="Delete Post"
        >
          {/* Trash can SVG icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2m2 0v12a2 2 0 01-2 2H8a2 2 0 01-2-2V7h12z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v6m4-6v6" />
          </svg>
        </button>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <div 
          className="text-gray-800 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>

      {/* Post Media */}
      {post.media_url && (
        <div className="mb-4">
          {post.media_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
            <LazyImage
              src={post.media_url}
              alt="Post media"
              className="w-full max-h-96 object-cover rounded-lg"
            />
          ) : (
            <video 
              src={post.media_url} 
              controls 
              className="w-full max-h-96 rounded-lg"
            />
          )}
        </div>
      )}

      {/* Post Stats */}
      <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
        <div className="flex items-center space-x-6">
          {/* Like Button */}
          <button className="flex items-center space-x-1 hover:text-blue-600 transition-colors" onClick={() => handleLike(post.id)}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{post.likes_count}</span>
          </button>
          {/* Comment Button */}
          <button className="flex items-center space-x-1 hover:text-blue-600 transition-colors" onClick={() => handleComment(post.id)}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{post.comments_count}</span>
          </button>
          {/* Share Button */}
          <button className="flex items-center space-x-1 hover:text-blue-600 transition-colors" onClick={() => handleShare(post.id)}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 8a3 3 0 11-6 0 3 3 0 016 0zm6 8a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12l4-4 4 4" />
            </svg>
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderSkeleton = () => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <Skeleton variant="circular" width={40} height={40} className="mr-3" />
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-4" />
      <Skeleton variant="rectangular" className="h-48 w-full mb-4" />
      <div className="flex space-x-6">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Posts</h2>
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Clear filters
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={categoriesLoading || !!categoriesError}
          >
            {categoriesLoading && <option>Loading...</option>}
            {categoriesError && <option>{categoriesError}</option>}
            {!categoriesLoading && !categoriesError && <option value="">All Categories</option>}
            {!categoriesLoading && !categoriesError && categories.map(category => (
              <option key={category.id} value={category.name}>
                {category.name} ({category.count})
              </option>
            ))}
          </select>

          {/* Visibility Filter */}
          <select
            value={selectedVisibility}
            onChange={(e) => setSelectedVisibility(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Posts</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="created_at">Date</option>
            <option value="likes_count">Likes</option>
            <option value="views_count">Views</option>
            <option value="comments_count">Comments</option>
          </select>

          {/* Sort Order */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>

        {/* Popular Tags */}
        {popularTags.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {popularTags.map(tag => (
                <button
                  key={tag.name}
                  onClick={() => handleTagToggle(tag.name)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    selectedTags.includes(tag.name)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  #{tag.name} ({tag.count})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Posts List */}
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {posts.length === 0 && !loading && !error && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts found</h3>
            <p className="text-gray-500">Try adjusting your filters or search terms.</p>
          </div>
        )}

        {posts.map((post) => (
          <div key={`post-${post.id}-${post.created_at}`}>
            {renderPostCard(post)}
          </div>
        ))}

        {/* Loading States */}
        {loading && (
          <>
            {renderSkeleton()}
            {renderSkeleton()}
            {renderSkeleton()}
          </>
        )}

        {/* Infinite Scroll Trigger */}
        <div ref={infiniteScrollRef} className="h-10 flex items-center justify-center">
          {loading && hasMore && <LoadingSpinner size="sm" />}
        </div>

        {/* End of Results */}
        {!hasMore && posts.length > 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>You've reached the end of the posts.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostList; 