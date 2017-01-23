var noop = function noop () {};

// HOF Wraps the native Promise API
// to add take a shouldCancel promise and add
// an onCancel() callback.
var speculation = function speculation (fn) {
  // Don't cancel by default
  var cancel = (
    arguments.length > 1 &&
    arguments[1] !== undefined
  ) ? arguments[1] : Promise.reject();

  return new Promise(function (_resolve, _reject) {
    // Track if the promise becomes resolved or rejected to
    // avoid invoking onCancel after a promise becomes isFulfilled.
    var isFulfilled = false;

    // When the callsite resolves, mark the promise as fulfilled.
    var resolve = function resolver (input) {
      isFulfilled = true;
      _resolve(input);
    };

    // When the callsite rejects, mark the promise as fulfilled.
    var reject = function rejecter (input) {
      isFulfilled = true;
      _reject(input);
    };

    var onCancel = function onCancel (handleCancel) {
      var maybeHandleCancel = function (value) {
        if (!isFulfilled) handleCancel(value);
      };

      return cancel.then(
        maybeHandleCancel,
        // Ignore expected cancel rejections:
        noop
      )
      // handle onCancel errors
      .catch(function (e) {
        return reject(e);
      });
    };

    fn(resolve, reject, onCancel);
  });
};

module.exports = speculation;
