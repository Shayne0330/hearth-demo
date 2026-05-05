export {};

declare global {
  interface Window {
    hearthDesktop?: {
      isDesktop: boolean;
      setExpanded(expanded: boolean): Promise<void>;
      moveBy(dx: number, dy: number): Promise<void>;
      close(): Promise<void>;
    };
  }
}
