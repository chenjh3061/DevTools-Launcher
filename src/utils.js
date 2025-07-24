export function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

export function throttle(fn, delay) {
  let timer = null;
  return function (...args) {
    if (!timer) {
        timer = setTimeout(() => {
            fn.apply(this, args);
            timer = null
        }, delay);
    }
  };
}
