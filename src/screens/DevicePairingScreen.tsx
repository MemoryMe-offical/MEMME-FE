import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { RNCamera } from 'react-native-camera';
import { loadPrivateKey } from '../crypto/rsaKeyManager';
import { deriveKEKFromPassword, deriveKEKWithParams, KDFParams } from '../crypto/keyDerivation';
import CryptoJS from 'crypto-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PairingData {
  encryptedPrivateKey: string;
  kdfParams: KDFParams;
  timestamp: number;
}

const DevicePairingScreen = () => {
  const [mode, setMode] = useState<'generate' | 'scan'>('generate');
  const [pin, setPin] = useState('');
  const [qrData, setQrData] = useState('');
  const [scannedData, setScannedData] = useState('');
  const [inputPin, setInputPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);

  const addLog = (log: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${log}`, ...prev]);
  };

  // QR 코드 생성 (기존 기기)
  const handleGenerateQR = async () => {
    try {
      setLoading(true);
      addLog('🔐 QR 코드 생성 시작...');

      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        throw new Error('로그인이 필요합니다.');
      }

      const privateKey = await loadPrivateKey(userId);
      if (!privateKey) {
        throw new Error('개인키를 찾을 수 없습니다.');
      }
      addLog('✅ 개인키 로드 완료');

      const generatedPin = Math.floor(100000 + Math.random() * 900000).toString();
      setPin(generatedPin);
      addLog(`✅ PIN 생성: ${generatedPin}`);

      const { kek, salt, params } = deriveKEKFromPassword(generatedPin);
      addLog(`✅ KEK 생성 완료 (${params.iterations} 반복)`);

      const encrypted = CryptoJS.AES.encrypt(privateKey, kek);
      const encryptedPrivateKey = encrypted.toString();
      addLog('✅ 개인키 암호화 완료');

      const pairingData: PairingData = {
        encryptedPrivateKey,
        kdfParams: params,
        timestamp: Date.now(),
      };

      const qrString = JSON.stringify(pairingData);
      setQrData(qrString);

      addLog('✅ QR 코드 생성 완료');
      addLog(`  데이터 크기: ${qrString.length} bytes`);

      Alert.alert(
        '✅ QR 코드 생성 완료',
        `PIN: ${generatedPin}\n\n새 기기에서 이 QR 코드를 스캔하고 PIN을 입력하세요.`,
        [{ text: '확인' }]
      );
    } catch (error: any) {
      addLog(`❌ QR 생성 실패: ${error.message}`);
      Alert.alert('실패', error.message);
    } finally {
      setLoading(false);
    }
  };

  // QR 코드 스캔
  const handleQRScan = (e: any) => {
    try {
      const data = e.data;
      addLog('📷 QR 코드 스캔 완료');
      setScannedData(data);
      setShowCamera(false);
      Alert.alert('스캔 완료', 'QR 데이터를 가져왔습니다.\nPIN을 입력하세요.');
    } catch (error: any) {
      addLog(`❌ QR 스캔 실패: ${error.message}`);
      Alert.alert('스캔 실패', error.message);
    }
  };

  // QR 코드 스캔 후 복호화 (새 기기)
  const handleRestoreFromQR = async () => {
    if (!scannedData || !inputPin) {
      Alert.alert('알림', 'QR 데이터와 PIN을 모두 입력하세요.');
      return;
    }

    try {
      setLoading(true);
      addLog('🔓 개인키 복구 시작...');

      const pairingData: PairingData = JSON.parse(scannedData);
      addLog('✅ QR 데이터 파싱 완료');
      addLog(`  생성 시간: ${new Date(pairingData.timestamp).toLocaleString()}`);
      addLog(`  KDF 반복: ${pairingData.kdfParams.iterations}`);

      const kek = deriveKEKWithParams(inputPin, pairingData.kdfParams);
      addLog('✅ KEK 재생성 완료');

      const decrypted = CryptoJS.AES.decrypt(
        pairingData.encryptedPrivateKey,
        kek
      );
      const privateKey = decrypted.toString(CryptoJS.enc.Utf8);

      if (!privateKey) {
        throw new Error('PIN이 올바르지 않습니다.');
      }
      addLog('✅ 개인키 복호화 완료');

      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        throw new Error('로그인이 필요합니다.');
      }

      const { savePrivateKey } = require('../crypto/rsaKeyManager');
      await savePrivateKey(userId, privateKey);
      addLog('✅ 개인키 저장 완료');

      Alert.alert(
        '🎉 성공!',
        '개인키가 이 기기에 복구되었습니다.\n이제 암호화된 메시지를 볼 수 있습니다.',
        [{ text: '확인' }]
      );
    } catch (error: any) {
      addLog(`❌ 복구 실패: ${error.message}`);
      Alert.alert('실패', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles['pairing-container']}>
      {loading && (
        <View style={styles['pairing-loadingOverlay']}>
          <ActivityIndicator size="large" color="#588DFF" />
          <Text style={styles['pairing-loadingOverlay-text']}>처리 중...</Text>
        </View>
      )}

      <View style={styles['pairing-header']}>
        <Text style={styles['pairing-header-title']}>📱 기기 페어링</Text>
        <Text style={styles['pairing-header-subtitle']}>QR 코드로 빠른 기기 추가</Text>
      </View>

      <View style={styles['pairing-section']}>
        <Text style={styles['pairing-section-title']}>모드 선택</Text>
        <View style={styles['pairing-modeButtons']}>
          <TouchableOpacity
            style={[
              styles['pairing-modeButtons-button'],
              mode === 'generate' && styles['pairing-modeButtons-button--active'],
            ]}
            onPress={() => setMode('generate')}>
            <Text
              style={[
                styles['pairing-modeButtons-button-text'],
                mode === 'generate' && styles['pairing-modeButtons-button-text--active'],
              ]}>
              📤 QR 생성 (기존 기기)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles['pairing-modeButtons-button'],
              mode === 'scan' && styles['pairing-modeButtons-button--active'],
            ]}
            onPress={() => setMode('scan')}>
            <Text
              style={[
                styles['pairing-modeButtons-button-text'],
                mode === 'scan' && styles['pairing-modeButtons-button-text--active'],
              ]}>
              📥 QR 스캔 (새 기기)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {mode === 'generate' && (
        <>
          <View style={styles['pairing-section']}>
            <Text style={styles['pairing-section-title']}>1️⃣ QR 코드 생성</Text>
            <Text style={styles['pairing-section-description']}>
              현재 기기의 개인키를 QR 코드로 변환합니다.
            </Text>
            <TouchableOpacity
              style={styles['pairing-button']}
              onPress={handleGenerateQR}
              disabled={loading}>
              <Text style={styles['pairing-button-text']}>🔐 QR 코드 생성</Text>
            </TouchableOpacity>
          </View>

          {qrData && (
            <View style={styles['pairing-section']}>
              <Text style={styles['pairing-section-title']}>2️⃣ QR 코드</Text>
              <View style={styles['pairing-qrContainer']}>
                <QRCode value={qrData} size={250} />
              </View>
              {pin && (
                <View style={styles['pairing-pinBox']}>
                  <Text style={styles['pairing-pinBox-label']}>PIN 코드:</Text>
                  <Text style={styles['pairing-pinBox-pin']}>{pin}</Text>
                  <Text style={styles['pairing-pinBox-description']}>
                    ⚠️ 이 PIN은 다시 볼 수 없습니다.{'\n'}
                    새 기기에서 QR 스캔 후 입력하세요.
                  </Text>
                </View>
              )}
            </View>
          )}
        </>
      )}

      {mode === 'scan' && (
        <>
          <View style={styles['pairing-section']}>
            <Text style={styles['pairing-section-title']}>1️⃣ QR 코드 스캔</Text>
            <Text style={styles['pairing-section-description']}>
              카메라로 QR 코드를 스캔하세요.
            </Text>
            
            {!showCamera && !scannedData && (
              <TouchableOpacity
                style={styles['pairing-button']}
                onPress={() => setShowCamera(true)}
                disabled={loading}>
                <Text style={styles['pairing-button-text']}>📷 카메라 열기</Text>
              </TouchableOpacity>
            )}

            {showCamera && (
              <View style={styles['pairing-cameraContainer']}>
                <RNCamera
                  style={styles['pairing-cameraContainer-camera']}
                  onBarCodeRead={handleQRScan}
                  captureAudio={false}
                />
                <TouchableOpacity
                  style={[styles['pairing-button'], styles['pairing-button--danger']]}
                  onPress={() => setShowCamera(false)}>
                  <Text style={styles['pairing-button-text']}>❌ 카메라 닫기</Text>
                </TouchableOpacity>
              </View>
            )}

            {scannedData && (
              <View style={styles['pairing-scanResult']}>
                <Text style={styles['pairing-scanResult-label']}>✅ 스캔 완료</Text>
                <Text style={styles['pairing-scanResult-data']} numberOfLines={3}>
                  {scannedData.substring(0, 100)}...
                </Text>
                <TouchableOpacity
                  style={[styles['pairing-button'], styles['pairing-button--secondary']]}
                  onPress={() => {
                    setScannedData('');
                    setShowCamera(true);
                  }}>
                  <Text style={styles['pairing-button-text']}>🔄 다시 스캔</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles['pairing-divider']}>
              <View style={styles['pairing-divider-line']} />
              <Text style={styles['pairing-divider-text']}>또는</Text>
              <View style={styles['pairing-divider-line']} />
            </View>

            <TextInput
              style={[styles['pairing-input'], styles['pairing-input--multiline']]}
              value={scannedData}
              onChangeText={setScannedData}
              placeholder="QR 데이터를 직접 붙여넣기"
              multiline
              editable={!loading}
            />
          </View>

          <View style={styles['pairing-section']}>
            <Text style={styles['pairing-section-title']}>2️⃣ PIN 입력</Text>
            <TextInput
              style={styles['pairing-input']}
              value={inputPin}
              onChangeText={setInputPin}
              placeholder="6자리 PIN 입력"
              keyboardType="number-pad"
              maxLength={6}
              editable={!loading}
            />
          </View>

          <View style={styles['pairing-section']}>
            <Text style={styles['pairing-section-title']}>3️⃣ 개인키 복구</Text>
            <TouchableOpacity
              style={[styles['pairing-button'], styles['pairing-button--success']]}
              onPress={handleRestoreFromQR}
              disabled={loading}>
              <Text style={styles['pairing-button-text']}>🔓 개인키 복구</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <View style={styles['pairing-section']}>
        <Text style={styles['pairing-section-title']}>📖 사용 가이드</Text>
        <View style={styles['pairing-guideBox']}>
          <Text style={styles['pairing-guideBox-title']}>기존 기기 (iPhone):</Text>
          <Text style={styles['pairing-guideBox-text']}>
            1. "QR 생성" 모드 선택{'\n'}
            2. "QR 코드 생성" 버튼 클릭{'\n'}
            3. 생성된 PIN 메모{'\n'}
            4. QR 코드를 새 기기에 보여주기
          </Text>

          <Text style={[styles['pairing-guideBox-title'], { marginTop: 15 }]}>
            새 기기 (iPad):
          </Text>
          <Text style={styles['pairing-guideBox-text']}>
            1. "QR 스캔" 모드 선택{'\n'}
            2. 카메라로 QR 코드 스캔{'\n'}
            3. PIN 6자리 입력{'\n'}
            4. "개인키 복구" 버튼 클릭{'\n'}
            5. ✅ 완료! 이제 메시지 볼 수 있음
          </Text>
        </View>
      </View>

      <View style={styles['pairing-section']}>
        <View style={styles['pairing-logHeader']}>
          <Text style={styles['pairing-section-title']}>📝 로그</Text>
          <TouchableOpacity onPress={() => setLogs([])}>
            <Text style={styles['pairing-logHeader-clearButton']}>지우기</Text>
          </TouchableOpacity>
        </View>
        <View style={styles['pairing-logBox']}>
          {logs.map((log, index) => (
            <Text key={index} style={styles['pairing-logBox-text']}>
              {log}
            </Text>
          ))}
          {logs.length === 0 && (
            <Text style={styles['pairing-logBox-empty']}>로그가 없습니다.</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  'pairing-container': {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  'pairing-loadingOverlay': {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  'pairing-loadingOverlay-text': {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  'pairing-header': {
    backgroundColor: '#588DFF',
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  'pairing-header-title': {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  'pairing-header-subtitle': {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  'pairing-section': {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
  },
  'pairing-section-title': {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  'pairing-section-description': {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
    lineHeight: 18,
  },
  'pairing-modeButtons': {
    flexDirection: 'row',
    gap: 8,
  },
  'pairing-modeButtons-button': {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  'pairing-modeButtons-button--active': {
    borderColor: '#588DFF',
    backgroundColor: '#e7f3ff',
  },
  'pairing-modeButtons-button-text': {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  'pairing-modeButtons-button-text--active': {
    color: '#588DFF',
  },
  'pairing-button': {
    backgroundColor: '#588DFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  'pairing-button--success': {
    backgroundColor: '#28a745',
  },
  'pairing-button--danger': {
    backgroundColor: '#dc3545',
    marginTop: 10,
  },
  'pairing-button--secondary': {
    backgroundColor: '#6c757d',
    marginTop: 10,
  },
  'pairing-button-text': {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  'pairing-qrContainer': {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  'pairing-pinBox': {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ffc107',
  },
  'pairing-pinBox-label': {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 5,
  },
  'pairing-pinBox-pin': {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#856404',
    textAlign: 'center',
    letterSpacing: 8,
    fontFamily: 'monospace',
  },
  'pairing-pinBox-description': {
    fontSize: 12,
    color: '#856404',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 18,
  },
  'pairing-cameraContainer': {
    marginTop: 10,
  },
  'pairing-cameraContainer-camera': {
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
  },
  'pairing-scanResult': {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#d4edda',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c3e6cb',
  },
  'pairing-scanResult-label': {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#155724',
    marginBottom: 8,
  },
  'pairing-scanResult-data': {
    fontSize: 11,
    color: '#155724',
    fontFamily: 'monospace',
  },
  'pairing-divider': {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  'pairing-divider-line': {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  'pairing-divider-text': {
    marginHorizontal: 10,
    fontSize: 12,
    color: '#999',
  },
  'pairing-input': {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  'pairing-input--multiline': {
    height: 100,
    textAlignVertical: 'top',
    fontFamily: 'monospace',
    fontSize: 11,
  },
  'pairing-guideBox': {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  'pairing-guideBox-title': {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  'pairing-guideBox-text': {
    fontSize: 13,
    color: '#666',
    lineHeight: 22,
  },
  'pairing-logHeader': {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  'pairing-logHeader-clearButton': {
    color: '#dc3545',
    fontSize: 14,
  },
  'pairing-logBox': {
    backgroundColor: '#1e1e1e',
    padding: 10,
    borderRadius: 8,
    maxHeight: 200,
  },
  'pairing-logBox-text': {
    color: '#00ff00',
    fontSize: 10,
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  'pairing-logBox-empty': {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
    padding: 20,
  },
});

export default DevicePairingScreen;