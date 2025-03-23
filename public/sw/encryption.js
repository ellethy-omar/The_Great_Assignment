// Example functions for encrypting and decrypting using AES-GCM
async function generateKey() {
    return await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true, // extractable
        ['encrypt', 'decrypt']
    );
}
  
async function encryptContent(key, plaintext) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);
    const iv = crypto.getRandomValues(new Uint8Array(12)); // Initialization vector
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    return { iv: Array.from(iv), ciphertext: Array.from(new Uint8Array(encrypted)) };
}
  
async function decryptContent(key, ivArray, ciphertextArray) {
    const iv = new Uint8Array(ivArray);
    const ciphertext = new Uint8Array(ciphertextArray);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
}