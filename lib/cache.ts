type CacheEntry<T> = {
  data: T;
  expires: number;
};

export class SimpleCache {
  private store: Map<string, CacheEntry<any>> = new Map();

  private defaultTtlMs: number;

  constructor(defaultTtlMs: number = 5 * 60 * 1000) {
    this.defaultTtlMs = defaultTtlMs;
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      this.store.delete(key);
      return null;
    }
    return entry.data;
  }

  set<T>(key: string, data: T, ttlMs?: number): void {
    const expires = Date.now() + (ttlMs ?? this.defaultTtlMs);
    this.store.set(key, { data, expires });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

// Singleton instance for server-side use (in-memory per instance)
const cache = new SimpleCache(5 * 60 * 1000);
export { cache };
