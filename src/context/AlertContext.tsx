import React, { createContext, useContext, useState, useCallback } from 'react';
import { AppAlertModal } from '../components/common/AppAlertModal';

export type AlertType = 'info' | 'error' | 'success' | 'warning';

export interface AlertConfig {
  title?: string;
  message: string;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm?: () => void | Promise<void>;
  onDismiss?: () => void;
}

interface AlertContextValue {
  showAlert: (config: Omit<AlertConfig, 'cancelText' | 'destructive'>) => void;
  showConfirm: (config: AlertConfig) => void;
}

const AlertContext = createContext<AlertContextValue | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);

  const showAlert = useCallback((config: Omit<AlertConfig, 'cancelText' | 'destructive'>) => {
    setAlertConfig({
      ...config,
      confirmText: config.confirmText || '확인',
    });
  }, []);

  const showConfirm = useCallback((config: AlertConfig) => {
    setAlertConfig(config);
  }, []);

  const handleClose = useCallback(async (confirmed: boolean) => {
    if (confirmed && alertConfig?.onConfirm) {
      await alertConfig.onConfirm();
    } else if (!confirmed && alertConfig?.onDismiss) {
      alertConfig.onDismiss();
    }
    setAlertConfig(null);
  }, [alertConfig]);

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {alertConfig && (
        <AppAlertModal config={alertConfig} onClose={handleClose} />
      )}
    </AlertContext.Provider>
  );
};

export const useAlert = (): AlertContextValue => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
};
