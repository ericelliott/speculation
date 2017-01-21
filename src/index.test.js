const test = require('tape');
const speculation = require('./index');
const wait = require('./wait');

require('./wait.test.js');

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
