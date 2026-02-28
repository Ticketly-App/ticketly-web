declare module 'qrcode' {
  export function toCanvas(
    canvas: HTMLCanvasElement,
    text: string,
    options?: Record<string, unknown>,
    callback?: (error: Error | null) => void,
  ): Promise<void>

  export function toDataURL(
    text: string,
    options?: Record<string, unknown>,
  ): Promise<string>

  export function toString(
    text: string,
    options?: Record<string, unknown>,
  ): Promise<string>
}
