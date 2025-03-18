import { DOMWindow, JSDOM } from "jsdom";
import nodeCanvas  from "canvas";

export interface UnknownObject {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export type DotType = "dots" | "rounded" | "classy" | "classy-rounded" | "square" | "extra-rounded";
export type CornerDotType = "dot" | "square" | DotType;
export type CornerSquareType = "dot" | "square" | "extra-rounded" | DotType;
export type FileExtension = "svg" | "png" | "jpeg" | "webp";
export type GradientType = "radial" | "linear";
export type DrawType = "canvas" | "svg";
export type ShapeType = "square" | "circle";

export type Window = DOMWindow;

export type Gradient = {
  type: GradientType;
  rotation?: number;
  colorStops: {
    offset: number;
    color: string;
  }[];
};

export interface DotTypes {
  [key: string]: DotType;
}

export interface GradientTypes {
  [key: string]: GradientType;
}

export interface CornerDotTypes {
  [key: string]: CornerDotType;
}

export interface CornerSquareTypes {
  [key: string]: CornerSquareType;
}

export interface DrawTypes {
  [key: string]: DrawType;
}

export interface ShapeTypes {
  [key: string]: ShapeType;
}

export type TypeNumber =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31
  | 32
  | 33
  | 34
  | 35
  | 36
  | 37
  | 38
  | 39
  | 40;

export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";
export type Mode = "Numeric" | "Alphanumeric" | "Byte" | "Kanji";
export interface QRCode {
  addData(data: string, mode?: Mode): void;
  make(): void;
  getModuleCount(): number;
  isDark(row: number, col: number): boolean;
  createImgTag(cellSize?: number, margin?: number): string;
  createSvgTag(cellSize?: number, margin?: number): string;
  createSvgTag(opts?: { cellSize?: number; margin?: number; scalable?: boolean }): string;
  createDataURL(cellSize?: number, margin?: number): string;
  createTableTag(cellSize?: number, margin?: number): string;
  createASCII(cellSize?: number, margin?: number): string;
  renderTo2dContext(context: CanvasRenderingContext2D, cellSize?: number): void;
}


export type PluginOptions = {
  name: string;
  options?: UnknownObject;
};

export type Options = {
  type?: DrawType;
  shape?: ShapeType;
  width?: number;
  height?: number;
  margin?: number;
  data?: string;
  image?: string;
  nodeCanvas?: typeof nodeCanvas;
  jsdom?: typeof JSDOM;
  qrOptions?: {
    typeNumber?: TypeNumber;
    mode?: Mode;
    errorCorrectionLevel?: ErrorCorrectionLevel;
  };
  imageOptions?: {
    saveAsBlob?: boolean;
    hideBackgroundDots?: boolean;
    imageSize?: number;
    crossOrigin?: string;
    margin?: number;
  };
  dotsOptions?: {
    type?: DotType;
    color?: string;
    gradient?: Gradient;
    roundSize?: boolean;
  };
  cornersSquareOptions?: {
    type?: CornerSquareType;
    color?: string;
    gradient?: Gradient;
  };
  cornersDotOptions?: {
    type?: CornerDotType;
    color?: string;
    gradient?: Gradient;
  };
  backgroundOptions?: {
    round?: number;
    color?: string;
    gradient?: Gradient;
  };
  plugins?: PluginOptions[];
};

export type FilterFunction = (row: number, col: number) => boolean;

export type DownloadOptions = {
  name?: string;
  extension?: FileExtension;
};

export type DrawArgs = {
  x: number;
  y: number;
  size: number;
  rotation?: number;
  getNeighbor?: GetNeighbor;
};

export type BasicFigureDrawArgs = {
  x: number;
  y: number;
  size: number;
  rotation?: number;
};

export type RotateFigureArgs = {
  x: number;
  y: number;
  size: number;
  rotation?: number;
  draw: () => void;
};

export type GetNeighbor = (x: number, y: number) => boolean;

export type ExtensionFunction = (svg: SVGElement, options: Options) => void;

export interface IPluginTemplate<T> {
  new (...args: any[]): PluginClass<T>;
}
export abstract class PluginTemplate<T> {
  // "name" must be same as class name
  abstract name: string;

  _options: UnknownObject;
  app: T;
  isLoaded: boolean = false;

  constructor(app: T) {
    this.app = app;
    this._options = {};
  }

  abstract load(): Promise<void>;
  abstract unload(): Promise<void>;
  getConfig(): UnknownObject {
    return this._options;
  }
  updateConfig(newConfig?: UnknownObject): void {
    if (!newConfig){
      return;
    }
    this._options = newConfig;
  }
  abstract render(): Promise<void>;
}

// export type PluginClass = typeof PluginTemplate;
export type PluginClass<T> = PluginTemplate<T> & { new(...args: any[]): PluginClass<T> };

export class PluginManager<T> {
  private _registeredPlugins: PluginClass<T>[] = [];
  private _loadedPlugins: PluginClass<T>[] = [];
  
  register(plugin: PluginClass<T>) {
    // console.error('Pushing plugin to plugin manager: ', plugin);
    this._registeredPlugins.push(plugin);
  }
  
  getPlugin(pluginClassName: string): PluginClass<T> | null {
    let plugin = this._registeredPlugins.find(plugin => plugin.name === pluginClassName);
    if (!plugin) 
      return null;
    
    return plugin;
  }
  
  getLoadedPlugin(pluginClassName: string): PluginClass<T> | null {
    let plugin = this._loadedPlugins.find(plugin => plugin.name === pluginClassName);
    if (!plugin) 
      return null;
    
    return plugin;
  }
  
  async load(plugin: PluginClass<T>) {
    // console.error('Loaded plugins: ', this._loadedPlugins);
    const loadedPlugin = this.getLoadedPlugin(plugin.name);
    if (!loadedPlugin){
      this._loadedPlugins.push(plugin);
      await plugin.load();
    }
  }
  
  // async unload(pluginName: string) {
  //   let plugin = this._loadedPlugins.find(plugin => plugin.name === pluginName);
  //   if (!plugin) 
  //     return false;

  //   await plugin.unload();
    
  //   return true;
  // }

  async unloadAll() {
    for (let plugin of this._loadedPlugins) {
      await plugin.unload();
    }
    this._loadedPlugins = [];
  }
}

