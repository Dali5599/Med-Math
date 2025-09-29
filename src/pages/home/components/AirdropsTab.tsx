
import { useState, useMemo } from 'react';
import { useVault } from '../../../contexts/VaultContext';
import { useToast } from '../../../hooks/useToast';
import { Airdrop } from '../../../types/vault';
import { exportToCSV } from '../../../utils/export';
import Button from '../../../components/base/Button';
import Input from '../../../components/base/Input';
import Modal from '../../../components/base/Modal';

export default function AirdropsTab() {
  const { state, addAirdrop, updateAirdrop, deleteAirdrop, deleteAirdrops } = useVault();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAirdrops, setSelectedAirdrops] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAirdrop, setEditingAirdrop] = useState<Airdrop | null>(null);
  const [newAirdrop, setNewAirdrop] = useState({
    label: '',
    url: '',
    tags: [] as string[],
    notes: ''
  });
  const [tagInput, setTagInput] = useState('');

  const filteredAirdrops = useMemo(() => {
    return state.airdrops.filter(airdrop =>
      airdrop.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      airdrop.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      airdrop.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [state.airdrops, searchTerm]);

  const handleAddAirdrop = () => {
    if (!newAirdrop.label.trim()) {
      showToast('Label is required', 'error');
      return;
    }

    addAirdrop(newAirdrop);
    setNewAirdrop({ label: '', url: '', tags: [], notes: '' });
    setTagInput('');
    setShowAddModal(false);
    showToast('Airdrop added successfully', 'success');
  };

  const handleUpdateAirdrop = (airdrop: Airdrop) => {
    updateAirdrop(airdrop.id, airdrop);
    setEditingAirdrop(null);
    showToast('Airdrop updated successfully', 'success');
  };

  const handleDeleteSelected = () => {
    if (selectedAirdrops.length === 0) return;
    
    if (confirm(`Delete ${selectedAirdrops.length} selected airdrops?`)) {
      deleteAirdrops(selectedAirdrops);
      setSelectedAirdrops([]);
      showToast(`${selectedAirdrops.length} airdrops deleted`, 'success');
    }
  };

  const handleExportCSV = () => {
    const exportData = filteredAirdrops.map(airdrop => ({
      ...airdrop,
      tags: airdrop.tags.join(', ')
    }));
    exportToCSV(exportData, 'airdrops.csv', ['id']);
    showToast('Airdrops exported to CSV', 'success');
  };

  const toggleAirdropSelection = (airdropId: string) => {
    setSelectedAirdrops(prev =>
      prev.includes(airdropId)
        ? prev.filter(id => id !== airdropId)
        : [...prev, airdropId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedAirdrops(
      selectedAirdrops.length === filteredAirdrops.length
        ? []
        : filteredAirdrops.map(airdrop => airdrop.id)
    );
  };

  const addTag = (tags: string[], setTags: (tags: string[]) => void, input: string, setInput: (input: string) => void) => {
    const trimmedTag = input.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setInput('');
    }
  };

  const removeTag = (tags: string[], setTags: (tags: string[]) => void, tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const openUrl = (url: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Search airdrops..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon="ri-search-line"
            className="w-64 bg-gray-800 border-gray-600 text-white"
          />
          {selectedAirdrops.length > 0 && (
            <Button
              onClick={handleDeleteSelected}
              variant="danger"
              size="sm"
            >
              <i className="ri-delete-bin-line mr-2"></i>
              Delete ({selectedAirdrops.length})
            </Button>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleExportCSV}
            variant="secondary"
            size="sm"
          >
            <i className="ri-download-line mr-2"></i>
            Export CSV
          </Button>
          <Button
            onClick={() => setShowAddModal(true)}
            size="sm"
          >
            <i className="ri-add-line mr-2"></i>
            Add Airdrop
          </Button>
        </div>
      </div>

      {/* Airdrops Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedAirdrops.length === filteredAirdrops.length && filteredAirdrops.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Label</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">URL</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Tags</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Notes</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredAirdrops.map(airdrop => (
                <tr key={airdrop.id} className="hover:bg-gray-700">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedAirdrops.includes(airdrop.id)}
                      onChange={() => toggleAirdropSelection(airdrop.id)}
                      className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    {editingAirdrop?.id === airdrop.id ? (
                      <Input
                        value={editingAirdrop.label}
                        onChange={(e) => setEditingAirdrop({ ...editingAirdrop, label: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-white text-sm"
                      />
                    ) : (
                      <div className="flex items-center">
                        <i className="ri-gift-line text-green-400 mr-2"></i>
                        <span className="text-white font-medium">{airdrop.label}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingAirdrop?.id === airdrop.id ? (
                      <Input
                        value={editingAirdrop.url}
                        onChange={(e) => setEditingAirdrop({ ...editingAirdrop, url: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-white text-sm"
                      />
                    ) : (
                      <div className="flex items-center">
                        {airdrop.url ? (
                          <button
                            onClick={() => openUrl(airdrop.url)}
                            className="text-blue-400 hover:text-blue-300 underline text-sm truncate max-w-xs"
                          >
                            {airdrop.url}
                          </button>
                        ) : (
                          <span className="text-gray-500 text-sm">No URL</span>
                        )}
                        {airdrop.url && (
                          <button
                            onClick={() => openUrl(airdrop.url)}
                            className="ml-2 text-gray-400 hover:text-gray-300"
                          >
                            <i className="ri-external-link-line"></i>
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingAirdrop?.id === airdrop.id ? (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {editingAirdrop.tags.map(tag => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {tag}
                              <button
                                onClick={() => removeTag(editingAirdrop.tags, (tags) => setEditingAirdrop({ ...editingAirdrop, tags }), tag)}
                                className="ml-1 text-blue-600 hover:text-blue-800"
                              >
                                <i className="ri-close-line text-xs"></i>
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex">
                          <Input
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                addTag(editingAirdrop.tags, (tags) => setEditingAirdrop({ ...editingAirdrop, tags }), tagInput, setTagInput);
                              }
                            }}
                            placeholder="Add tag"
                            className="bg-gray-700 border-gray-600 text-white text-xs"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {airdrop.tags.map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingAirdrop?.id === airdrop.id ? (
                      <Input
                        value={editingAirdrop.notes}
                        onChange={(e) => setEditingAirdrop({ ...editingAirdrop, notes: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-white text-sm"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">{airdrop.notes}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      {editingAirdrop?.id === airdrop.id ? (
                        <>
                          <button
                            onClick={() => handleUpdateAirdrop(editingAirdrop)}
                            className="text-green-400 hover:text-green-300"
                          >
                            <i className="ri-check-line"></i>
                          </button>
                          <button
                            onClick={() => setEditingAirdrop(null)}
                            className="text-gray-400 hover:text-gray-300"
                          >
                            <i className="ri-close-line"></i>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingAirdrop(airdrop)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <i className="ri-edit-line"></i>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this airdrop?')) {
                                deleteAirdrop(airdrop.id);
                                showToast('Airdrop deleted', 'success');
                              }
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredAirdrops.length === 0 && (
          <div className="text-center py-12">
            <i className="ri-gift-line text-4xl text-gray-600 mb-4"></i>
            <p className="text-gray-400">No airdrops found</p>
          </div>
        )}
      </div>

      {/* Add Airdrop Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Airdrop"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Label"
            value={newAirdrop.label}
            onChange={(e) => setNewAirdrop({ ...newAirdrop, label: e.target.value })}
            placeholder="Airdrop name or project"
          />
          <Input
            label="URL"
            value={newAirdrop.url}
            onChange={(e) => setNewAirdrop({ ...newAirdrop, url: e.target.value })}
            placeholder="https://..."
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags
            </label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {newAirdrop.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(newAirdrop.tags, (tags) => setNewAirdrop({ ...newAirdrop, tags }), tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <i className="ri-close-line text-xs"></i>
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addTag(newAirdrop.tags, (tags) => setNewAirdrop({ ...newAirdrop, tags }), tagInput, setTagInput);
                    }
                  }}
                  placeholder="Type and press Enter to add tags"
                />
                <Button
                  onClick={() => addTag(newAirdrop.tags, (tags) => setNewAirdrop({ ...newAirdrop, tags }), tagInput, setTagInput)}
                  variant="secondary"
                  size="sm"
                  className="ml-2"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={newAirdrop.notes}
              onChange={(e) => setNewAirdrop({ ...newAirdrop, notes: e.target.value })}
              placeholder="Additional notes"
              rows={3}
              className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              onClick={() => setShowAddModal(false)}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button onClick={handleAddAirdrop}>
              Add Airdrop
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
