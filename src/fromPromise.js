var speculation = require('./index');

// Statically initialize a speculation
var fromPromise = function fromPromise (promise, cancel, handleCancel) {
  return speculation((resolve, reject, onCancel) => {
    promise.then(resolve);
    promise.catch(reject);
    onCancel(handleCancel);
  }, cancel);
};

module.exports = fromPromise;
