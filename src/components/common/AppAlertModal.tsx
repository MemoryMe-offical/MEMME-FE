import React, { useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { appAlertModalStyles as styles } from '../../styles/AppAlertModal.styles';
import type { AlertConfig } from '../../context/AlertContext';

interface AppAlertModalProps {
  config: AlertConfig;
  onClose: (confirmed: boolean) => void;
}

export const AppAlertModal: React.FC<AppAlertModalProps> = ({ config, onClose }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [config, fadeAnim]);

  const handleConfirm = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start(() => onClose(true));
  };

  const handleCancel = () => {
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
            >
              <Text style={styles.confirmButtonText}>
                {config.confirmText || '확인'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};
