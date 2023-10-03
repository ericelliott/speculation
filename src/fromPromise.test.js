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

test('fromPromise', assert => {
  const msg = 'should handle onCancel error';
  fromPromise(
    testWait(20),
    testWait(10),
    () => {
      throw new Error('onCancel');
    }
  ).then(
    () => {
      assert.fail(msg);
      assert.end();
    },
    (e) => {
      const actual = e.message;
      const expected = 'onCancel';
      assert.same(actual, expected, msg);
      assert.end();
    }
  );
});
