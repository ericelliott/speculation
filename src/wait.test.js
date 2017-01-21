const test = require('tape');
const wait = require('./wait');

test('wait', assert => {
  const msg = 'should not resolve before x ms';
  let resolved = false;
  const expected = false;

  wait(40).then(() => {
    resolved = true;
  });

  setTimeout(() => {
    const actual = resolved;
    assert.equal(actual, expected, msg);
    assert.end();
  }, 20);
});

test('wait', assert => {
  const msg = 'should resolve after x ms';

  wait(40).then(() => {
    assert.pass(msg);
    assert.end();
  });
});
