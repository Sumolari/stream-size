import { Transform } from 'stream';

export type StreamWithSize = Transform & {
  sizeInBytes: number;
};

/**
 * @param maximumSizeInBytesAllowed Optional. Set this parameter to the maximum amount of bytes before throwing an error and closing the stream. Leave unset to allow any amount of bytes and not apply any limit.
 */
function getSizeTransform(maximumSizeInBytesAllowed?: number): StreamWithSize {
  const transformedStream = new Transform({
    transform(this: StreamWithSize, chunk, encoding: BufferEncoding, callback) {
      const sizeInBytesAfterWritingChunk =
        this.sizeInBytes + Buffer.byteLength(chunk, encoding);

      if (
        maximumSizeInBytesAllowed &&
        sizeInBytesAfterWritingChunk > maximumSizeInBytesAllowed
      ) {
        return callback(
          new Error(
            `Stream exceeded maximum size of ${maximumSizeInBytesAllowed} bytes (${sizeInBytesAfterWritingChunk} bytes found).`,
          ),
        );
      }

      this.sizeInBytes = sizeInBytesAfterWritingChunk;
      callback(null, chunk);
    },
  }) as StreamWithSize;

  transformedStream.sizeInBytes = 0;

  return transformedStream;
}

export default getSizeTransform;
