import 'mocha';

import { Readable } from 'stream';
import * as StreamTest from 'streamtest';
import { expect, use as chaiUse } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chaiUse(chaiAsPromised);

import getSizeTransform from '../src/index';

const consumeStream = (stream: Readable): Promise<Array<StreamTest.NonNull>> =>
  new Promise((resolve, reject) => {
    const outputStream = StreamTest.v2.toObjects((error, objects) => {
      return error ? reject(error) : resolve(objects);
    });

    stream.pipe(outputStream);
  });

describe('GetSizeTransform', () => {
  it('should initially set size to 0', () => {
    const inputStream = StreamTest.v2.fromChunks(['single demo chunk']);
    const transformedStream = inputStream.pipe(getSizeTransform());

    expect(transformedStream).to.have.property('sizeInBytes', 0);
  });

  it('should add bytes to transform object', async () => {
    const inputStream = StreamTest.v2.fromChunks(['single demo chunk']);
    const transformedStream = inputStream.pipe(getSizeTransform());

    await consumeStream(transformedStream);

    expect(transformedStream).to.have.property('sizeInBytes', 17);
  });

  it('should preserve original content', async () => {
    const inputStream = StreamTest.v2.fromChunks(['single demo chunk']);
    const transformedStream = inputStream.pipe(getSizeTransform());

    await expect(consumeStream(transformedStream)).to.eventually.be.deep.equal([
      Buffer.from('single demo chunk'),
    ]);
  });

  it('should emit an error if maximum is reached', async () => {
    const inputStream = StreamTest.v2.fromChunks(['single demo chunk']);
    const transformedStream = inputStream.pipe(getSizeTransform(10));

    const promise = new Promise((resolve, reject) => {
      transformedStream.on('end', () => resolve());
      transformedStream.on('error', (error) => reject(error));
    });

    await expect(promise).to.eventually.be.rejectedWith(
      'Stream exceeded maximum size of 10 bytes (17 bytes found).',
    );
  });
});
