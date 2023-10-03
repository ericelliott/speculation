const test = require('tape');
const speculation = require('./index');
const wait = require('./wait');

require('./wait.test.js');
require('./fromPromise.test.js');

test('speculation with resolved shouldCancel', assert => {
  const msg = 'should call handleCancel';
  speculation((resolve, reject, handleCancel) => {
    handleCancel(() => {
      assert.pass(msg);
      assert.end();
    });
  }, Promise.resolve());
});

test('speculation cancelled too late', assert => {
  const msg = 'should resolve';
  wait(200, wait(500)).then(
    () => {
      assert.pass(msg);
      assert.end();
    },
    () => {
      assert.fail(msg);
      assert.end();
    }
  );
});

test('speculation cancelled on time', assert => {
  const msg = 'should reject';
  wait(200, wait(50)).then(
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

test('speculation that throws in onCancel', assert => {
  const msg = 'should handle onCancel error';

  const faultyWait = (
    time,
    cancel = Promise.resolve()
  ) => speculation((resolve, reject, onCancel) => {
    onCancel(() => {
      throw new Error('Oops!');
    });
  }, cancel);

  faultyWait(30).catch(e => {
    const actual = e.message;
    const expected = 'Oops!';

    assert.same(actual, expected, msg);
    assert.end();
  });
});

test('speculation promise resolved before cancel', assert => {
  const msg = 'onCancel should not run';

  const testWait = (
    time,
    cancel = Promise.resolve()
  ) => speculation((resolve, reject, onCancel) => {
    onCancel(() => {
      assert.fail(msg);
    });
    setTimeout(resolve, time);
  }, cancel);

  testWait(20, wait(50)).then(() => {
    assert.pass('success callback should be called');
  });

  wait(60).then(() => {
    assert.end();
  });
});
