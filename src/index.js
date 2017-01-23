var speculation = function speculation (fn) {
  var cancel = (
    arguments.length > 1 &&
    arguments[1] !== undefined
  ) ? arguments[1] : Promise.reject('Cancelled');

  return new Promise(function (resolve, reject) {
    var noop = function noop () {};

    var handleCancel = function handleCancel (onCancel) {
      return cancel.then(
        onCancel,
        noop
      ).catch(function (e) {
        return reject(e);
      });
    };

    return fn(resolve, reject, handleCancel);
  });
};

module.exports = speculation;
