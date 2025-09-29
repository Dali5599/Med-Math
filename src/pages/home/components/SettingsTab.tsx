
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useVault } from '../../../contexts/VaultContext';
import { useToast } from '../../../hooks/useToast';
import { exportEncryptedVault, importFile } from '../../../utils/export';
import Button from '../../../components/base/Button';
import Input from '../../../components/base/Input';
import Modal from '../../../components/base/Modal';

export default function SettingsTab() {
  const { t } = useTranslation();
  const { state, updatePreferences, exportData, importData } = useVault();
  const { showToast } = useToast();
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [importPassword, setImportPassword] = useState('');
  const [importDataState, setImportData] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLanguageChange = (language: 'en' | 'fr' | 'ar') => {
    updatePreferences({ language });
    showToast(t('languageUpdated'), 'success');
  };

  const handleThemeChange = (theme: 'dark' | 'light') => {
    updatePreferences({ theme });
    showToast(t('themeUpdated'), 'success');

    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleAutoLockChange = (minutes: number) => {
    updatePreferences({ autoLockMinutes: minutes });
    showToast(t('autoLockUpdated'), 'success');
  };

  const handleExport = async () => {
    try {
      setIsLoading(true);
      const encryptedData = await exportData();
      exportEncryptedVault(encryptedData);
      showToast(t('vaultExported'), 'success');
    } catch (error: any) {
      const msg = error?.message ?? t('failedToExport');
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!importDataState.trim() || !importPassword.trim()) {
      showToast(t('provideDataAndPassword'), 'error');
      return;
    }

    try {
      setIsLoading(true);
      const success = await importData(importDataState, importPassword);
      if (success) {
        setShowImportModal(false);
        setImportData('');
        setImportPassword('');
        showToast(t('vaultImported'), 'success');
      } else {
        showToast(t('importFailed'), 'error');
      }
    } catch (error: any) {
      const msg = error?.message ?? t('failedToImport');
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportFile = async () => {
    try {
      const fileContent = await importFile();
      setImportData(fileContent);
      showToast(t('fileLoaded'), 'success');
    } catch (error: any) {
      const msg = error?.message ?? t('failedToLoadFile');
      showToast(msg, 'error');
    }
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast(t('passwordFieldsRequired'), 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast(t('passwordsDoNotMatch'), 'error');
      return;
    }

    if (newPassword.length < 8) {
      showToast(t('passwordTooShort'), 'error');
      return;
    }

    showToast(t('passwordChangeInfo'), 'info');
    setShowChangePasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* General Settings */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-6">{t('generalSettings')}</h2>

        <div className="space-y-6">
          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">{t('language')}</label>
            <div className="flex space-x-4">
              <button
                onClick={() => handleLanguageChange('en')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  state.preferences.language === 'en'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                English
              </button>
              <button
                onClick={() => handleLanguageChange('fr')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  state.preferences.language === 'fr'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Français
              </button>
              <button
                onClick={() => handleLanguageChange('ar')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  state.preferences.language === 'ar'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                العربية
              </button>
            </div>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">{t('theme')}</label>
            <div className="flex space-x-4">
              <button
                onClick={() => handleThemeChange('dark')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  state.preferences.theme === 'dark'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <i className="ri-moon-line mr-2"></i>
                {t('dark')}
              </button>
              <button
                onClick={() => handleThemeChange('light')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  state.preferences.theme === 'light'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <i className="ri-sun-line mr-2"></i>
                {t('light')}
              </button>
            </div>
          </div>

          {/* Auto-lock */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              {t('autoLock')}
            </label>
            <div className="flex space-x-2">
              {[5, 15, 30, 60].map(minutes => (
                <button
                  key={minutes}
                  onClick={() => handleAutoLockChange(minutes)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    state.preferences.autoLockMinutes === minutes
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {minutes}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-6">{t('security')}</h2>

        <div className="space-y-4">
          <Button
            onClick={() => setShowChangePasswordModal(true)}
            variant="secondary"
            className="w-full sm:w-auto"
          >
            <i className="ri-lock-password-line mr-2"></i>
            {t('changeMasterPassword')}
          </Button>

          <div className="text-sm text-gray-400">
            <p>• {t('securityNote1')}</p>
            <p>• {t('securityNote2')}</p>
            <p>• {t('securityNote3')}</p>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-6">{t('dataManagement')}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button
            onClick={handleExport}
            loading={isLoading}
            variant="secondary"
            className="w-full"
          >
            <i className="ri-download-line mr-2"></i>
            {t('exportVault')}
          </Button>

          <Button
            onClick={() => setShowImportModal(true)}
            variant="secondary"
            className="w-full"
          >
            <i className="ri-upload-line mr-2"></i>
            {t('importVault')}
          </Button>
        </div>

        <div className="mt-4 text-sm text-gray-400">
          <p>• {t('exportNote1')}</p>
          <p>• {t('exportNote2')}</p>
          <p>• {t('exportNote3')}</p>
        </div>
      </div>

      {/* Vault Statistics */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-6">{t('vaultStatistics')}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{state.nodes.length}</div>
            <div className="text-sm text-gray-400">{t('nodes')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{state.wallets.length}</div>
            <div className="text-sm text-gray-400">{t('wallets')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{state.airdrops.length}</div>
            <div className="text-sm text-gray-400">{t('airdrops')}</div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        title={t('changeMasterPassword')}
      >
        <div className="space-y-4">
          <Input
            label={t('currentPassword')}
            type="password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            placeholder={t('enterCurrentPassword')}
          />
          <Input
            label={t('newPassword')}
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder={t('enterNewPassword')}
          />
          <Input
            label={t('confirmPassword')}
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder={t('confirmNewPassword')}
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              onClick={() => setShowChangePasswordModal(false)}
              variant="secondary"
            >
              {t('cancel')}
            </Button>
            <Button onClick={handleChangePassword}>
              {t('changeMasterPassword')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title={t('importVault')}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('import')}
            </label>
            <div className="flex space-x-2 mb-2">
              <Button
                onClick={handleImportFile}
                variant="secondary"
                size="sm"
              >
                <i className="ri-file-line mr-2"></i>
                {t('chooseFile')}
              </Button>
            </div>
            <textarea
              value={importDataState}
              onChange={e => setImportData(e.target.value)}
              placeholder={t('pasteEncryptedData')}
              rows={6}
              className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
            />
          </div>
          <Input
            label={t('masterPassword')}
            type="password"
            value={importPassword}
            onChange={e => setImportPassword(e.target.value)}
            placeholder={t('enterImportPassword')}
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              onClick={() => setShowImportModal(false)}
              variant="secondary"
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleImport}
              loading={isLoading}
            >
              {t('importVault')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
