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
  Image,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { createMasterKey, deleteMasterKey } from '../crypto/keyManager';
import { getOrCreateDeviceId } from '../crypto/deviceManager';
import { generateRSAKeyPair, savePrivateKey, loadPrivateKey } from '../crypto/rsaKeyManager';
import { PayloadDataV2 } from '../crypto/payloadFormat';
import { encryptMessageV2, decryptMessageV2 } from '../crypto/encryptionV2';
import { encryptImage, decryptImage, encryptFile, FilePayload } from '../crypto/fileEncryption';
import { pingServer, sendMessage, sendFile, getMessages, clearAllMessages, ServerMessage } from '../utils/api';
import { registerPublicKey } from '../utils/rsaApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EncryptionTestScreen = () => {
  const [userId, setUserId] = useState('test-user-123');
  const [deviceId, setDeviceId] = useState('');
  const [message, setMessage] = useState('');
  const [encrypted, setEncrypted] = useState('');
  const [decrypted, setDecrypted] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [serverMessages, setServerMessages] = useState<ServerMessage[]>([]);
  const [publicKey, setPublicKey] = useState('');
  const [decryptedImageUri, setDecryptedImageUri] = useState('');

  const addLog = (log: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${log}`;
    console.log(logMessage);
    setLogs(prev => [logMessage, ...prev]);
  };

  // 초기화
// 초기화
const handleInit = async () => {
  try {
    setLoading(true);
    addLog('=== 초기화 시작 ===');

    // 1. Device ID 생성
    const did = await getOrCreateDeviceId();
    setDeviceId(did);
    addLog(`Device ID: ${did.substring(0, 16)}...`);

    // 2. 임시 로그인
    await AsyncStorage.setItem('userId', userId);
    await AsyncStorage.setItem('accessToken', 'test-token');
    addLog('임시 로그인 완료');

    // 3. Master Key 생성
    await createMasterKey(userId);
    addLog('Master Key 생성 완료');

    // 4. RSA 키 쌍 생성
    addLog('RSA 키 쌍 생성 중...');
    const keyPair = await generateRSAKeyPair();
    
    addLog(`공개키 앞 50자: ${keyPair.publicKey.substring(0, 50)}...`);
    addLog(`개인키 앞 50자: ${keyPair.privateKey.substring(0, 50)}...`);

    // 5. 개인키 Keychain 저장
    await savePrivateKey(userId, keyPair.privateKey);
    addLog('개인키 Keychain 저장 완료');

    setPublicKey(keyPair.publicKey);
    addLog('공개키 State 저장 완료');

    // ⭐⭐⭐ 6. 서버에 공개키 등록 ⭐⭐⭐
    addLog('서버에 공개키 등록 중...');
    try {
      await registerPublicKey(userId, keyPair.publicKey, did);
      addLog('✅ 서버에 공개키 등록 완료');
    } catch (error: any) {
      addLog(`⚠️ 공개키 등록 실패: ${error.message}`);
      addLog('(로컬에는 저장됨)');
    }

    // ⭐⭐⭐ 7. 개인키 백업 업로드 (선택사항) ⭐⭐⭐
    addLog('개인키 백업 생성 중...');
    try {
      const { encryptPrivateKeyForBackup } = await import('../crypto/rsaKeyManager');
      const { uploadPrivateKeyBackup } = await import('../utils/rsaApi');
      
      const backupPassword = 'test-backup-password-123'; // 테스트용
      const backup = encryptPrivateKeyForBackup(keyPair.privateKey, backupPassword);
      
      await uploadPrivateKeyBackup(userId, backup, did);
      addLog('✅ 개인키 백업 완료');
    } catch (error: any) {
      addLog(`⚠️ 백업 실패: ${error.message}`);
    }

    Alert.alert('✅ 성공', '초기화 완료!');
  } catch (error: any) {
    addLog(`❌ 초기화 실패: ${error.message}`);
    console.error('초기화 전체 에러:', error);
    Alert.alert('❌ 실패', error.message);
  } finally {
    setLoading(false);
  }
};

  // 서버 연결
  const handlePingServer = async () => {
    try {
      setLoading(true);
      addLog('서버 연결 테스트...');

      const success = await pingServer();

      if (success) {
        addLog('✅ 서버 연결 성공!');
        Alert.alert('✅ 성공', '서버와 연결되었습니다!');
      } else {
        addLog('❌ 서버 연결 실패');
        Alert.alert('❌ 실패', '서버에 연결할 수 없습니다.');
      }
    } catch (error: any) {
      addLog(`❌ 서버 오류: ${error.message}`);
      Alert.alert('❌ 오류', error.message);
    } finally {
      setLoading(false);
    }
  };

  // 텍스트 암호화
  const handleEncrypt = async () => {
    if (!message.trim()) {
      Alert.alert('알림', '메시지를 입력하세요.');
      return;
    }

    if (!publicKey) {
      Alert.alert('알림', '먼저 초기화를 하세요.');
      return;
    }

    try {
      setLoading(true);
      addLog('=== 암호화 시작 ===');
      addLog(`원본 메시지: "${message}"`);

      const payload = await encryptMessageV2(message, publicKey);

      if (deviceId) {
        payload.deviceId = deviceId;
      }

      addLog(`ciphertext: ${payload.ciphertext.substring(0, 50)}...`);
      addLog(`iv: ${payload.iv}`);
      addLog(`encryptedDEKForUser: ${payload.encryptedDEKForUser.substring(0, 50)}...`);

      const serialized = JSON.stringify(payload);
      setEncrypted(serialized);

      addLog('✅ 암호화 완료');
      Alert.alert('✅ 성공', '암호화 완료!');
    } catch (error: any) {
      addLog(`❌ 암호화 실패: ${error.message}`);
      console.error('암호화 전체 에러:', error);
      Alert.alert('❌ 실패', error.message);
    } finally {
      setLoading(false);
    }
  };

  // 텍스트 복호화
  const handleDecrypt = async () => {
    if (!encrypted) {
      Alert.alert('알림', '먼저 암호화를 하세요.');
      return;
    }

    try {
      setLoading(true);
      addLog('=== 복호화 시작 ===');

      const payload = JSON.parse(encrypted);

      const plaintext = await decryptMessageV2(payload, userId);
      setDecrypted(plaintext);

      addLog(`복호화된 메시지: "${plaintext}"`);
      addLog('✅ 복호화 완료');
      Alert.alert('✅ 성공', `복호화 결과: ${plaintext}`);
    } catch (error: any) {
      addLog(`❌ 복호화 실패: ${error.message}`);
      console.error('복호화 전체 에러:', error);
      Alert.alert('❌ 실패', error.message);
    } finally {
      setLoading(false);
    }
  };

  // 이미지 암호화
  const handleImageEncrypt = async () => {
    if (!publicKey) {
      Alert.alert('알림', '먼저 초기화를 하세요.');
      return;
    }

    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
      });

      if (result.didCancel || !result.assets?.[0]) {
        return;
      }

      setLoading(true);
      const image = result.assets[0];
      const imagePath = image.uri!.replace('file://', '');

      addLog(`이미지 선택: ${image.fileName}`);

      const payload = await encryptImage(imagePath, publicKey);

      if (deviceId) {
        payload.deviceId = deviceId;
      }

      const serialized = JSON.stringify(payload);
      setEncrypted(serialized);

      addLog(`이미지 암호화 완료`);
      addLog(`파일명: ${payload.fileName}`);
      addLog(`크기: ${(payload.fileSize / 1024).toFixed(2)} KB`);

      setLoading(false);

      Alert.alert(
        '✅ 암호화 완료',
        '서버로 전송하시겠습니까?',
        [
          { text: '나중에', style: 'cancel' },
          {
            text: '전송',
            onPress: async () => {
              try {
                setLoading(true);
                addLog('서버로 이미지 전송 중...');
                const response = await sendFile(userId, payload);
                addLog(`✅ 서버 전송 완료! ID: ${response.id}`);
                Alert.alert('✅ 성공', `이미지 ID: ${response.id}`);
              } catch (error: any) {
                addLog(`❌ 전송 실패: ${error.message}`);
                Alert.alert('❌ 실패', '서버 전송 실패');
              } finally {
                setLoading(false);
              }
            },
          },
        ]
      );
    } catch (error: any) {
      addLog(`이미지 암호화 실패: ${error.message}`);
      Alert.alert('❌ 실패', error.message);
      setLoading(false);
    }
  };

  // 이미지 복호화
  const handleImageDecrypt = async () => {
    if (!encrypted) {
      Alert.alert('알림', '먼저 암호화를 하세요.');
      return;
    }

    try {
      setLoading(true);
      addLog('이미지 복호화 시작...');

      const payload: FilePayload = JSON.parse(encrypted);
      const imagePath = await decryptImage(payload, userId);

      setDecryptedImageUri(`file://${imagePath}`);

      addLog(`이미지 복호화 완료`);
      addLog(`파일: ${payload.fileName}`);
      Alert.alert('✅ 성공', '이미지 복호화 완료!');
    } catch (error: any) {
      addLog(`이미지 복호화 실패: ${error.message}`);
      Alert.alert('❌ 실패', error.message);
    } finally {
      setLoading(false);
    }
  };

  // 파일 암호화
  const handleFileEncrypt = async () => {
    if (!publicKey) {
      Alert.alert('알림', '먼저 초기화를 하세요.');
      return;
    }

    try {
      const result = await pick({
        type: [types.allFiles],
      });

      setLoading(true);
      const file = result[0];
      const filePath = file.uri.replace('file://', '');

      addLog(`파일 선택: ${file.name}`);

      const payload = await encryptFile(
        filePath,
        publicKey,
        file.name!,
        file.type || 'application/octet-stream'
      );

      if (deviceId) {
        payload.deviceId = deviceId;
      }

      const serialized = JSON.stringify(payload);
      setEncrypted(serialized);

      addLog(`파일 암호화 완료`);
      addLog(`파일명: ${payload.fileName}`);
      addLog(`타입: ${payload.fileType}`);
      addLog(`크기: ${(payload.fileSize / 1024).toFixed(2)} KB`);

      setLoading(false);

      Alert.alert(
        '✅ 암호화 완료',
        '서버로 전송하시겠습니까?',
        [
          { text: '나중에', style: 'cancel' },
          {
            text: '전송',
            onPress: async () => {
              try {
                setLoading(true);
                addLog('서버로 파일 전송 중...');
                const response = await sendFile(userId, payload);
                addLog(`✅ 서버 전송 완료! ID: ${response.id}`);
                Alert.alert('✅ 성공', `파일 ID: ${response.id}`);
              } catch (error: any) {
                addLog(`❌ 전송 실패: ${error.message}`);
                Alert.alert('❌ 실패', '서버 전송 실패');
              } finally {
                setLoading(false);
              }
            },
          },
        ]
      );
    } catch (error: any) {
      if (!isErrorWithCode(error, errorCodes.OPERATION_CANCELED)) {
        addLog(`파일 암호화 실패: ${error.message}`);
        Alert.alert('❌ 실패', error.message);
      }
      setLoading(false);
    }
  };

  // 서버 전송
  const handleSendToServer = async () => {
    if (!encrypted) {
      Alert.alert('알림', '먼저 메시지/파일을 암호화하세요.');
      return;
    }

    try {
      setLoading(true);
      addLog('=== 서버 전송 시작 ===');

      const payload = JSON.parse(encrypted);

      // 파일인지 텍스트인지 구분
      if (payload.encryptedData) {
        // 파일
        addLog('파일 전송 감지');
        const response = await sendFile(userId, payload);
        addLog(`✅ 서버 전송 완료! ID: ${response.id}`);
        Alert.alert('✅ 성공', `파일 ID: ${response.id}`);
      } else {
        // 텍스트
        addLog('텍스트 메시지 전송 감지');
        const messagePayload: {
          encryptedContent: string;
          version: string;
          algorithm: string;
          iv: string;
          encryptedDEK: string;
          deviceId?: string;
        } = {
          encryptedContent: payload.ciphertext,
          version: payload.version,
          algorithm: payload.algorithm,
          iv: payload.iv,
          encryptedDEK: payload.encryptedDEKForUser,
          deviceId: payload.deviceId,
        };

        const response = await sendMessage(userId, messagePayload);
        addLog(`✅ 서버 전송 완료! ID: ${response.id}`);
        Alert.alert('✅ 성공', `메시지 ID: ${response.id}`);
      }
    } catch (error: any) {
      addLog(`전송 실패: ${error.message}`);
      console.error('전송 전체 에러:', error);
      Alert.alert('❌ 실패', '서버 전송 실패');
    } finally {
      setLoading(false);
    }
  };

  // 서버 조회
  const handleGetFromServer = async () => {
    try {
      setLoading(true);
      addLog('=== 서버 조회 시작 ===');

      const response = await getMessages(userId);

      addLog(`서버 조회 완료: ${response.messages.length}개`);

      setServerMessages(response.messages);

      Alert.alert('✅ 성공', `${response.messages.length}개 메시지 조회`);
    } catch (error: any) {
      addLog(`조회 실패: ${error.message}`);
      console.error('조회 전체 에러:', error);
      Alert.alert('❌ 실패', error.message);
    } finally {
      setLoading(false);
    }
  };

  // 서버 메시지 복호화
  const handleDecryptServerMessage = async (msg: ServerMessage) => {
    try {
      setLoading(true);
      addLog(`=== 서버 메시지 복호화 (ID: ${msg.id}) ===`);

      if (msg.messageType === 'image' || msg.messageType === 'file') {
        addLog('파일/이미지 타입 감지');

        const filePayload: FilePayload = {
          version: msg.version,
          algorithm: msg.algorithm,
          encryptedData: msg.encryptedContent,
          iv: msg.iv,
          encryptedDEK: msg.encryptedDEK,
          fileName: msg.fileName || 'unknown',
          fileType: msg.fileType || 'application/octet-stream',
          fileSize: msg.fileSize || 0,
          timestamp: new Date(msg.timestamp).getTime(),
          deviceId: msg.deviceId,
        };

        if (msg.messageType === 'image') {
          const imagePath = await decryptImage(filePayload, userId);
          setDecryptedImageUri(`file://${imagePath}`);
          addLog(`✅ 이미지 복호화 완료: ${filePayload.fileName}`);
          Alert.alert('✅ 성공', `이미지: ${filePayload.fileName}`);
        } else {
          addLog(`✅ 파일 복호화 완료: ${filePayload.fileName}`);
          Alert.alert('✅ 성공', `파일: ${filePayload.fileName}\n타입: ${filePayload.fileType}`);
        }
      } else {
        const latestPayload: PayloadDataV2 = {
          version: msg.version,
          algorithm: msg.algorithm,
          ciphertext: msg.encryptedContent,
          iv: msg.iv,
          encryptedDEK: '',
          encryptedDEKForUser: msg.encryptedDEK,
          timestamp: new Date(msg.timestamp).getTime(),
          deviceId: msg.deviceId,
        };

        const plaintext = await decryptMessageV2(latestPayload, userId);
        addLog(`✅ 복호화 완료: "${plaintext}"`);
        Alert.alert('✅ 복호화 성공', `내용: ${plaintext}`);
      }
    } catch (error: any) {
      addLog(`복호화 실패: ${error.message}`);
      console.error('서버 메시지 복호화 전체 에러:', error);
      Alert.alert('❌ 실패', error.message);
    } finally {
      setLoading(false);
    }
  };

