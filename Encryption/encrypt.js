const crypto = require('crypto');

module.exports = {
    encrypt: (plainText) => {

        // Generate a random encryption key and initialization vector (IV)
        const key = crypto.randomBytes(32);
        const iv = crypto.randomBytes(16);

        // Encrypt the message using the key and IV
        const algorithm = 'aes-256-cbc';
        const message = plainText;
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(message, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const payload = iv.toString('hex') + encrypted + key.toString('hex');
        const payload64 = Buffer.from(payload, 'hex').toString('base64'); // STORE IN DB
        return payload64;

    },
    decrypt: (payload64) => {

        const payload = Buffer.from(payload64, 'base64').toString('hex');

        // Decrypt the message using the key and IV
        const algorithm = 'aes-256-cbc';

        const iv = payload.substring(0, 32);
        const encrypted = payload.substring(32, payload.length - 64);
        const key = payload.substring(32 + encrypted.length, payload.length);

        const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;

    }
}