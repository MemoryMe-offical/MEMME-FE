import React, { useRef, useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { appAlertModalStyles as styles } from '../../styles/AppAlertModal.styles';
import type { AlertConfig } from '../../context/AlertContext';

interface AppAlertModalProps {
  config: AlertConfig;
  onClose: (confirmed: boolean) => void | Promise<void>;
}

export const AppAlertModal: React.FC<AppAlertModalProps> = ({ config, onClose }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const mountedRef = useRef(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [config, fadeAnim]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleConfirm = async () => {
    if (submitting) {
      return;
    }

    if (config.onConfirm) {
      setSubmitting(true);
      try {
        await onClose(true);
      } finally {
        if (mountedRef.current) {
          setSubmitting(false);
        }
      }
      return;
    }

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start(() => onClose(true));
  };

  const handleCancel = () => {
    if (submitting) {
      return;
    }

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start(() => onClose(false));
  };

  const isConfirmDialog = config.cancelText !== undefined;
  const confirmButtonColor = config.destructive || config.type === 'error' ? '#FF3B30' : '#588DFF';

  return (
    <Modal
      visible
      transparent
      animationType="none"
      onRequestClose={handleCancel}
    >
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={handleCancel}
        />
        <Animated.View
          style={[
            styles.card,
            {
              transform: [
                {
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                },
              ],
            },
          ]}
        >
          {config.title && (
            <Text style={styles.title} numberOfLines={2}>
              {config.title}
            </Text>
          )}
          <Text style={styles.message} numberOfLines={6}>
            {config.message}
          </Text>

          <View
            style={isConfirmDialog ? styles.buttonRowContainer : styles.singleButtonContainer}
          >
            {isConfirmDialog && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                activeOpacity={0.7}
                onPress={handleCancel}
                disabled={submitting}
              >
                <Text style={styles.cancelButtonText}>{config.cancelText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.button,
                isConfirmDialog ? styles.confirmButton : styles.singleButton,
                { backgroundColor: confirmButtonColor },
              ]}
              activeOpacity={0.7}
              onPress={handleConfirm}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmButtonText}>
                  {config.confirmText || '확인'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};
