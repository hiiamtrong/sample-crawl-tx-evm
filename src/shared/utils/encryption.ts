import { createCipheriv, createDecipheriv, scrypt } from 'crypto';
import { promisify } from 'util';

export const encrypt = async (data: string, secret: string, iv: Buffer) => {
  const key = (await promisify(scrypt)(secret, 'salt', 32)) as Buffer;
  const cipher = createCipheriv('aes-256-ctr', key, iv);

  const encryptedText = Buffer.concat([cipher.update(data), cipher.final()]);

  return encryptedText.toString('hex');
};

export const decrypt = async (secret: string, iv: string, encryptedText: string) => {
  const ivBuffer = Buffer.from(iv, 'hex');
  if (ivBuffer.length !== 16) {
    throw new Error('Invalid initialization vector length. IV must be 16 bytes.');
  }

  const key = (await promisify(scrypt)(secret, 'salt', 32)) as Buffer;

  const decipher = createDecipheriv('aes-256-ctr', key, ivBuffer);
  const decryptedText = Buffer.concat([
    decipher.update(Buffer.from(encryptedText, 'hex')),
    decipher.final(),
  ]);

  return decryptedText.toString();
};
