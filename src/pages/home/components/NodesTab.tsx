
import { useState, useMemo } from 'react';
import { useVault } from '../../../contexts/VaultContext';
import { useToast } from '../../../hooks/useToast';
import { Node } from '../../../types/vault';
import { exportToCSV } from '../../../utils/export';
import Button from '../../../components/base/Button';
import Input from '../../../components/base/Input';
import Modal from '../../../components/base/Modal';
import TerminalPanel from './TerminalPanel';

export default function NodesTab() {
  const { state, addNode, updateNode, deleteNode, deleteNodes } = useVault();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const [showTerminal, setShowTerminal] = useState(true);
  const [newNode, setNewNode] = useState({
    name: '',
    network: '',
    nodeId: '',
    publicAddress: '',
    notes: ''
  });

  const filteredNodes = useMemo(() => {
    return state.nodes.filter(
      (node) =>
        node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.network.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.nodeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.publicAddress.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [state.nodes, searchTerm]);

  const handleAddNode = () => {
    if (!newNode.name.trim() || !newNode.network.trim()) {
      showToast('Name and network are required', 'error');
      return;
    }

    try {
      addNode(newNode);
      setNewNode({ name: '', network: '', nodeId: '', publicAddress: '', notes: '' });
      setShowAddModal(false);
      showToast('Node added successfully', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to add node', 'error');
    }
  };

  const handleUpdateNode = (node: Node) => {
    try {
      updateNode(node.id, node);
      setEditingNode(null);
      showToast('Node updated successfully', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to update node', 'error');
    }
  };

  const handleDeleteSelected = () => {
    if (selectedNodes.length === 0) return;

    if (confirm(`Delete ${selectedNodes.length} selected nodes?`)) {
      try {
        deleteNodes(selectedNodes);
        setSelectedNodes([]);
        showToast(`${selectedNodes.length} nodes deleted`, 'success');
      } catch (err) {
        console.error(err);
        showToast('Failed to delete nodes', 'error');
      }
    }
  };

  const handleExportCSV = () => {
    try {
      exportToCSV(filteredNodes, 'nodes.csv', ['id']);
      showToast('Nodes exported to CSV', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to export CSV', 'error');
    }
  };

  const toggleNodeSelection = (nodeId: string) => {
    setSelectedNodes((prev) =>
      prev.includes(nodeId) ? prev.filter((id) => id !== nodeId) : [...prev, nodeId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedNodes(
      selectedNodes.length === filteredNodes.length ? [] : filteredNodes.map((node) => node.id)
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon="ri-search-line"
            className="w-64 bg-gray-800 border-gray-600 text-white"
          />
          {selectedNodes.length > 0 && (
            <Button onClick={handleDeleteSelected} variant="danger" size="sm">
              <i className="ri-delete-bin-line mr-2"></i>
              Delete ({selectedNodes.length})
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setShowTerminal(!showTerminal)}
            variant={showTerminal ? 'primary' : 'secondary'}
            size="sm"
          >
            <i className="ri-terminal-line mr-2"></i>
            Terminal
          </Button>
          <Button onClick={handleExportCSV} variant="secondary" size="sm">
            <i className="ri-download-line mr-2"></i>
            Export CSV
          </Button>
          <Button onClick={() => setShowAddModal(true)} size="sm">
            <i className="ri-add-line mr-2"></i>
            Add Node
          </Button>
        </div>
      </div>

      {/* Terminal Panel */}
      {showTerminal && (
        <div className="mb-6">
          <TerminalPanel />
        </div>
      )}

      {/* Nodes Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedNodes.length === filteredNodes.length && filteredNodes.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Network</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Node ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Public Address</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Notes</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredNodes.map((node) => (
                <tr key={node.id} className="hover:bg-gray-700">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedNodes.includes(node.id)}
                      onChange={() => toggleNodeSelection(node.id)}
                      className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    {editingNode?.id === node.id ? (
                      <Input
                        value={editingNode.name}
                        onChange={(e) =>
                          setEditingNode({ ...editingNode, name: e.target.value })
                        }
                        className="bg-gray-700 border-gray-600 text-white text-sm"
                      />
                    ) : (
                      <span className="text-white font-medium">{node.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingNode?.id === node.id ? (
                      <Input
                        value={editingNode.network}
                        onChange={(e) =>
                          setEditingNode({ ...editingNode, network: e.target.value })
                        }
                        className="bg-gray-700 border-gray-600 text-white text-sm"
                      />
                    ) : (
                      <span className="text-gray-300">{node.network}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingNode?.id === node.id ? (
                      <Input
                        value={editingNode.nodeId}
                        onChange={(e) =>
                          setEditingNode({ ...editingNode, nodeId: e.target.value })
                        }
                        className="bg-gray-700 border-gray-600 text-white text-sm"
                      />
                    ) : (
                      <span className="text-gray-300 font-mono text-sm">{node.nodeId}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingNode?.id === node.id ? (
                      <Input
                        value={editingNode.publicAddress}
                        onChange={(e) =>
                          setEditingNode({ ...editingNode, publicAddress: e.target.value })
                        }
                        className="bg-gray-700 border-gray-600 text-white text-sm"
                      />
                    ) : (
                      <span className="text-gray-300 font-mono text-sm">{node.publicAddress}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingNode?.id === node.id ? (
                      <Input
                        value={editingNode.notes}
                        onChange={(e) =>
                          setEditingNode({ ...editingNode, notes: e.target.value })
                        }
                        className="bg-gray-700 border-gray-600 text-white text-sm"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">{node.notes}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      {editingNode?.id === node.id ? (
                        <>
                          <button
                            onClick={() => handleUpdateNode(editingNode)}
                            className="text-green-400 hover:text-green-300"
                          >
                            <i className="ri-check-line"></i>
                          </button>
                          <button
                            onClick={() => setEditingNode(null)}
                            className="text-gray-400 hover:text-gray-300"
                          >
                            <i className="ri-close-line"></i>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingNode(node)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <i className="ri-edit-line"></i>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this node?')) {
                                deleteNode(node.id);
                                showToast('Node deleted', 'success');
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

        {filteredNodes.length === 0 && (
          <div className="text-center py-12">
            <i className="ri-server-line text-4xl text-gray-600 mb-4"></i>
            <p className="text-gray-400">No nodes found</p>
          </div>
        )}
      </div>

      {/* Add Node Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Node" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Name"
              value={newNode.name}
              onChange={(e) => setNewNode({ ...newNode, name: e.target.value })}
              placeholder="Node name"
            />
            <Input
              label="Network"
              value={newNode.network}
              onChange={(e) => setNewNode({ ...newNode, network: e.target.value })}
              placeholder="e.g., Ethereum, Bitcoin"
            />
          </div>
          <Input
            label="Node ID"
            value={newNode.nodeId}
            onChange={(e) => setNewNode({ ...newNode, nodeId: e.target.value })}
            placeholder="Node identifier"
          />
          <Input
            label="Public Address"
            value={newNode.publicAddress}
            onChange={(e) => setNewNode({ ...newNode, publicAddress: e.target.value })}
            placeholder="Public address"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={newNode.notes}
              onChange={(e) => setNewNode({ ...newNode, notes: e.target.value })}
              placeholder="Additional notes"
              rows={3}
              className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button onClick={() => setShowAddModal(false)} variant="secondary">
              Cancel
            </Button>
            <Button onClick={handleAddNode}>Add Node</Button>
          </div>
        </div>
      </Modal>

      {/* Integrated Terminal Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <i className="ri-terminal-box-line mr-2 text-blue-400"></i>
            Integrated Terminal
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <i className="ri-information-line"></i>
            <span>Ready for Electron migration</span>
          </div>
        </div>

        <TerminalPanel />

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-medium text-white mb-3 flex items-center">
            <i className="ri-rocket-line mr-2 text-green-400"></i>
            After Electron Migration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-blue-400">SSH Connections</h4>
              <ul className="space-y-1 text-gray-300">
                <li>• Connect to VPS servers directly</li>
                <li>• Real-time command execution</li>
                <li>• Persistent SSH sessions</li>
                <li>• Key-based authentication</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-purple-400">Docker Management</h4>
              <ul className="space-y-1 text-gray-300">
                <li>• List and manage containers</li>
                <li>• View real-time logs</li>
                <li>• Execute commands in containers</li>
                <li>• Monitor resource usage</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-yellow-400">Screen Sessions</h4>
              <ul className="space-y-1 text-gray-300">
                <li>• List active screen sessions</li>
                <li>• Attach/detach from sessions</li>
                <li>• Create new sessions</li>
                <li>• Session management</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-red-400">System Commands</h4>
              <ul className="space-y-1 text-gray-300">
                <li>• Full system command access</li>
                <li>• Real-time log monitoring</li>
                <li>• File system operations</li>
                <li>• Process management</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
