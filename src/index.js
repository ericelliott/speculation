var speculation = function speculation (fn, cancel) {
  return new Promise(function (resolve, reject) {
    var noop = function noop () {};

    var handleCancel = function handleCancel (onCancel) {
      return cancel.then(onCancel, noop);
    };

    return fn(resolve, reject, handleCancel);
  });
};

module.exports = speculation;
