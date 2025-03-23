const DB_NAME = 'chatAppDB';
const DB_VERSION = 1;
const DB_STORE_CONFIGS = {
  messages: { keyPath: 'id', autoIncrement: true },
  chats: { keyPath: 'chatId' },
  friends: { keyPath: 'userId' },
  friendRequests: { keyPath: 'requestId' }
};

const openGeneralDBConnection = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
  
    request.onupgradeneeded = event => {
      const db = event.target.result;

      Object.entries(DB_STORE_CONFIGS).forEach(([storeName, config]) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, config);
        }
      });
    };
  
    request.onsuccess = event => {
      resolve(event.target.result);
    };
  
    request.onerror = event => {
      console.error('IndexedDB error:', event.target.error);
      reject(event.target.error);
    };
});

function storeData(storeName, data) {
  openGeneralDBConnection.then(db => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    if (Array.isArray(data)) {
      data.forEach(item => store.put(item));
    } else {
      store.put(data);
    }

    tx.oncomplete = () => console.log(`Data stored successfully in ${storeName}`);
    tx.onerror = (err) => console.error(`Transaction error in ${storeName}:`, err);
  }).catch(err => {
    console.error(`Error storing data in ${storeName}:`, err);
  });
}
  
function getAllData(storeName) {
  return openGeneralDBConnection.then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = event => resolve(event.target.result);
      request.onerror = event => reject(event.target.error);
    });
  });
}