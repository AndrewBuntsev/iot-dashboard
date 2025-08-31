import { CompressionTypes } from 'kafkajs';
import lz4 from 'lz4'


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

export class KafkaJSLZ4 {
  constructor(public readonly codec?: any) {
    this.codec = () => {
      return {
        compress: this.compress,
        decompress: this.decompress
      };
    };
  }

  compress(encoder: any) {
    return lz4.encode(encoder.buffer);
  }

  decompress(buffer: any) {
    return lz4.decode(buffer);
  }
}