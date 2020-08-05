global.XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const { SpaceClient } = require('@fleekhq/space-client');

// default port exposed by the daemon for client connection is 9998

const client = new SpaceClient({
    url: 'http://0.0.0.0:9998',
    defaultBucket: 'cardinalBucketTest_5',
});


client
    .createBucket({ slug: 'cardinalBucketTest_5'})
    //or user bucket
    .then((res) => {
      const bucket = res.getBucket();
      console.log(bucket.getKey());
      console.log(bucket.getName());
      console.log(bucket.getPath());
      console.log(bucket.getCreatedat());
      console.log(bucket.getUpdatedat());
    })
    .catch((err) => {
      console.error(err);
    });