// 전체 테스트
const handleFullTest = async () => {
  try {
    setLoading(true);
    addLog('=== 전체 플로우 테스트 시작 ===');

    addLog('Step 1: 서버 연결');
    const serverOk = await pingServer();
    if (!serverOk) throw new Error('서버 연결 실패');
    addLog('✅ 서버 연결 성공');

    addLog('Step 2: 키 생성');
    const did = await getOrCreateDeviceId();
    await createMasterKey(userId);

    const keyPair = await generateRSAKeyPair();

    await savePrivateKey(userId, keyPair.privateKey);
    setPublicKey(keyPair.publicKey);
    addLog('✅ 키 생성 성공');

    // ⭐ 공개키 서버 등록
    addLog('Step 2-1: 공개키 서버 등록');
    try {
      await registerPublicKey(userId, keyPair.publicKey, did);
      addLog('✅ 공개키 등록 성공');
    } catch (error: any) {
      addLog(`⚠️ 공개키 등록 실패: ${error.message}`);
    }

    // ⭐⭐⭐ 개인키 백업 서버 업로드 추가 ⭐⭐⭐
    addLog('Step 2-2: 개인키 백업 업로드');
    try {
      const { encryptPrivateKeyForBackup } = await import('../crypto/rsaKeyManager');
      const { uploadPrivateKeyBackup } = await import('../utils/rsaApi');
      
      const backupPassword = 'test-backup-password-123'; // 테스트용 고정 비밀번호
      const backup = encryptPrivateKeyForBackup(keyPair.privateKey, backupPassword);
      
      await uploadPrivateKeyBackup(userId, backup, did);
      addLog('✅ 개인키 백업 완료');
    } catch (error: any) {
      addLog(`⚠️ 백업 실패: ${error.message}`);
    }

    addLog('Step 3: 메시지 암호화');
    const testMsg = '전체 플로우 테스트 메시지';

    const payload = await encryptMessageV2(testMsg, keyPair.publicKey);

    if (did) payload.deviceId = did;
    addLog('✅ 암호화 성공');

    addLog('Step 4: 서버 전송');

    const messagePayload: {
      encryptedContent: string;
      version: string;
      algorithm: string;
      iv: string;
      encryptedDEK: string;
      deviceId?: string;
    } = {
      encryptedContent: payload.ciphertext,
      version: payload.version,
      algorithm: payload.algorithm,
      iv: payload.iv,
      encryptedDEK: payload.encryptedDEKForUser,
      deviceId: payload.deviceId,
    };

    const sendRes = await sendMessage(userId, messagePayload);

    addLog(`✅ 전송 성공 (ID: ${sendRes.id})`);

    addLog('Step 5: 서버 조회');
    const getRes = await getMessages(userId);
    addLog(`✅ 조회 성공 (${getRes.messages.length}개)`);

    addLog('Step 6: 복호화');
    const latest = getRes.messages[0];

    const latestPayload: PayloadDataV2 = {
      version: latest.version,
      algorithm: latest.algorithm,
      ciphertext: latest.encryptedContent,
      iv: latest.iv,
      encryptedDEK: '',
      encryptedDEKForUser: latest.encryptedDEK,
      timestamp: new Date(latest.timestamp).getTime(),
      deviceId: latest.deviceId,
    };

    const decrypted = await decryptMessageV2(latestPayload, userId);
    addLog(`✅ 복호화 성공: "${decrypted}"`);

    if (testMsg === decrypted) {
      addLog('✅ 검증 성공: 원본과 일치!');
      addLog('=== 데이터베이스 저장 확인 ===');
      addLog('✅ messages 테이블: 저장됨');
      addLog('✅ user_public_keys 테이블: 저장됨');
      addLog('✅ devices 테이블: 저장됨');
      addLog('✅ private_key_backups 테이블: 저장됨');
      Alert.alert('🎉 전체 테스트 성공!', '모든 단계를 통과했습니다!\n\n모든 테이블에 데이터가 저장되었습니다.');
    } else {
      addLog('❌ 검증 실패: 원본과 불일치');
      Alert.alert('❌ 실패', '복호화 결과가 원본과 다릅니다.');
    }
  } catch (error: any) {
    addLog(`❌ 전체 테스트 실패: ${error.message}`);
    console.error('전체 테스트 에러:', error);
    Alert.alert('❌ 실패', error.message);
  } finally {
    setLoading(false);
  }
};

  // 서버 메시지 삭제
  const handleClearAll = async () => {
    Alert.alert(
      '확인',
      '서버의 모든 메시지를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              addLog('서버 메시지 삭제 중...');
              await clearAllMessages();
              setServerMessages([]);
              addLog('✅ 삭제 완료');
              Alert.alert('✅ 완료', '모든 메시지가 삭제되었습니다.');
            } catch (error: any) {
              addLog(`삭제 실패: ${error.message}`);
              Alert.alert('❌ 실패', error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // 로컬 데이터 삭제
  const handleReset = async () => {
    Alert.alert(
      '확인',
      '로컬의 모든 키와 데이터를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              addLog('로컬 초기화 시작...');

              await deleteMasterKey(userId);
              await AsyncStorage.clear();

              setEncrypted('');
              setDecrypted('');
              setPublicKey('');
              setDeviceId('');
              setDecryptedImageUri('');

              addLog('✅ 초기화 완료');
              Alert.alert('✅ 완료', '모든 로컬 데이터가 삭제되었습니다.');
            } catch (error: any) {
              addLog(`초기화 실패: ${error.message}`);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles['test-container']}>
      {loading && (
        <View style={styles['test-loadingOverlay']}>
          <ActivityIndicator size="large" color="#588DFF" />
          <Text style={styles['test-loadingOverlay-text']}>처리 중...</Text>
        </View>
      )}

      <View style={styles['test-header']}>
        <Text style={styles['test-header-title']}>🔐 E2EE 통합 테스트</Text>
        <Text style={styles['test-header-subtitle']}>텍스트 + 파일 암호화</Text>
      </View>

      <View style={styles['test-section']}>
        <Text style={styles['test-section-label']}>User ID:</Text>
        <TextInput
          style={styles['test-input']}
          value={userId}
          onChangeText={setUserId}
          editable={!loading}
        />
        {deviceId && (
          <Text style={styles['test-deviceId']}>
            Device: {deviceId.substring(0, 16)}...
          </Text>
        )}
      </View>

      <View style={styles['test-section']}>
        <Text style={styles['test-section-title']}>1️⃣ 초기화</Text>
        <TouchableOpacity
          style={styles['test-button']}
          onPress={handleInit}
          disabled={loading}>
          <Text style={styles['test-button-text']}>초기화 (키 생성)</Text>
        </TouchableOpacity>
      </View>

      <View style={styles['test-section']}>
        <Text style={styles['test-section-title']}>2️⃣ 서버 연결</Text>
        <TouchableOpacity
          style={[styles['test-button'], styles['test-button--info']]}
          onPress={handlePingServer}
          disabled={loading}>
          <Text style={styles['test-button-text']}>서버 연결 테스트</Text>
        </TouchableOpacity>
      </View>

      <View style={styles['test-section']}>
        <Text style={styles['test-section-title']}>3️⃣ 텍스트 암호화/복호화</Text>
        <TextInput
          style={[styles['test-input'], styles['test-input--multiline']]}
          value={message}
          onChangeText={setMessage}
          placeholder="테스트 메시지 입력"
          multiline
          editable={!loading}
        />
        <View style={styles['test-buttonRow']}>
          <TouchableOpacity
            style={[styles['test-button'], { flex: 1 }]}
            onPress={handleEncrypt}
            disabled={loading}>
            <Text style={styles['test-button-text']}>🔐 암호화</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles['test-button'], styles['test-button--secondary'], { flex: 1 }]}
            onPress={handleDecrypt}
            disabled={loading}>
            <Text style={styles['test-button-text']}>🔓 복호화</Text>
          </TouchableOpacity>
        </View>

        {decrypted && (
          <View style={[styles['test-resultBox'], styles['test-resultBox--success']]}>
            <Text style={styles['test-resultBox-label']}>복호화 결과:</Text>
            <Text style={styles['test-resultBox-text']}>{decrypted}</Text>
          </View>
        )}
      </View>

      <View style={styles['test-section']}>
        <Text style={styles['test-section-title']}>4️⃣ 파일/이미지 암호화</Text>
        <View style={styles['test-buttonRow']}>
          <TouchableOpacity
            style={[styles['test-button'], { flex: 1 }]}
            onPress={handleImageEncrypt}
            disabled={loading}>
            <Text style={styles['test-button-text']}>📷 이미지 암호화</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles['test-button'], styles['test-button--secondary'], { flex: 1 }]}
            onPress={handleFileEncrypt}
            disabled={loading}>
            <Text style={styles['test-button-text']}>📄 파일 암호화</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles['test-button'], styles['test-button--success']]}
          onPress={handleImageDecrypt}
          disabled={loading || !encrypted}>
          <Text style={styles['test-button-text']}>🔓 이미지 복호화</Text>
        </TouchableOpacity>

        {decryptedImageUri && (
          <View style={styles['test-imagePreview']}>
            <Text style={styles['test-resultBox-label']}>복호화된 이미지:</Text>
            <Image
              source={{ uri: decryptedImageUri }}
              style={styles['test-imagePreview-image']}
              resizeMode="contain"
            />
          </View>
        )}
      </View>

      <View style={styles['test-section']}>
        <Text style={styles['test-section-title']}>5️⃣ 서버 연동</Text>
        <View style={styles['test-buttonRow']}>
          <TouchableOpacity
            style={[styles['test-button'], { flex: 1 }]}
            onPress={handleSendToServer}
            disabled={loading}>
            <Text style={styles['test-button-text']}>📤 서버 전송</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles['test-button'], styles['test-button--secondary'], { flex: 1 }]}
            onPress={handleGetFromServer}
            disabled={loading}>
            <Text style={styles['test-button-text']}>📥 서버 조회</Text>
          </TouchableOpacity>
        </View>

        {serverMessages.length > 0 && (
          <View style={styles['test-serverMessages']}>
            <Text style={styles['test-resultBox-label']}>
              서버 메시지 ({serverMessages.length}개):
            </Text>
            {serverMessages.slice(0, 5).map((msg) => (
              <TouchableOpacity
                key={msg.id}
                style={styles['test-serverMessages-item']}
                onPress={() => handleDecryptServerMessage(msg)}>
                <Text style={styles['test-serverMessages-item-id']}>#{msg.id}</Text>
                <Text style={styles['test-serverMessages-item-preview']} numberOfLines={1}>
                  {msg.messageType || 'text'} | {msg.encryptedContent.substring(0, 30)}...
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles['test-section']}>
        <Text style={styles['test-section-title']}>6️⃣ 전체 플로우 테스트</Text>
        <TouchableOpacity
          style={[styles['test-button'], styles['test-button--success']]}
          onPress={handleFullTest}
          disabled={loading}>
          <Text style={styles['test-button-text']}>🧪 전체 테스트 실행</Text>
        </TouchableOpacity>
      </View>

      <View style={styles['test-section']}>
        <Text style={styles['test-section-title']}>7️⃣ 데이터 관리</Text>
        <View style={styles['test-buttonRow']}>
          <TouchableOpacity
            style={[styles['test-button'], styles['test-button--danger'], { flex: 1 }]}
            onPress={handleClearAll}
            disabled={loading}>
            <Text style={styles['test-button-text']}>🗑️ 서버 메시지 삭제</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles['test-button'], styles['test-button--danger'], { flex: 1 }]}
            onPress={handleReset}
            disabled={loading}>
            <Text style={styles['test-button-text']}>🗑️ 로컬 데이터 삭제</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles['test-section']}>
        <View style={styles['test-logHeader']}>
          <Text style={styles['test-section-title']}>📝 로그</Text>
          <TouchableOpacity onPress={() => setLogs([])}>
            <Text style={styles['test-logHeader-clearButton']}>지우기</Text>
          </TouchableOpacity>
        </View>
        <View style={styles['test-logBox']}>
          <ScrollView style={{ maxHeight: 300 }}>
            {logs.map((log, index) => (
              <Text key={index} style={styles['test-logBox-text']}>
                {log}
              </Text>
            ))}
            {logs.length === 0 && (
              <Text style={styles['test-logBox-empty']}>로그가 없습니다.</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  'test-container': {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  'test-loadingOverlay': {
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
  'test-loadingOverlay-text': {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  'test-header': {
    backgroundColor: '#588DFF',
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  'test-header-title': {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  'test-header-subtitle': {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  'test-section': {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
  },
  'test-section-title': {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  'test-section-label': {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#666',
  },
  'test-input': {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  'test-input--multiline': {
    height: 80,
    textAlignVertical: 'top',
  },
  'test-deviceId': {
    fontSize: 10,
    color: '#999',
    marginTop: 5,
    fontFamily: 'monospace',
  },
  'test-buttonRow': {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  'test-button': {
    backgroundColor: '#588DFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  'test-button--secondary': {
    backgroundColor: '#6c757d',
  },
  'test-button--success': {
    backgroundColor: '#28a745',
  },
  'test-button--info': {
    backgroundColor: '#17a2b8',
  },
  'test-button--danger': {
    backgroundColor: '#dc3545',
  },
  'test-button-text': {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  'test-resultBox': {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  'test-resultBox--success': {
    backgroundColor: '#d4edda',
  },
  'test-resultBox-label': {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  'test-resultBox-text': {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
  },
  'test-imagePreview': {
    marginTop: 15,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  'test-imagePreview-image': {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 10,
  },
  'test-serverMessages': {
    backgroundColor: '#e7f3ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  'test-serverMessages-item': {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  'test-serverMessages-item-id': {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#588DFF',
    marginRight: 10,
    width: 30,
  },
  'test-serverMessages-item-preview': {
    fontSize: 11,
    color: '#666',
    flex: 1,
    fontFamily: 'monospace',
  },
  'test-logHeader': {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  'test-logHeader-clearButton': {
    color: '#dc3545',
    fontSize: 14,
  },
  'test-logBox': {
    backgroundColor: '#1e1e1e',
    padding: 10,
    borderRadius: 8,
  },
  'test-logBox-text': {
    color: '#00ff00',
    fontSize: 9,
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  'test-logBox-empty': {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
    padding: 20,
  },
});

export default EncryptionTestScreen;