'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Media {
  id: string;
  filename: string;
  original_name: string;
  url: string;
  thumbnail_url: string;
  mime_type: string;
  size: number;
  alt_text?: string;
  folder: string;
  created_at: string;
}

interface MediaPickerProps {
  onSelect: (media: Media | Media[]) => void;
  onClose: () => void;
  multiple?: boolean;
  selectedIds?: string[];
}

export default function MediaPicker({ onSelect, onClose, multiple = false, selectedIds = [] }: MediaPickerProps) {
  const [media, setMedia] = useState<Media[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<string[]>(selectedIds);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number; fileName: string; status: string }>({ current: 0, total: 0, fileName: '', status: '' });

  useEffect(() => {
    fetchMedia();
    fetchFolders();
  }, [currentPage, selectedFolder, searchQuery]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '24',
      });

      if (selectedFolder && selectedFolder !== 'all') {
        params.append('folder', selectedFolder);
      }

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await api.get(`/media?${params.toString()}`);
      setMedia(response.data.items);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async () => {
    try {
      const response = await api.get('/media/folders');
      const backendFolders = response.data || [];
      const allFolders = ['all', 'uncategorized', ...backendFolders.filter((f: string) => f !== 'uncategorized')];
      setFolders(allFolders);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const uploadedMedia: Media[] = [];

      for (let i = 0; i < files.length; i++) {
        const currentFile = files[i];

        setUploadProgress({
          current: i + 1,
          total: files.length,
          fileName: currentFile.name,
          status: 'Uploading...'
        });

        const formData = new FormData();
        formData.append('file', currentFile);
        formData.append('folder', selectedFolder === 'all' ? 'uncategorized' : selectedFolder);

        const response = await api.post('/media/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = progressEvent.total
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0;

            if (percentCompleted < 100) {
              setUploadProgress(prev => ({
                ...prev,
                status: `Uploading... ${percentCompleted}%`
              }));
            } else {
              setUploadProgress(prev => ({
                ...prev,
                status: 'Converting to WebP...'
              }));
            }
          }
        });

        setUploadProgress(prev => ({
          ...prev,
          status: 'Complete ✓'
        }));

        uploadedMedia.push(response.data);

        // Brief pause to show completion status
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      await fetchMedia();

      // Auto-select newly uploaded media
      if (uploadedMedia.length > 0) {
        if (multiple) {
          setSelectedMedia(prev => [...prev, ...uploadedMedia.map(m => m.id)]);
        } else {
          setSelectedMedia([uploadedMedia[0].id]);
        }
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      setUploadProgress(prev => ({
        ...prev,
        status: 'Error ✗'
      }));
    } finally {
      setUploading(false);
      setUploadProgress({ current: 0, total: 0, fileName: '', status: '' });
      e.target.value = '';
    }
  };

  const handleSelectMedia = (id: string) => {
    if (multiple) {
      setSelectedMedia(prev =>
        prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
      );
    } else {
      setSelectedMedia([id]);
    }
  };

  const handleConfirm = () => {
    const selectedMediaItems = media.filter(m => selectedMedia.includes(m.id));

    if (selectedMediaItems.length > 0) {
      onSelect(multiple ? selectedMediaItems : selectedMediaItems[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">Select Media</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Upload Button */}
            <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors text-sm">
              {uploading ? 'Uploading...' : '+ Upload'}
              <input
                type="file"
                multiple={multiple}
                accept="image/*,image/svg+xml"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>

            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search media..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Folder Filter */}
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              {folders.map(folder => (
                <option key={folder} value={folder}>
                  {folder.charAt(0).toUpperCase() + folder.slice(1)}
                </option>
              ))}
            </select>

            {/* View Mode */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
              >
                List
              </button>
            </div>
          </div>

          {/* Selected count */}
          {selectedMedia.length > 0 && (
            <div className="mt-3 text-sm text-blue-600 font-medium">
              {selectedMedia.length} {selectedMedia.length === 1 ? 'item' : 'items'} selected
            </div>
          )}
        </div>

        {/* Upload Progress Bar */}
        {uploading && uploadProgress.total > 0 && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  {uploadProgress.fileName}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  File {uploadProgress.current} of {uploadProgress.total}
                </p>
              </div>
              <span className="text-sm font-semibold text-blue-900 ml-4">
                {uploadProgress.status}
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(uploadProgress.current / uploadProgress.total) * 100}%`
                }}
              />
            </div>
          </div>
        )}

        {/* Media Grid/List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : media.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No media files found</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {media.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectMedia(item.id)}
                  className={`relative bg-white rounded-lg border-2 overflow-hidden cursor-pointer transition-all ${
                    selectedMedia.includes(item.id)
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Selection Indicator */}
                  {selectedMedia.includes(item.id) && (
                    <div className="absolute top-2 left-2 z-10 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}

                  {/* Image */}
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${item.thumbnail_url}`}
                      alt={item.alt_text || item.original_name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="p-2">
                    <p className="text-xs text-gray-900 truncate font-medium">
                      {item.original_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(item.size)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preview</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Folder</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {media.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => handleSelectMedia(item.id)}
                      className={`cursor-pointer ${
                        selectedMedia.includes(item.id)
                          ? 'bg-blue-50 hover:bg-blue-100'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL}${item.thumbnail_url}`}
                          alt={item.alt_text || item.original_name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.original_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{item.folder}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatFileSize(item.size)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <nav className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
                >
                  Previous
                </button>

                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 border rounded-lg text-sm ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedMedia.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Select {selectedMedia.length > 0 && `(${selectedMedia.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
