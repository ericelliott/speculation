# Speculation

JavaScript promises are made to be broken. Speculations are cancellable promises.

A speculation is an ES6 standard promise that works as a drop-in replacement anywhere promises can be used. Unlike many other cancel solutions, it does not add any properties or methods to the promise API, so it really will be compatible with whatever promise-consuming tools you use.

## Status

Should work in production apps, but is not production tested yet. Please kick the tires and report any issues you encounter.


## Getting started

Install:

```
npm install --save speculation
```

Use:

Let's use it to create a cancellable `wait()` function. It'll take `time` in ms, and a promise to use as `shouldCancel`. When the time runs out, the promise will resolve. If the wait is cancelled, the returned promise will reject with a 'Cancelled' error.

```js
import speculation from 'speculation';

const wait = (
  time,
  cancel = Promise.reject('Cancelled') // By default, don't cancel
) => speculation((resolve, reject, onCancel) => {
  const timer = setTimeout(resolve, time);

  // Use onCancel to clean up any lingering resources
  // and then call reject(). You can pass a custom reason.
  onCancel(() => {
    clearTimeout(timer);
    reject(new Error('Cancelled'));
  });
}, cancel); // remember to pass in cancel!

wait(200, wait(500)).then(
  () => console.log('Hello!'),
  (e) => console.log(e)
); // 'Hello!'

wait(200, wait(50)).then(
  () => console.log('Hello!'),
  (e) => console.log(e)
); // [Error: Cancelled]
```

## What is a Speculation?

A speculation is exactly like a promise, except for these changes:

* Speculations can be easily cancelled. Simply pass a `shouldCancel` promise into the speculation during creation.
* `new` is not required when creating a speculation. (That would be extra typing for no benefit).

The signature is:

```js
speculation(fn: PromiseFunction, shouldCancel: Promise) => Promise

// Similar to the function passed into the Promise constructor.
// A function to pass into speculation() which
// performs promise setup, resolve, reject, and cleanup.
PromiseFunction(resolve: Function, reject: Function, handleCancel: Function) => Void
```

As you can see from the signature, **speculations are promises**, meaning they share exactly the same promise interface. Anything that understands promises can use speculations instead. There are no extra properties on speculation objects.


## Why?

Promises don't have a built-in cancel mechanism. Many people hack it in in various ways. Here are some problems I've seen with those hacks:

### Adding .cancel() to the promise

Adding `.cancel()` makes the promise non-standard, but it also violates another rule of promises: Only the function that creates the promise should be able to resolve, reject, or cancel the promise. Exposing it breaks that encapsulation, and encourages people to write code that manipulates the promise in places that shouldn't know about it. Avoid spaghetti and broken promises.

### Forgetting to clean up

Some clever people have figured out that there's a way to use `Promise.race()` as a cancellation mechanism. The problem with that is that cancellation control is taken from the function that creates the promise, which is the only place that you can conduct proper cleanup activities, such as clearing timeouts or freeing up memory by clearing references to data, etc...

### Forgetting to handle a rejected cancel promise

Did you know that Chrome throws warning messages all over the console when you forget to handle a promise rejection? Oops! `speculation()` handles that for you, so you can get on with building your app.

### Overly complex

The [withdrawn TC39 proposal](https://github.com/tc39/proposal-cancelable-promises) for cancellation proposed a separate messaging channel for cancellations. It also used a new concept called a cancellation token. In my opinion, the solution would have considerably bloated the promise spec, and the only feature it would have provided that speculations don't directly support is the separation of rejections and cancellations, which, IMO, is not necessary to begin with.

Will you want to do switching depending on whether there is an exception, or a cancellation? Yes, absolutely. Is that the promise's job? In my opinion, no, it's not.

## How does it work?

Basically, like this:

```js
const speculation = (
  fn,
  cancel = new Promise.reject('Cancelled') // No cancel by default
) => new Promise((resolve, reject) => {
  const noop = () => {}; // Prevent unhandled rejections

  const handleCancel = (
    onCancel
  ) => cancel.then(onCancel, noop);

  fn(resolve, reject, handleCancel);
});
```

The actual implementation is different in order to support old browsers, but this is the gist. It's basically a thin wrapper around a call to the native `Promise` constructor. It exposes a very similar API to the native `Promise` constructor, dropping the `new` requirement (because it's extra typing for no benefit), and taking one extra parameter to handle promise cancellation.


# Bonus

See that `wait()` utility in these docs? You can use it by importing it:

```js
import wait from 'speculation/wait';

wait(500).then(() => {
  console.log('OMG I can time things!');
});

// Of course, you can cancel it by resolving
// the `shouldCancel` promise:
wait(200, wait(50)).then(
  () => {
    console.log('nothing to see here'); // never runs
  },
  (e) => console.log(e) // [Error: Cancelled]
);
```
