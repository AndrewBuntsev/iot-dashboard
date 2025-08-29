import { CompressionTypes } from 'kafkajs';
import { decode, encode } from 'lz4'


// Convert string to actual CompressionTypes
export const getCompressionType = (type: string): CompressionTypes => {
  switch (type) {
    case 'gzip':
      return CompressionTypes.GZIP;
    case 'snappy':
      return CompressionTypes.Snappy;
    case 'lz4':
      return CompressionTypes.LZ4;
    case 'zstd':
      return CompressionTypes.ZSTD;
    default:
      return CompressionTypes.None;
  }
};

export const createLZ4Codec = () => {
  const compress = (encoder: any) =>
    new Promise(resolve => {
      const compressedBuffer = encode(encoder.buffer, {})
      resolve(compressedBuffer)
    })

  const decompress = (buffer: Buffer) =>
    new Promise(resolve => {
      const decompressedBuffer = decode(buffer)
      resolve(decompressedBuffer)
    })

  return () => ({
    compress,
    decompress
  })
}