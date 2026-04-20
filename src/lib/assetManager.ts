/**
 * Advanced Asset Manager
 * Manages all game assets with lazy loading and optimization
 */

import { lazyLoadImage, batchLoadAssets, lazyLoadGLTF } from './optimization';

// ============= ASSET REGISTRY =============
export interface AssetDefinition {
  type: 'image' | 'model' | 'audio' | 'texture';
  url: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  preload?: boolean;
  fallback?: string;
}

export const ASSET_REGISTRY: Record<string, AssetDefinition> = {
  // ============= 3D MODELS =============
  'model.jetpack': {
    type: 'model',
    url: '/models/jetpack_man3d.glb',
    category: 'jetpack',
    priority: 'medium',
    preload: false
  },
  'model.spaceship': {
    type: 'model',
    url: '/models/casino_spaceship3d.glb',
    category: 'aviator',
    priority: 'low',
    preload: false
  },
  'model.plane': {
    type: 'model',
    url: '/models/casino_plane3d.glb',
    category: 'aviator',
    priority: 'low',
    preload: false
  },
  
  // ============= SLOT BACKGROUNDS =============
  'bg.buffalo-king': {
    type: 'image',
    url: '/assets/slots/buffalo-king/background.jpg',
    category: 'slots',
    priority: 'low',
    preload: false
  },
  'bg.sugar-rush': {
    type: 'image',
    url: '/assets/slots/sugar-rush/background.jpg',
    category: 'slots',
    priority: 'low',
    preload: false
  },
  'bg.book-dead': {
    type: 'image',
    url: '/assets/slots/book-dead/background.jpg',
    category: 'slots',
    priority: 'low',
    preload: false
  },
  'bg.wild-west-gold': {
    type: 'image',
    url: '/assets/slots/wild-west-gold/background.jpg',
    category: 'slots',
    priority: 'low',
    preload: false
  },
  'bg.starburst': {
    type: 'image',
    url: '/assets/slots/starburst/background.jpg',
    category: 'slots',
    priority: 'low',
    preload: false
  },
  'bg.aztec-king': {
    type: 'image',
    url: '/assets/slots/aztec-king/background.jpg',
    category: 'slots',
    priority: 'low',
    preload: false
  },
  'bg.fruit-party': {
    type: 'image',
    url: '/assets/slots/fruit-party/background.jpg',
    category: 'slots',
    priority: 'low',
    preload: false
  },
  'bg.gonzo-quest': {
    type: 'image',
    url: '/assets/slots/gonzo-quest/background.jpg',
    category: 'slots',
    priority: 'low',
    preload: false
  },
  'bg.hot-fiesta': {
    type: 'image',
    url: '/assets/slots/hot-fiesta/background.jpg',
    category: 'slots',
    priority: 'low',
    preload: false
  },
  'bg.dog-house': {
    type: 'image',
    url: '/assets/slots/dog-house/background.jpg',
    category: 'slots',
    priority: 'low',
    preload: false
  },
  'bg.money-train': {
    type: 'image',
    url: '/assets/slots/money-train/background.jpg',
    category: 'slots',
    priority: 'low',
    preload: false
  },
  'bg.reactoonz': {
    type: 'image',
    url: '/assets/slots/reactoonz/background.jpg',
    category: 'slots',
    priority: 'low',
    preload: false
  },
  
  // ============= OLYMPUS =============
  'bg.olympus': {
    type: 'image',
    url: '/assets/slots/olympus/background.jpg',
    category: 'slots',
    priority: 'low',
    preload: false
  },
  
  // ============= BONANZA =============
  'bg.bonanza': {
    type: 'image',
    url: '/assets/slots/bonanza/background.jpg',
    category: 'slots',
    priority: 'low',
    preload: false
  },
  
  // ============= BIGBASS =============
  'bg.bigbass': {
    type: 'image',
    url: '/assets/slots/bigbass/background.jpg',
    category: 'slots',
    priority: 'low',
    preload: false
  },
  
  // ============= SUGAR RUSH SYMBOLS =============
  'symbol.gummy': {
    type: 'image',
    url: '/assets/slots/sugar-rush/gummy.png',
    category: 'symbols',
    priority: 'low',
    preload: false
  },
  'symbol.donut': {
    type: 'image',
    url: '/assets/slots/sugar-rush/donut.png',
    category: 'symbols',
    priority: 'low',
    preload: false
  },
  'symbol.chocolate': {
    type: 'image',
    url: '/assets/slots/sugar-rush/chocolate.png',
    category: 'symbols',
    priority: 'low',
    preload: false
  },
  'symbol.cake': {
    type: 'image',
    url: '/assets/slots/sugar-rush/cake.png',
    category: 'symbols',
    priority: 'low',
    preload: false
  },
  'symbol.icecream': {
    type: 'image',
    url: '/assets/slots/sugar-rush/icecream.png',
    category: 'symbols',
    priority: 'low',
    preload: false
  },
  'symbol.heart': {
    type: 'image',
    url: '/assets/slots/sugar-rush/heart.png',
    category: 'symbols',
    priority: 'low',
    preload: false
  },
  'symbol.star': {
    type: 'image',
    url: '/assets/slots/sugar-rush/star.png',
    category: 'symbols',
    priority: 'low',
    preload: false
  },
  'symbol.wild': {
    type: 'image',
    url: '/assets/slots/sugar-rush/wild.png',
    category: 'symbols',
    priority: 'low',
    preload: false
  },
  'symbol.lollipop': {
    type: 'image',
    url: '/assets/slots/sugar-rush/lollipop.png',
    category: 'symbols',
    priority: 'low',
    preload: false
  }
};

