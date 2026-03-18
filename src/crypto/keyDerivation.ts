import CryptoJS from 'crypto-js';

export interface KDFParams {
  iterations: number;
  keySize: number;
  salt: string;
  algorithm: string;
}

/**
 * Salt 생성
 */
export const generateSalt = (): string => {
  const salt = CryptoJS.lib.WordArray.random(32);
  return salt.toString(CryptoJS.enc.Base64);
};

/**
 * 비밀번호로부터 KEK 생성
 */
export const deriveKEKFromPassword = (
  password: string,
  salt?: string,
  iterations: number = 100000
): { kek: string; salt: string; params: KDFParams } => {
  console.log('🔐 [KDF] KEK 생성 중...');
  console.log(`  반복: ${iterations}`);

  if (!salt) {
    salt = generateSalt();
    console.log('  새 Salt 생성');
  }

  const startTime = Date.now();
  
  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: iterations,
    hasher: CryptoJS.algo.SHA256,
  });

  const kek = key.toString(CryptoJS.enc.Hex);
  
  const elapsed = Date.now() - startTime;
  console.log(`✅ [KDF] KEK 생성 완료 (${elapsed}ms)`);

  const params: KDFParams = {
    iterations,
    keySize: 256,
    salt,
    algorithm: 'PBKDF2-SHA256',
  };

  return { kek, salt, params };
};

/**
 * 저장된 파라미터로 KEK 재생성
 */
export const deriveKEKWithParams = (
  password: string,
  params: KDFParams
): string => {
  console.log('🔐 [KDF] 저장된 파라미터로 KEK 생성 중...');

  const key = CryptoJS.PBKDF2(password, params.salt, {
    keySize: params.keySize / 32,
    iterations: params.iterations,
    hasher: CryptoJS.algo.SHA256,
  });

  const kek = key.toString(CryptoJS.enc.Hex);

  console.log('✅ [KDF] KEK 생성 완료');
  return kek;
};

/**
 * 비밀번호 강도 검증
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('비밀번호는 최소 8자 이상이어야 합니다.');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('대문자를 최소 1개 포함해야 합니다.');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('소문자를 최소 1개 포함해야 합니다.');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('숫자를 최소 1개 포함해야 합니다.');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('특수문자(!@#$%^&*)를 최소 1개 포함해야 합니다.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};