`stream-size` is a non-destructive transformation for Node.js streams that adds a `sizeInBytes` property to your streams.

It also allows you to limit streams exceeding a maximum size.

## Usage

```ts
import { Readable } from 'stream';
import { createWriteStream } from 'fs';
import getSizeTransform from 'stream-size';

const MAX_SIZE_ALLOWED_IN_BYTES = 10 * 1024 * 1024; // 10 MB

const downloadResource = (resourceInputStream: Readable) => {
  // Note that no maximum size is required, if you don't pass a value the stream won't be limited.
  const pipedStream = resourceInputStream.pipe(
    getSizeTransform(MAX_SIZE_ALLOWED_IN_BYTES),
  );

  const localFileWriteStream = createWriteStream('temp-file');
  pipedStream.pipe(localFileWriteStream);

  localFileWriteStream.on('close', () => {
    console.log(
      `Input resource completed read! It has ${pipedStream.sizeInBytes} bytes.`,
    );
    // Now you can do something with 'tmp-file' if you want
  });
};
```

## Use cases

Sometimes you need a remote resource content-length but the server does not send back that header.
This usually happens when trying to upload a third-party resource to an S3 bucket.

In order to get the size of the resource you can pipe it to the local machine filesystem and get the size, however, if the resource is provided by a malicious actor you could end up filling your machine's disk and crashing the system.

To prevent that you need to stop downloading the resource when a maximum size is reached.

This package supports it, as well as directly returning the content-length of the input stream in a single operation.
