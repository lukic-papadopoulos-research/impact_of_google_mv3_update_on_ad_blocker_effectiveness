"use strict";

function defineConstant(chain = '', rawValue = '', ...rest) {
  if (chain === '') {
    return;
  }
  const safe = safeSelf();
  const extraArgs = safe.getExtraArgs([chain, rawValue, ...rest], 3);
  function setConstantFn(chainVal, rawVal) {
    const trappedProp = (() => {
      const pos = chainVal.lastIndexOf('.');
      return pos === -1 ? chainVal : chainVal.slice(pos + 1);
    })();
    const cloakFunction = fn => {
      safe.Object_defineProperty(fn, 'name', {
        value: trappedProp
      });
      return new Proxy(fn, {
        defineProperty(target, prop, ...args) {
          return prop !== 'toString' ? Reflect.defineProperty(target, prop, ...args) : true;
        },
        deleteProperty(target, prop) {
          return prop !== 'toString' ? Reflect.deleteProperty(target, prop) : true;
        },
        get(target, prop, ...args) {
          return prop === 'toString' ? () => `function ${trappedProp}() { [native code] }` : Reflect.get(target, prop, ...args);
        }
      });
    };
    if (trappedProp === '') {
      return;
    }
    const thisScript = document.currentScript;
    let normalValue = getValidatedConstant(true, rawVal);
    if (rawVal === 'noopFunc' || rawVal === 'trueFunc' || rawVal === 'falseFunc') {
      normalValue = cloakFunction(normalValue);
    }
    let aborted = false;
    const mustAbort = val => {
      if (aborted) {
        return true;
      }
      aborted = val !== undefined && val !== null && normalValue !== undefined && normalValue !== null && typeof val !== typeof normalValue;
      return aborted;
    };
    const trapProperty = (owner, prop, configurable, handler) => {
      if (!handler.init(configurable ? owner[prop] : normalValue)) {
        return;
      }
      const originalDescriptor = safe.Object_getOwnPropertyDescriptor(owner, prop);
      let previousGetter;
      let previousSetter;
      if (originalDescriptor instanceof Object) {
        owner[prop] = normalValue;
        if (originalDescriptor.get instanceof Function) {
          previousGetter = originalDescriptor.get;
        }
        if (originalDescriptor.set instanceof Function) {
          previousSetter = originalDescriptor.set;
        }
      }
      try {
        safe.Object_defineProperty(owner, prop, {
          configurable,
          get() {
            return previousGetter ? previousGetter() : handler.getter();
          },
          set(newValue) {
            if (previousSetter) {
              previousSetter(newValue);
            }
            handler.setter(newValue);
          }
        });
      } catch (ex) {}
    };
    const trapChain = (owner, chainValue) => {
      const pos = chainValue.indexOf('.');
      if (pos === -1) {
        trapProperty(owner, chainValue, false, {
          value: undefined,
          init(val) {
            if (mustAbort(val)) {
              return false;
            }
            this.value = val;
            return true;
          },
          getter() {
            return document.currentScript === thisScript ? this.value : normalValue;
          },
          setter(newValue) {
            if (!mustAbort(newValue)) {
              return;
            }
            normalValue = newValue;
          }
        });
        return;
      }
      const prop = chainValue.slice(0, pos);
      const val = owner[prop];
      chainValue = chainValue.slice(pos + 1);
      if (val instanceof Object || typeof val === 'object' && val !== null) {
        trapChain(val, chainValue);
        return;
      }
      trapProperty(owner, prop, true, {
        value: undefined,
        init(value) {
          this.value = value;
          return true;
        },
        getter() {
          return this.value;
        },
        setter(newValue) {
          this.value = newValue;
          if (newValue instanceof Object) {
            trapChain(newValue, chainValue);
          }
        }
      });
    };
    trapChain(window, chainVal);
  }
  scheduleExecution(() => {
    setConstantFn(chain, rawValue);
  }, extraArgs.runAt ?? '');
}