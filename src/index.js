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
    var onCancel = function onCancel (handleCancel) {
      return cancel.then(
        handleCancel,
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
