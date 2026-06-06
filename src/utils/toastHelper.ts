import { Platform, ToastAndroid } from 'react-native';

export interface ShowToastParams {
  message: string;
  onAlert?: (message: string) => void;
}

export const showToastNotification = ({ message, onAlert }: ShowToastParams) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else if (onAlert) {
    onAlert(message);
  }
};
