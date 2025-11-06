import { Message } from '../types';

const DB_NAME = 'oumas-db';
const DB_VERSION = 2; // Bump version to trigger schema upgrade
const MESSAGE_STORE_NAME = 'offline-messages';
const KEYVAL_STORE_NAME = 'key-value-store';


let db: IDBDatabase;

export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', request.error);
      reject('IndexedDB error');
    };

    request.onsuccess = (event) => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(MESSAGE_STORE_NAME)) {
        db.createObjectStore(MESSAGE_STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(KEYVAL_STORE_NAME)) {
        db.createObjectStore(KEYVAL_STORE_NAME);
      }
    };
  });
};

export const saveData = async (key: string, value: any): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(KEYVAL_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(KEYVAL_STORE_NAME);
        const request = store.put(value, key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const loadData = async (key: string): Promise<any> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(KEYVAL_STORE_NAME, 'readonly');
        const store = transaction.objectStore(KEYVAL_STORE_NAME);
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};


export const addMessageToQueue = async (message: Message): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(MESSAGE_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(MESSAGE_STORE_NAME);
    const request = store.add(message);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getQueuedMessages = async (): Promise<Message[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(MESSAGE_STORE_NAME, 'readonly');
    const store = transaction.objectStore(MESSAGE_STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const deleteQueuedMessage = async (messageId: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(MESSAGE_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(MESSAGE_STORE_NAME);
    const request = store.delete(messageId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};