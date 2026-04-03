import { PendingChange, SyncState, Conflict, OfflineQueue, Transaction, Debt } from './types';

export class OfflineService {
  private dbName = 'BiasharaLedgerDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private syncQueue: OfflineQueue = { transactions: [], debts: [], profiles: [] };
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private listeners: Set<(state: SyncState) => void> = new Set();

  constructor() {
    this.initEventListeners();
  }

  private initEventListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());
    }
  }

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Transactions store
        if (!db.objectStoreNames.contains('transactions')) {
          const transactionStore = db.createObjectStore('transactions', { keyPath: 'id' });
          transactionStore.createIndex('date', 'date', { unique: false });
          transactionStore.createIndex('type', 'type', { unique: false });
          transactionStore.createIndex('status', 'status', { unique: false });
        }

        // Debts store
        if (!db.objectStoreNames.contains('debts')) {
          const debtStore = db.createObjectStore('debts', { keyPath: 'id' });
          debtStore.createIndex('status', 'status', { unique: false });
          debtStore.createIndex('dueDate', 'dueDate', { unique: false });
        }

        // Pending changes store
        if (!db.objectStoreNames.contains('pendingChanges')) {
          const pendingStore = db.createObjectStore('pendingChanges', { keyPath: 'id', autoIncrement: true });
          pendingStore.createIndex('entity', 'entity', { unique: false });
          pendingStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Sync state store
        if (!db.objectStoreNames.contains('syncState')) {
          db.createObjectStore('syncState', { keyPath: 'id' });
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  private handleOnline(): void {
    this.isOnline = true;
    this.triggerSync();
    this.notifyListeners();
  }

  private handleOffline(): void {
    this.isOnline = false;
    this.notifyListeners();
  }

  async addTransaction(transaction: Transaction): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    if (this.isOnline) {
      await this.saveToStore('transactions', transaction);
    } else {
      await this.queueChange({
        id: crypto.randomUUID(),
        entity: 'transaction',
        entityId: transaction.id,
        action: 'create',
        data: transaction,
        timestamp: Date.now()
      });
      await this.saveToStore('transactions', { ...transaction, status: 'pending' as const });
    }
  }

  async updateTransaction(transaction: Transaction): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    if (this.isOnline) {
      await this.saveToStore('transactions', transaction);
    } else {
      await this.queueChange({
        id: crypto.randomUUID(),
        entity: 'transaction',
        entityId: transaction.id,
        action: 'update',
        data: transaction,
        timestamp: Date.now()
      });
      await this.saveToStore('transactions', { ...transaction, status: 'pending' as const });
    }
  }

  async deleteTransaction(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    if (this.isOnline) {
      await this.deleteFromStore('transactions', id);
    } else {
      await this.queueChange({
        id: crypto.randomUUID(),
        entity: 'transaction',
        entityId: id,
        action: 'delete',
        data: null,
        timestamp: Date.now()
      });
    }
  }

  private async queueChange(change: PendingChange): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('pendingChanges', 'readwrite');
      const store = tx.objectStore('pendingChanges');
      const request = store.add(change);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async saveToStore(storeName: string, data: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async deleteFromStore(storeName: string, key: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingChanges(): Promise<PendingChange[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('pendingChanges', 'readonly');
      const store = tx.objectStore('pendingChanges');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async triggerSync(): Promise<SyncState> {
    if (this.syncInProgress || !this.isOnline) {
      return this.getSyncState();
    }

    this.syncInProgress = true;
    this.notifyListeners();

    try {
      const pendingChanges = await this.getPendingChanges();
      const conflicts: Conflict[] = [];

      // Process pending changes
      for (const change of pendingChanges) {
        try {
          // Here you would send to your backend API
          await this.syncChange(change);
          await this.removePendingChange(change.id);
        } catch (error) {
          if (this.isConflictError(error)) {
            conflicts.push({
              id: crypto.randomUUID(),
              entity: change.entity,
              entityId: change.entityId,
              localVersion: change.data,
              remoteVersion: {},
              timestamp: Date.now(),
              resolved: false
            });
          }
        }
      }

      await this.updateSyncState({
        lastSync: Date.now(),
        pendingChanges: [],
        conflicts,
        status: conflicts.length > 0 ? 'error' : 'synced'
      });

      this.syncInProgress = false;
      this.notifyListeners();

      return this.getSyncState();
    } catch (error) {
      this.syncInProgress = false;
      await this.updateSyncState({
        lastSync: Date.now(),
        pendingChanges: await this.getPendingChanges(),
        conflicts: [],
        status: 'error'
      });
      this.notifyListeners();
      throw error;
    }
  }

  private async syncChange(change: PendingChange): Promise<void> {
    // Simulate API call - in production, this would call your backend
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate success
        resolve();
      }, 100);
    });
  }

  private isConflictError(error: any): boolean {
    return error?.status === 409;
  }

  private async removePendingChange(id: number | string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('pendingChanges', 'readwrite');
      const store = tx.objectStore('pendingChanges');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async updateSyncState(state: SyncState): Promise<void> {
    await this.saveToStore('syncState', { id: 'current', ...state });
  }

  async getSyncState(): Promise<SyncState> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('syncState', 'readonly');
      const store = tx.objectStore('syncState');
      const request = store.get('current');

      request.onsuccess = () => {
        resolve(request.result || {
          lastSync: 0,
          pendingChanges: [],
          conflicts: [],
          status: this.isOnline ? 'synced' : 'offline'
        });
      };
      request.onerror = () => reject(request.error);
    });
  }

  subscribe(listener: (state: SyncState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.getSyncState().then(state => {
      this.listeners.forEach(listener => listener(state));
    });
  }

  isOffline(): boolean {
    return !this.isOnline;
  }

  async clearDatabase(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const stores = ['transactions', 'debts', 'pendingChanges', 'syncState', 'settings'];
    
    for (const store of stores) {
      await new Promise<void>((resolve, reject) => {
        const tx = this.db!.transaction(store, 'readwrite');
        const request = tx.objectStore(store).clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }

  async exportData(): Promise<Blob> {
    if (!this.db) throw new Error('Database not initialized');

    const data: Record<string, any[]> = {};
    
    for (const storeName of ['transactions', 'debts']) {
      data[storeName] = await new Promise<any[]>((resolve, reject) => {
        const tx = this.db!.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    }

    const json = JSON.stringify(data, null, 2);
    return new Blob([json], { type: 'application/json' });
  }

  async importData(file: File): Promise<{ success: boolean; error?: string }> {
    try {
      const text = await file.text();
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return { success: false, error: 'File size exceeds 10MB limit' };
      }
      
      let data: any;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        return { success: false, error: 'Invalid JSON format' };
      }
      
      // Schema validation
      if (!data || typeof data !== 'object') {
        return { success: false, error: 'Invalid data structure' };
      }
      
      // Check for prototype pollution attempts
      if (data.hasOwnProperty('__proto__') || data.hasOwnProperty('constructor') || data.hasOwnProperty('prototype')) {
        return { success: false, error: 'Potential prototype pollution detected' };
      }
      
      // Validate stores structure
      for (const [storeName, items] of Object.entries(data)) {
        if (!Array.isArray(items)) {
          return { success: false, error: `Store '${storeName}' must be an array` };
        }
        
        // Validate each item in the store
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          
          // Skip dangerous keys
          if (item && typeof item === 'object') {
            if (item.hasOwnProperty('__proto__') || item.hasOwnProperty('constructor') || item.hasOwnProperty('prototype')) {
              return { success: false, error: `Potential prototype pollution in ${storeName}[${i}]` };
            }
          }
        }
      }

      // Import validated data
      for (const [storeName, items] of Object.entries(data)) {
        for (const item of items as any[]) {
          await this.saveToStore(storeName, item);
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Import error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error during import' };
    }
  }
}

export default OfflineService;
