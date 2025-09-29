
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useVault } from '../../contexts/VaultContext';
import Button from '../../components/base/Button';
import Input from '../../components/base/Input';
import NodesTab from './components/NodesTab';
import WalletsTab from './components/WalletsTab';
import AirdropsTab from './components/AirdropsTab';
import SettingsTab from './components/SettingsTab';

export default function HomePage() {
  const { t } = useTranslation();
  const { state, unlock, lock, saveData } = useVault();
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('nodes');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Apply theme on mount and when it changes
  useEffect(() => {
    if (state.preferences.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.preferences.theme]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsUnlocking(true);
    const success = await unlock(password);
    if (success) {
      setPassword('');
    }
    setIsUnlocking(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await saveData();
    setIsSaving(false);
  };

  if (state.isLocked) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{t('appName')}</h1>
            <p className="text-gray-400">{t('appSubtitle')}</p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-6">
            <Input
              label={t('masterPassword')}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={t('enterPassword')}
              autoFocus
            />

            <Button
              type="submit"
              loading={isUnlocking}
              className="w-full"
              disabled={!password.trim()}
            >
              <i className="ri-lock-unlock-line mr-2"></i>
              {t('unlock')}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'nodes', label: t('nodes'), icon: 'ri-server-line' },
    { id: 'wallets', label: t('wallets'), icon: 'ri-wallet-line' },
    { id: 'airdrops', label: t('airdrops'), icon: 'ri-gift-line' },
    { id: 'settings', label: t('settings'), icon: 'ri-settings-line' }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-white">{t('appName')}</h1>
            
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleSave}
                loading={isSaving}
                variant="secondary"
                size="sm"
              >
                <i className="ri-save-line mr-2"></i>
                {t('save')}
              </Button>
              
              <Button
                onClick={lock}
                variant="secondary"
                size="sm"
              >
                <i className="ri-lock-line mr-2"></i>
                {t('lock')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <i className={`${tab.icon} mr-2`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'nodes' && <NodesTab />}
        {activeTab === 'wallets' && <WalletsTab />}
        {activeTab === 'airdrops' && <AirdropsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>
    </div>
  );
}
