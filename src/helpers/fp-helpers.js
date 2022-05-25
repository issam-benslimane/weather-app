export const pipe = reverseArgs(compose);

// curried list operators
export const map = unboundMethod("map", 2);
export const filter = unboundMethod("filter", 2);
export const filterIn = filter;
export const find = unboundMethod("find", 2);
export const reduce = unboundMethod("reduce", 3);
export const each = unboundMethod("forEach", 2);
export const join = unboundMethod("join", 2);
export const includes = unboundMethod("includes", 2);
export const flatMap = curry(function flatMap(mapperFn, arr) {
  return arr.reduce(function reducer(list, v) {
    return list.concat(mapperFn(v));
  }, []);
});

// ************************************

export function filterOut(predicateFn, arr) {
  return filterIn(not(predicateFn), arr);
}

export function unary(fn) {
  return function onlyOneArg(arg) {
    return fn(arg);
  };
}

export function not(predicate) {
  return function negated(...args) {
    return !predicate(...args);
  };
}

export function reverseArgs(fn) {
  return function argsReversed(...args) {
    return fn(...args.reverse());
  };
}

export function spreadArgs(fn) {
  return function spreadFn(argsArr) {
    return fn(...argsArr);
  };
}

export function partial(fn, ...presetArgs) {
  return function partiallyApplied(...laterArgs) {
    return fn(...presetArgs, ...laterArgs);
  };
}

export function partialRight(fn, ...presetArgs) {
  return function partiallyApplied(...laterArgs) {
    return fn(...laterArgs, ...presetArgs);
  };
}

export function curry(fn, arity = fn.length) {
  return (function nextCurried(prevargs) {
    return function curried(nextArg) {
      const args = [...prevargs, nextArg];

      if (args.length >= arity) {
        return fn(...args);
      } else {
        return nextCurried(args);
      }
    };
  })([]);
}

export function uncurry(fn) {
  return function uncurried(...args) {
    const ret = fn;

    for (let i = 0; i < args.length; i++) {
      ret = ret(args[i]);
    }

    return ret;
  };
}

export function zip(arr1, arr2) {
  const zipped = [];
  arr1 = [...arr1];
  arr2 = [...arr2];

  while (arr1.length > 0 && arr2.length > 0) {
    zipped.push([arr1.shift(), arr2.shift()]);
  }

  return zipped;
}

export function compose(...fns) {
  return fns.reduceRight(function reducer(fn1, fn2) {
    return function composed(...args) {
      return fn2(fn1(...args));
    };
  });
}

export function prop(name, obj) {
  return obj[name];
}

export function setProp(obj, name, val) {
  const o = Object.assign({}, obj);
  o[name] = val;
  return o;
}

export function unboundMethod(methodName, argCount = 2) {
  return curry((...args) => {
    const obj = args.pop();
    return obj[methodName](...args);
  }, argCount);
}

export const trace = curry((tag, x) => {
  console.log(tag, x);
  return x;
});
