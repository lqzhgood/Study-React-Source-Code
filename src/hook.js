import { emitUpdateForHooks } from './react-dom';

const states = [];
let hookIndex = 0;

export function resetHookIndex() {
    hookIndex = 0;
}

export function useState(initValue) {
    states[hookIndex] = states[hookIndex] ?? initValue;
    const currentIndex = hookIndex;
    function setState(newState) {
        states[currentIndex] = newState;
        emitUpdateForHooks();
    }

    return [states[hookIndex++], setState];
}

export function useReducer(reducer, initialValue) {
    states[hookIndex] = states[hookIndex] ?? initialValue;
    const currentIndex = hookIndex;
    function dispatch(action) {
        states[currentIndex] = reducer(states[currentIndex], action);
        emitUpdateForHooks();
    }
    return [states[currentIndex], dispatch];
}

export function useEffect(effectFn, deps = []) {
    const currentIndex = hookIndex;
    const [destroyFn, preDeps] = states[hookIndex] || [null, null];
    if (!states[hookIndex] || deps.some((v, i) => v !== preDeps[i])) {
        setTimeout(() => {
            destroyFn?.();
            states[currentIndex] = [effectFn(), deps];
        }, 4);
    }

    hookIndex++;
}

export function useLayoutEffect(effectFn, deps = []) {
    const currentIndex = hookIndex;
    const [destroyFn, preDeps] = states[hookIndex] || [null, null];
    if (!states[hookIndex] || deps.some((v, i) => v !== preDeps[i])) {
        queueMicrotask(() => {
            destroyFn?.();
            states[currentIndex] = [effectFn(), deps];
        }, 4);
    }

    hookIndex++;
}

export function useRef(initialValue) {
    states[hookIndex] = states[hookIndex] ?? { current: initialValue };
    return states[hookIndex++];
}

export function useImperativeHandle(ref, dataFactory) {
    ref.current = dataFactory();
}
export function useMemo(fn, deps = []) {
    let [preData, preDeps] = states[hookIndex] || [null, null];
    if (!states[hookIndex] || deps.some((v, i) => v !== preDeps[i])) {
        const newData = fn();
        states[hookIndex++] = [newData, deps];
        return newData;
    } else {
        hookIndex++;
        return preData;
    }
}

export function useCallback(cb, deps = []) {
    let [preCb, preDeps] = states[hookIndex] || [null, null];

    if (!states[hookIndex] || deps.some((v, i) => v !== preDeps[i])) {
        states[hookIndex++] = [cb, deps];
        return cb;
    } else {
        hookIndex++;
        return preCb;
    }
}
