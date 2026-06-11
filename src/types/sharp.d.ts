declare module "sharp" {
  interface SharpInstance {
    rotate(): SharpInstance;
    resize(options: {
      width: number;
      withoutEnlargement?: boolean;
    }): SharpInstance;
    jpeg(options?: { quality?: number; mozjpeg?: boolean }): SharpInstance;
    toBuffer(): Promise<Buffer>;
  }

  function sharp(input?: Buffer | Uint8Array): SharpInstance;
  export default sharp;
}