// ============= ASSET MANAGER CLASS =============
class AssetManager {
  private loadedAssets: Map<string, any> = new Map();
  private loadingPromises: Map<string, Promise<any>> = new Map();
  private preloadedCategories: Set<string> = new Set();
  
  /**
   * Load a single asset by key
   */
  async loadAsset(key: string): Promise<any> {
    const definition = ASSET_REGISTRY[key];
    if (!definition) {
      console.warn(`Asset not found: ${key}`);
      return null;
    }
    
    // Check if already loaded
    if (this.loadedAssets.has(key)) {
      return this.loadedAssets.get(key);
    }
    
    // Check if currently loading
    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key);
    }
    
    // Create loading promise
    const loadingPromise = this.loadAssetByType(key, definition);
    this.loadingPromises.set(key, loadingPromise);
    
    try {
      const asset = await loadingPromise;
      this.loadedAssets.set(key, asset);
      return asset;
    } catch (error) {
      console.error(`Failed to load asset: ${key}`, error);
      
      // Return fallback if available
      if (definition.fallback) {
        return this.loadAsset(definition.fallback);
      }
      
      return null;
    } finally {
      this.loadingPromises.delete(key);
    }
  }
  
  /**
   * Load asset by type
   */
  private async loadAssetByType(key: string, definition: AssetDefinition): Promise<any> {
    switch (definition.type) {
      case 'image':
        return lazyLoadImage(definition.url, { priority: definition.priority as 'high' | 'low' });
      
      case 'model':
        return lazyLoadGLTF(definition.url, { priority: definition.priority as 'high' | 'low' });
      
      default:
        throw new Error(`Unknown asset type: ${definition.type}`);
    }
  }
  
  /**
   * Preload all assets for a category
   */
  async preloadCategory(category: string): Promise<void> {
    if (this.preloadedCategories.has(category)) {
      return;
    }
    
    const categoryAssets = Object.entries(ASSET_REGISTRY)
      .filter(([_, def]) => def.category === category)
      .map(([key, def]) => ({
        key,
        loader: () => this.loadAssetByType(key, def)
      }));
    
    await batchLoadAssets(categoryAssets, { concurrent: 3, priority: 'low' });
    this.preloadedCategories.add(category);
  }
  
  /**
   * Preload all high-priority assets
   */
  async preloadHighPriority(): Promise<void> {
    const highPriorityAssets = Object.entries(ASSET_REGISTRY)
      .filter(([_, def]) => def.priority === 'high' || def.preload)
      .map(([key, def]) => ({
        key,
        loader: () => this.loadAssetByType(key, def)
      }));
    
    await batchLoadAssets(highPriorityAssets, { concurrent: 2, priority: 'high' });
  }
  
  /**
   * Get loaded asset
   */
  getAsset<T = any>(key: string): T | null {
    return this.loadedAssets.get(key) ?? null;
  }
  
  /**
   * Check if asset is loaded
   */
  isLoaded(key: string): boolean {
    return this.loadedAssets.has(key);
  }
  
  /**
   * Unload assets by category
   */
  unloadCategory(category: string): void {
    const keysToRemove: string[] = [];

    (Object.entries(ASSET_REGISTRY) as Array<[string, AssetDefinition]>).forEach(([key, def]) => {
      if (def.category === category) {
        keysToRemove.push(key);
      }
    });

    keysToRemove.forEach(key => {
      this.loadedAssets.delete(key);
    });

    this.preloadedCategories.delete(category);
  }
  
  /**
   * Get all loaded assets count
   */
  getLoadedCount(): number {
    return this.loadedAssets.size;
  }
  
  /**
   * Get all assets for a game
   */
  getGameAssets(gameId: string): Record<string, string> {
    const assets: Record<string, string> = {};
    
    // Check for background
    const bgKey = `bg.${gameId}`;
    if (ASSET_REGISTRY[bgKey]) {
      assets.background = ASSET_REGISTRY[bgKey].url;
    }
    
    // Check for symbols
    Object.entries(ASSET_REGISTRY)
      .filter(([key, def]) => key.startsWith('symbol.') && def.category === 'symbols')
      .forEach(([key, def]) => {
        assets[key] = def.url;
      });
    
    return assets;
  }
  
  /**
   * Clear all cached assets
   */
  clearAll(): void {
    this.loadedAssets.clear();
    this.loadingPromises.clear();
    this.preloadedCategories.clear();
  }
}

