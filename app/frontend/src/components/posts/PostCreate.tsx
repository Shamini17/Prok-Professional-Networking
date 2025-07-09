import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'react-quill/dist/quill.snow.css';
// @ts-ignore
import { postsApi } from './api';

const MAX_CHAR = 1000;

const PostCreate: React.FC = () => {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [category, setCategory] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fetch categories on mount
  useEffect(() => {
    postsApi.getCategories().then(res => {
      setCategories(res.categories || []);
      if (res.categories && res.categories.length > 0) {
        setCategory(res.categories[0].name);
      }
    }).catch(() => setCategories([]));
  }, []);

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (dropRef.current) dropRef.current.classList.add('ring-2', 'ring-blue-400');
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (dropRef.current) dropRef.current.classList.remove('ring-2', 'ring-blue-400');
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (dropRef.current) dropRef.current.classList.remove('ring-2', 'ring-blue-400');
    const file = e.dataTransfer.files[0];
    if (file) handleMediaChange(file);
  };

  // Media change
  const handleMediaChange = (file: File) => {
    setMedia(file);
    setMediaPreview(URL.createObjectURL(file));
  };

  // File input change
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleMediaChange(e.target.files[0]);
    }
  };

  // Remove media
  const removeMedia = () => {
    setMedia(null);
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Post submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true);
    setError(null);
    setSuccess(null);
    try {
      // Pass visibility and category to the API
      await postsApi.createPost(content, media, visibility, category);
      setSuccess('Post created successfully!');
      setContent('');
      removeMedia();
      // Force a full reload of the posts page to show the new post
      setTimeout(() => { window.location.href = '/posts'; }, 800);
    } catch (err: any) {
      setError('Failed to create post.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="flex justify-center items-start min-h-[60vh] bg-gray-50 py-8">
      <form
        className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
        onSubmit={handleSubmit}
        aria-label="Create Post"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Create Post</h2>
        {/* Visibility & Category */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <label className="block text-md font-semibold mb-1">Visibility</label>
            <select
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={visibility}
              onChange={e => setVisibility(e.target.value as 'public' | 'private')}
              aria-label="Select post visibility"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
          <div>
            <label className="block text-md font-semibold mb-1">Category</label>
            <select
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={category}
              onChange={e => setCategory(e.target.value)}
              aria-label="Select post category"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
        {/* Content Editor */}
        <label htmlFor="content" className="block text-lg font-semibold mb-2">Content</label>
        <div className="mb-4">
          <textarea
            id="content"
            name="content"
            className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none text-gray-800 bg-gray-50"
            placeholder="What's on your mind?"
            value={content}
            onChange={e => setContent(e.target.value.slice(0, MAX_CHAR))}
            maxLength={MAX_CHAR}
            required
            aria-required="true"
          />
          <div className="text-right text-xs text-gray-500 mt-1">{content.length}/{MAX_CHAR} characters</div>
        </div>
        {/* Media Upload */}
        <label className="block text-lg font-semibold mb-2">Media</label>
        <div
          ref={dropRef}
          className="mb-4 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 hover:bg-blue-50 transition cursor-pointer"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          tabIndex={0}
          aria-label="Upload media by clicking or dragging"
        >
          <input
            type="file"
            accept="image/*,video/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileInput}
            required
          />
          {!mediaPreview ? (
            <span className="text-gray-400">Drag & drop or click to select an image/video (required)</span>
          ) : (
            <div className="relative w-full flex flex-col items-center">
              {mediaPreview.match(/video/) ? (
                <video src={mediaPreview} controls className="max-h-48 rounded-lg shadow mb-2" />
              ) : (
                <img src={mediaPreview} alt="Preview" className="max-h-48 rounded-lg shadow mb-2" />
              )}
              <button
                type="button"
                onClick={removeMedia}
                className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-1 shadow hover:bg-red-100 text-red-600"
                aria-label="Remove media"
              >
                ×
              </button>
            </div>
          )}
        </div>
        {/* Feedback */}
        {error && <div className="mb-2 text-red-600 text-sm">{error}</div>}
        {success && <div className="mb-2 text-green-600 text-sm">{success}</div>}
        {/* Actions */}
        <div className="flex gap-4 mt-6">
          <button
            type="submit"
            className="flex-1 px-6 py-2 bg-blue-700 text-white rounded-lg font-semibold shadow hover:bg-blue-800 transition disabled:opacity-50"
            disabled={posting || !content.trim() || !media}
          >
            {posting ? 'Posting...' : 'Post'}
          </button>
          <button
            type="button"
            className="flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold shadow hover:bg-gray-300 transition"
            onClick={() => { setContent(''); removeMedia(); setError(null); setSuccess(null); }}
            disabled={posting}
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostCreate; 