const test = require('tape');
const fromPromise = require('./fromPromise');

const testWait = time => new Promise(resolve => setTimeout(resolve, time));

test('fromPromise', assert => {
  const msg = 'should reject';

  fromPromise(
    testWait(20),
    testWait(10)
  ).then(
    () => {
      assert.fail(msg);
      assert.end();
    },
    () => {
      assert.pass(msg);
      assert.end();
    }
  );
});
