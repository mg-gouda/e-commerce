'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import AdminLayout from '@/components/admin/AdminLayout';

interface Media {
  id: string;
  filename: string;
  original_name: string;
  url: string;
  thumbnail_url: string;
  mime_type: string;
  size: number;
  alt_text?: string;
  caption?: string;
  description?: string;
  tags: string[];
  folder: string;
  usage_count: number;
  width?: number;
  height?: number;
  created_at: string;
}

export default function MediaLibrary() {
  const [media, setMedia] = useState<Media[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [uploadingMultiple, setUploadingMultiple] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [detailsPanel, setDetailsPanel] = useState<Media | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<Media>>({});
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropData, setCropData] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [showResizeModal, setShowResizeModal] = useState(false);
  const [resizeData, setResizeData] = useState({ width: 800, height: 600 });
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
      setFolders(['all', 'uncategorized', ...response.data]);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingMultiple(true);

    try {
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

        await api.post('/media/upload', formData, {
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

        // Brief pause to show completion status
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      await fetchMedia();
    } catch (error) {
      console.error('Error uploading files:', error);
      setUploadProgress(prev => ({
        ...prev,
        status: 'Error ✗'
      }));
    } finally {
      setUploadingMultiple(false);
      setUploadProgress({ current: 0, total: 0, fileName: '', status: '' });
      e.target.value = '';
    }
  };

  const handleSelectMedia = (id: string) => {
    setSelectedMedia(prev =>
      prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedMedia.length === media.length) {
      setSelectedMedia([]);
    } else {
      setSelectedMedia(media.map(m => m.id));
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedMedia.length} items?`)) return;

    try {
      await api.post('/media/bulk-delete', { ids: selectedMedia });
      setSelectedMedia([]);
      await fetchMedia();
    } catch (error) {
      console.error('Error deleting media:', error);
    }
  };

  const handleMoveToFolder = async (folder: string) => {
    try {
      await api.post('/media/move', { ids: selectedMedia, folder });
      setSelectedMedia([]);
      await fetchMedia();
    } catch (error) {
      console.error('Error moving media:', error);
    }
  };

  const handleCreateFolder = () => {
    if (newFolderName && !folders.includes(newFolderName)) {
      setFolders([...folders, newFolderName]);
      setNewFolderName('');
      setShowNewFolderInput(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this media item?')) return;

    try {
      await api.delete(`/media/${id}`);
      await fetchMedia();
      if (detailsPanel?.id === id) {
        setDetailsPanel(null);
      }
    } catch (error) {
      console.error('Error deleting media:', error);
    }
  };

  const handleUpdateDetails = async () => {
    if (!detailsPanel) return;

    try {
      await api.put(`/media/${detailsPanel.id}`, editData);
      setEditMode(false);
      await fetchMedia();
      const updatedMedia = await api.get(`/media/${detailsPanel.id}`);
      setDetailsPanel(updatedMedia.data);
    } catch (error) {
      console.error('Error updating media:', error);
    }
  };

  const handleCrop = async () => {
    if (!detailsPanel) return;

    try {
      const response = await api.post(`/media/${detailsPanel.id}/crop`, cropData);
      setShowCropModal(false);
      await fetchMedia();
      setDetailsPanel(response.data);
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  };

  const handleResize = async () => {
    if (!detailsPanel) return;

    try {
      const response = await api.post(`/media/${detailsPanel.id}/resize`, resizeData);
      setShowResizeModal(false);
      await fetchMedia();
      setDetailsPanel(response.data);
    } catch (error) {
      console.error('Error resizing image:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <AdminLayout>
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Media Library</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your images and media files
          </p>
        </div>

        <div className="flex space-x-2">
          <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
            {uploadingMultiple ? 'Uploading...' : '+ Upload'}
            <input
              type="file"
              multiple
              accept="image/*,image/svg+xml"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploadingMultiple}
            />
          </label>
        </div>
      </div>

      {/* Upload Progress Bar */}
      {uploadingMultiple && uploadProgress.total > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
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
          <div className="w-full bg-blue-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{
                width: `${(uploadProgress.current / uploadProgress.total) * 100}%`
              }}
            />
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Folder Filter */}
          <div className="flex items-center space-x-2">
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {folders.map(folder => (
                <option key={folder} value={folder}>
                  {folder.charAt(0).toUpperCase() + folder.slice(1)}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowNewFolderInput(!showNewFolderInput)}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              title="New folder"
            >
              📁+
            </button>
          </div>

          {/* View Mode */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
            >
              List
            </button>
          </div>
        </div>

        {/* New Folder Input */}
        {showNewFolderInput && (
          <div className="mt-4 flex items-center space-x-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleCreateFolder}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowNewFolderInput(false);
                setNewFolderName('');
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedMedia.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              {selectedMedia.length} items selected
            </span>
            <div className="flex space-x-2">
              <select
                onChange={(e) => {
                  if (e.target.value) handleMoveToFolder(e.target.value);
                  e.target.value = '';
                }}
                className="px-3 py-1 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Move to...</option>
                {folders.filter(f => f !== 'all').map(folder => (
                  <option key={folder} value={folder}>{folder}</option>
                ))}
              </select>

              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                Delete Selected
              </button>

              <button
                onClick={() => setSelectedMedia([])}
                className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        {/* Media Grid/List */}
        <div className={`flex-1 ${detailsPanel ? 'w-2/3' : 'w-full'}`}>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : media.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500">No media files found</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {media.map((item) => (
                <div
                  key={item.id}
                  className={`relative bg-white rounded-lg border-2 overflow-hidden group cursor-pointer ${
                    selectedMedia.includes(item.id) ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                  }`}
                  onClick={() => setDetailsPanel(item)}
                >
                  {/* Selection Checkbox */}
                  <div
                    className="absolute top-2 left-2 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectMedia(item.id);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMedia.includes(item.id)}
                      onChange={() => {}}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>

                  {/* Image */}
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${item.thumbnail_url}`}
                      alt={item.alt_text || item.original_name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
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
            <div className="bg-white rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedMedia.length === media.length}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preview</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Folder</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dimensions</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {media.map((item) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-gray-50 cursor-pointer ${
                        selectedMedia.includes(item.id) ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => setDetailsPanel(item)}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedMedia.includes(item.id)}
                          onChange={() => handleSelectMedia(item.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
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
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {item.width && item.height ? `${item.width}×${item.height}` : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <nav className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-2 border rounded-lg ${
                      currentPage === i + 1
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>

        {/* Details Panel */}
        {detailsPanel && (
          <div className="w-1/3 bg-white rounded-lg shadow-sm p-4 sticky top-4 h-fit">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Details</h3>
              <button
                onClick={() => setDetailsPanel(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Preview */}
            <div className="mb-4">
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}${detailsPanel.url}`}
                alt={detailsPanel.alt_text || detailsPanel.original_name}
                className="w-full rounded-lg border border-gray-200"
              />
            </div>

            {/* File Info */}
            <div className="space-y-3 mb-4">
              {editMode ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text</label>
                    <input
                      type="text"
                      value={editData.alt_text || ''}
                      onChange={(e) => setEditData({ ...editData, alt_text: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
                    <input
                      type="text"
                      value={editData.caption || ''}
                      onChange={(e) => setEditData({ ...editData, caption: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={editData.description || ''}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                    <input
                      type="text"
                      value={editData.tags?.join(', ') || ''}
                      onChange={(e) => setEditData({ ...editData, tags: e.target.value.split(',').map(t => t.trim()) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={handleUpdateDetails}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditMode(false);
                        setEditData({});
                      }}
                      className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Filename</p>
                    <p className="text-sm text-gray-900">{detailsPanel.original_name}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700">Dimensions</p>
                    <p className="text-sm text-gray-900">
                      {detailsPanel.width && detailsPanel.height
                        ? `${detailsPanel.width}×${detailsPanel.height}`
                        : 'N/A'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700">File Size</p>
                    <p className="text-sm text-gray-900">{formatFileSize(detailsPanel.size)}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700">Folder</p>
                    <p className="text-sm text-gray-900">{detailsPanel.folder}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700">Alt Text</p>
                    <p className="text-sm text-gray-900">{detailsPanel.alt_text || 'Not set'}</p>
                  </div>

                  {detailsPanel.tags && detailsPanel.tags.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Tags</p>
                      <div className="flex flex-wrap gap-1">
                        {detailsPanel.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-gray-700">URL</p>
                    <p className="text-sm text-gray-900 break-all">
                      {process.env.NEXT_PUBLIC_API_URL}{detailsPanel.url}
                    </p>
                  </div>

                  <div className="pt-4 space-y-2">
                    <button
                      onClick={() => {
                        setEditMode(true);
                        setEditData({
                          alt_text: detailsPanel.alt_text,
                          caption: detailsPanel.caption,
                          description: detailsPanel.description,
                          tags: detailsPanel.tags,
                        });
                      }}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Edit Details
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setShowCropModal(true)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                      >
                        Crop
                      </button>
                      <button
                        onClick={() => setShowResizeModal(true)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                      >
                        Resize
                      </button>
                    </div>

                    <button
                      onClick={() => handleDelete(detailsPanel.id)}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Crop Image</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">X</label>
                  <input
                    type="number"
                    value={cropData.x}
                    onChange={(e) => setCropData({ ...cropData, x: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Y</label>
                  <input
                    type="number"
                    value={cropData.y}
                    onChange={(e) => setCropData({ ...cropData, y: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                  <input
                    type="number"
                    value={cropData.width}
                    onChange={(e) => setCropData({ ...cropData, width: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                  <input
                    type="number"
                    value={cropData.height}
                    onChange={(e) => setCropData({ ...cropData, height: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleCrop}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Crop
                </button>
                <button
                  onClick={() => setShowCropModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resize Modal */}
      {showResizeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Resize Image</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                  <input
                    type="number"
                    value={resizeData.width}
                    onChange={(e) => setResizeData({ ...resizeData, width: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                  <input
                    type="number"
                    value={resizeData.height}
                    onChange={(e) => setResizeData({ ...resizeData, height: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleResize}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Resize
                </button>
                <button
                  onClick={() => setShowResizeModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </AdminLayout>
  );
}
