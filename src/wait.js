var speculation = require('./index');

var wait = function wait (time) {
  var cancel = (arguments.length > 1 && arguments[1] !== undefined) ?
    arguments[1] : Promise.reject();

  return speculation(function (resolve, reject, onCancel) {
    var timer = setTimeout(resolve, time);

    onCancel(function () {
      clearTimeout(timer);
      reject(new Error('Cancelled'));
    });
  }, cancel);
};

module.exports = wait;
