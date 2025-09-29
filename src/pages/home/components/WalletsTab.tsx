
import { useState, useMemo } from 'react';
import { useVault } from '../../../contexts/VaultContext';
import { useToast } from '../../../hooks/useToast';
import { Wallet } from '../../../types/vault';
import { exportToCSV } from '../../../utils/export';
import Button from '../../../components/base/Button';
import Input from '../../../components/base/Input';
import Modal from '../../../components/base/Modal';

export default function WalletsTab() {
  const { state, addWallet, updateWallet, deleteWallet, deleteWallets } = useVault();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWallets, setSelectedWallets] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [newWallet, setNewWallet] = useState({
    name: '',
    network: '',
    publicAddress: '',
    notes: ''
  });

  const filteredWallets = useMemo(() => {
    return state.wallets.filter(wallet =>
      wallet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wallet.network.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wallet.publicAddress.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [state.wallets, searchTerm]);

  const handleAddWallet = () => {
    if (!newWallet.name.trim() || !newWallet.network.trim()) {
      showToast('Name and network are required', 'error');
      return;
    }

    addWallet(newWallet);
    setNewWallet({ name: '', network: '', publicAddress: '', notes: '' });
    setShowAddModal(false);
    showToast('Wallet added successfully', 'success');
  };

  const handleUpdateWallet = (wallet: Wallet) => {
    updateWallet(wallet.id, wallet);
    setEditingWallet(null);
    showToast('Wallet updated successfully', 'success');
  };

  const handleDeleteSelected = () => {
    if (selectedWallets.length === 0) return;
    
    if (confirm(`Delete ${selectedWallets.length} selected wallets?`)) {
      deleteWallets(selectedWallets);
      setSelectedWallets([]);
      showToast(`${selectedWallets.length} wallets deleted`, 'success');
    }
  };

  const handleExportCSV = () => {
    exportToCSV(filteredWallets, 'wallets.csv', ['id']);
    showToast('Wallets exported to CSV', 'success');
  };

  const toggleWalletSelection = (walletId: string) => {
    setSelectedWallets(prev =>
      prev.includes(walletId)
        ? prev.filter(id => id !== walletId)
        : [...prev, walletId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedWallets(
      selectedWallets.length === filteredWallets.length
        ? []
        : filteredWallets.map(wallet => wallet.id)
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Search wallets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon="ri-search-line"
            className="w-64 bg-gray-800 border-gray-600 text-white"
          />
          {selectedWallets.length > 0 && (
            <Button
              onClick={handleDeleteSelected}
              variant="danger"
              size="sm"
            >
              <i className="ri-delete-bin-line mr-2"></i>
              Delete ({selectedWallets.length})
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
            Add Wallet
          </Button>
        </div>
      </div>

      {/* Wallets Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedWallets.length === filteredWallets.length && filteredWallets.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Network</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Public Address</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Notes</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredWallets.map(wallet => (
                <tr key={wallet.id} className="hover:bg-gray-700">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedWallets.includes(wallet.id)}
                      onChange={() => toggleWalletSelection(wallet.id)}
                      className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    {editingWallet?.id === wallet.id ? (
                      <Input
                        value={editingWallet.name}
                        onChange={(e) => setEditingWallet({ ...editingWallet, name: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-white text-sm"
                      />
                    ) : (
                      <div className="flex items-center">
                        <i className="ri-wallet-line text-blue-400 mr-2"></i>
                        <span className="text-white font-medium">{wallet.name}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingWallet?.id === wallet.id ? (
                      <Input
                        value={editingWallet.network}
                        onChange={(e) => setEditingWallet({ ...editingWallet, network: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-white text-sm"
                      />
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {wallet.network}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingWallet?.id === wallet.id ? (
                      <Input
                        value={editingWallet.publicAddress}
                        onChange={(e) => setEditingWallet({ ...editingWallet, publicAddress: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-white text-sm"
                      />
                    ) : (
                      <div className="flex items-center">
                        <span className="text-gray-300 font-mono text-sm truncate max-w-xs">
                          {wallet.publicAddress}
                        </span>
                        {wallet.publicAddress && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(wallet.publicAddress);
                              showToast('Address copied to clipboard', 'success');
                            }}
                            className="ml-2 text-gray-400 hover:text-gray-300"
                          >
                            <i className="ri-file-copy-line"></i>
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingWallet?.id === wallet.id ? (
                      <Input
                        value={editingWallet.notes}
                        onChange={(e) => setEditingWallet({ ...editingWallet, notes: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-white text-sm"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">{wallet.notes}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      {editingWallet?.id === wallet.id ? (
                        <>
                          <button
                            onClick={() => handleUpdateWallet(editingWallet)}
                            className="text-green-400 hover:text-green-300"
                          >
                            <i className="ri-check-line"></i>
                          </button>
                          <button
                            onClick={() => setEditingWallet(null)}
                            className="text-gray-400 hover:text-gray-300"
                          >
                            <i className="ri-close-line"></i>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingWallet(wallet)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <i className="ri-edit-line"></i>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this wallet?')) {
                                deleteWallet(wallet.id);
                                showToast('Wallet deleted', 'success');
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
        
        {filteredWallets.length === 0 && (
          <div className="text-center py-12">
            <i className="ri-wallet-line text-4xl text-gray-600 mb-4"></i>
            <p className="text-gray-400">No wallets found</p>
          </div>
        )}
      </div>

      {/* Add Wallet Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Wallet"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Name"
              value={newWallet.name}
              onChange={(e) => setNewWallet({ ...newWallet, name: e.target.value })}
              placeholder="Wallet name"
            />
            <Input
              label="Network"
              value={newWallet.network}
              onChange={(e) => setNewWallet({ ...newWallet, network: e.target.value })}
              placeholder="e.g., Ethereum, Bitcoin"
            />
          </div>
          <Input
            label="Public Address"
            value={newWallet.publicAddress}
            onChange={(e) => setNewWallet({ ...newWallet, publicAddress: e.target.value })}
            placeholder="Wallet public address"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={newWallet.notes}
              onChange={(e) => setNewWallet({ ...newWallet, notes: e.target.value })}
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
            <Button onClick={handleAddWallet}>
              Add Wallet
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
