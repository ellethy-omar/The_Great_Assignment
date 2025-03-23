// console.log('Service Worker script loaded');
importScripts('sw/encryption.js', 'sw/indexedDB.js', 'sw/sync.js');

self.addEventListener('message', event => {
  const { action, store, payload } = event.data;
  console.log('Service Worker received:', event.data);

  switch (action) {
    case 'cacheData':
      // If caching a message that contains content, encrypt it first.
      if (store === 'messages' && payload.content) {
        // For demonstration, using a pre-generated key. In production, manage keys securely.
        generateKey().then(key => {
          encryptContent(key, payload.content)
            .then(encrypted => {
              payload.content = encrypted; // payload.content now holds an object with iv and ciphertext.
              console.log(`Caching data in store "${store}":`, payload);
              storeData(store, payload);
            })
            .catch(err => console.error('Encryption error:', err));
        }).catch(err => console.error('Key generation error:', err));
      } else {
        // For other cases or stores that don't require encryption.
        console.log(`Caching data in store "${store}":`, payload);
        storeData(store, payload);
      }
      break;

    case 'getData':
      if (store) {
        getAllData(store)
          .then(data => {
            // Send the retrieved data back to the client.
            event.source.postMessage({
              action: 'getDataResponse',
              store,
              payload: data
            });
          })
          .catch(err => {
            console.error(`Error getting data from store ${store}:`, err);
            event.source.postMessage({
              action: 'getDataResponse',
              store,
              error: err
            });
          });
      }
      break;

    case 'deleteData':
      if (store && payload && payload.key) {
        // deleteData should be a function that deletes a record by key.
        deleteData(store, payload.key)
          .then(() => {
            event.source.postMessage({
              action: 'deleteDataResponse',
              store,
              message: `Record with key ${payload.key} deleted`
            });
          })
          .catch(err => {
            console.error(`Error deleting data from store ${store}:`, err);
            event.source.postMessage({
              action: 'deleteDataResponse',
              store,
              error: err
            });
          });
      }
      break;

    case 'syncData':
      // Assume syncData is a function (perhaps defined in sync.js) that synchronizes data.
      syncData(payload)
        .then(syncResult => {
          event.source.postMessage({
            action: 'syncDataResponse',
            payload: syncResult
          });
        })
        .catch(err => {
          console.error('Sync error:', err);
          event.source.postMessage({
            action: 'syncDataResponse',
            error: err
          });
        });
      break;

    default:
      console.warn(`Unknown action received in Service Worker: ${action}`);
      break;
  }
});
