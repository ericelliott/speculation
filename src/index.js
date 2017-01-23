var speculation = function speculation (fn) {
  // Don't cancel by default:
  var cancel = (
    arguments.length > 1 &&
    arguments[1] !== undefined
  ) ? arguments[1] : Promise.reject();

  return new Promise(function (resolve, reject) {
    var noop = function noop () {};

    var handleCancel = function handleCancel (onCancel) {
      return cancel.then(
        onCancel,
        // Filter out the expected "not cancelled" rejection:
        noop
      ).catch(function (e) {
        // Reject the speculation if there's a an error in
        // onCancel:
        return reject(e);
      });
    };

    return fn(resolve, reject, handleCancel);
  });
};

module.exports = speculation;