// ============= SINGLETON INSTANCE =============
export const assetManager = new AssetManager();

// ============= REACT HOOKS =============
import React from 'react';

/**
 * Hook to load an asset
 */
export function useAsset(key: string): { data: any; loading: boolean; error: Error | null } {
  const [state, setState] = React.useState<{
    data: any;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: true,
    error: null
  });
  
  React.useEffect(() => {
    let mounted = true;
    
    const load = async () => {
      try {
        const asset = await assetManager.loadAsset(key);
        if (mounted) {
          setState({ data: asset, loading: false, error: null });
        }
      } catch (error) {
        if (mounted) {
          setState({ data: null, loading: false, error: error as Error });
        }
      }
    };
    
    load();
    
    return () => {
      mounted = false;
    };
  }, [key]);
  
  return state;
}

/**
 * Hook to preload assets for a category
 */
export function useAssetPreload(category: string): { loaded: boolean; progress: number } {
  const [state, setState] = React.useState({ loaded: false, progress: 0 });
  
  React.useEffect(() => {
    let mounted = true;
    
    const preload = async () => {
      const categoryAssets = Object.entries(ASSET_REGISTRY)
        .filter(([_, def]) => def.category === category);
      
      const total = categoryAssets.length;
      let loaded = 0;
      
      await Promise.all(
        categoryAssets.map(async ([key]) => {
          await assetManager.loadAsset(key);
          if (mounted) {
            loaded++;
            setState({ loaded: false, progress: loaded / total });
          }
        })
      );
      
      if (mounted) {
        setState({ loaded: true, progress: 1 });
      }
    };
    
    preload();
    
    return () => {
      mounted = false;
    };
  }, [category]);
  
  return state;
}

/**
 * Hook to get image URL with lazy loading
 */
export function useLazyImage(key: string, fallback?: string): string {
  const assetDef = ASSET_REGISTRY[key];
  const [url, setUrl] = React.useState<string>(assetDef?.url || fallback || '');
  
  React.useEffect(() => {
    if (!assetDef) return;
    
    const img = new Image();
    img.onload = () => setUrl(assetDef.url);
    img.src = assetDef.url;
  }, [key, assetDef]);
  
  return url;
}

// ============= SLOT BACKGROUND HELPER =============
export function getSlotBackgroundUrl(gameId: string): string | null {
  const bgKey = `bg.${gameId}`;
  const assetDef = ASSET_REGISTRY[bgKey];
  return assetDef?.url || null;
}

export function getSlotSymbolUrls(gameId: string): Record<string, string> {
  const symbols: Record<string, string> = {};
  
  // Map game IDs to symbol prefixes
  const symbolMap: Record<string, string[]> = {
    'sugar-rush': ['gummy', 'donut', 'chocolate', 'cake', 'icecream', 'heart', 'star', 'wild', 'lollipop']
  };
  
  const symbolIds = symbolMap[gameId] || [];
  
  symbolIds.forEach(symbolId => {
    const key = `symbol.${symbolId}`;
    const assetDef = ASSET_REGISTRY[key];
    if (assetDef) {
      symbols[symbolId] = assetDef.url;
    }
  });
  
  return symbols;
}