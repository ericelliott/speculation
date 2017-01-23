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

  return new Promise(function (resolve, reject) {
    // Track if the promise becomes resolved or rejected to
    // avoid invoking onCancel after a promise becomes completed.
    var completed = false;

    // When the callsite resolves, mark the promise as completed.
    var resolver = function resolver (input) {
      completed = true;
      resolve(input);
    };

    // When the callsite rejects, mark the promise as completed.
    var rejecter = function rejecter (input) {
      completed = true;
      reject(input);
    };

    var onCancel = function onCancel (handleCancel) {
      // Notify the cancellation if the promise has not completed.
      var handleCancelIfCompleted = function handleCancelIfCompleted () {
        if (!completed) {
          handleCancel();
        }
      };

      return cancel.then(
        handleCancelIfCompleted,
        // Ignore expected cancel rejections:
        noop
      )
      // handle onCancel errors
      .catch(function (e) {
        return reject(e);
      });
    };

    fn(resolver, rejecter, onCancel);
  });
};

module.exports = speculation;
