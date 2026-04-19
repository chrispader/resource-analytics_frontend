/**
 * Node can expose `globalThis.localStorage` with experimental flags in a broken
 * state (e.g. `getItem` missing). Next/React may touch it during SSR and crash.
 * Replace it with a minimal in-memory Storage so the dev server stays usable.
 */
export async function register() {
  patchBrokenNodeLocalStorage();
}

function patchBrokenNodeLocalStorage() {
  const globalWithStorage = globalThis as typeof globalThis & {
    localStorage?: Storage;
  };

  const existing = globalWithStorage.localStorage;
  if (!existing) {
    return;
  }

  const storageLooksUsable =
    typeof existing.getItem === "function" &&
    typeof existing.setItem === "function";

  if (storageLooksUsable) {
    return;
  }

  const memory = new Map<string, string>();

  globalWithStorage.localStorage = {
    getItem: (key: string) => (memory.has(key) ? memory.get(key)! : null),
    setItem: (key: string, value: string) => {
      memory.set(key, value);
    },
    removeItem: (key: string) => {
      memory.delete(key);
    },
    clear: () => {
      memory.clear();
    },
    key: (index: number) => {
      if (index < 0 || index >= memory.size) {
        return null;
      }
      const keys = [...memory.keys()];
      return keys[index] ?? null;
    },
    get length() {
      return memory.size;
    },
  } as Storage;
}
