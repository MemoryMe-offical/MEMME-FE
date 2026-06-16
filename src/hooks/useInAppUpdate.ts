import { useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import SpInAppUpdates, {
  IAUUpdateKind,
  StartUpdateOptions,
  StatusUpdateEvent,
  IAUInstallStatus,
} from 'sp-react-native-in-app-updates';

const inAppUpdates = new SpInAppUpdates(false);

const useInAppUpdate = () => {
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const checkUpdate = async () => {
      try {
        const result = await inAppUpdates.checkNeedsUpdate();
        if (!result.shouldUpdate) return;

        const updateOptions: StartUpdateOptions = {
          updateType: IAUUpdateKind.FLEXIBLE,
        };

        inAppUpdates.addStatusUpdateListener(onStatusUpdate);
        await inAppUpdates.startUpdate(updateOptions);
      } catch (_) {
        // 업데이트 확인 실패 시 조용히 무시 (네트워크 오류 등)
      }
    };

    const onStatusUpdate = (event: StatusUpdateEvent) => {
      if (event.status === IAUInstallStatus.DOWNLOADED) {
        Alert.alert(
          '업데이트 준비 완료',
          '새 버전이 다운로드되었습니다. 지금 적용하시겠어요?',
          [
            { text: '나중에', style: 'cancel' },
            {
              text: '지금 재시작',
              onPress: () => inAppUpdates.installUpdate(),
            },
          ],
        );
      }
    };

    checkUpdate();

    return () => {
      inAppUpdates.removeStatusUpdateListener(onStatusUpdate);
    };
  }, []);
};

export default useInAppUpdate;
