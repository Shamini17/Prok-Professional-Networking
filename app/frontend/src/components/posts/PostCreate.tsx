import React, { useState, useRef, lazy, Suspense } from 'react';
import 'react-quill/dist/quill.snow.css';
// @ts-ignore
import { postsApi } from './api';

// @ts-ignore
const ReactQuill = lazy(() => import('react-quill'));

const PostCreate: React.FC = () => {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleContentChange = (value: string) => {
    setContent(value);
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMedia(file);
      setMediaPreview(URL.createObjectURL(file));
    } else {
      setMedia(null);
      setMediaPreview(null);
    }
  };

  const validate = () => {
    if (!content || content.replace(/<(.|\n)*?>/g, '').trim().length === 0) {
      setError('Post content cannot be empty.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError(null);
    try {
      await postsApi.createPost(content, media);
      setContent('');
      setMedia(null);
      setMediaPreview(null);
      setShowPreview(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      alert('Post created successfully!');
    } catch (err) {
      setError('Failed to create post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Create Post</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Content</label>
            <Suspense fallback={<div>Loading editor...</div>}>
              <ReactQuill
                value={content}
                onChange={handleContentChange}
                placeholder="What's on your mind?"
                className="bg-white"
              />
            </Suspense>
          </div>
          <div>
            <label className="block font-semibold mb-1">Media (optional)</label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleMediaChange}
              ref={fileInputRef}
              className="block w-full text-sm text-gray-500"
            />
            {mediaPreview && (
              <div className="mt-2">
                {media?.type.startsWith('image') ? (
                  <img src={mediaPreview} alt="Preview" className="max-h-48 rounded" />
                ) : (
                  <video src={mediaPreview} controls className="max-h-48 rounded" />
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              onClick={() => setShowPreview((prev) => !prev)}
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
          {error && <div className="text-red-600 font-semibold">{error}</div>}
        </form>
        {showPreview && (
          <div className="mt-6 border-t pt-4">
            <h3 className="font-bold mb-2">Post Preview</h3>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
            {mediaPreview && (
              <div className="mt-2">
                {media?.type.startsWith('image') ? (
                  <img src={mediaPreview} alt="Preview" className="max-h-48 rounded" />
                ) : (
                  <video src={mediaPreview} controls className="max-h-48 rounded" />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCreate; 