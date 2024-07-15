import { flushUpdaterQueue, updaterQueue } from './Component';

export function addEvent(dom, eventName, bindFn) {
    dom.attach = dom.attach || {};
    dom.attach[eventName] = bindFn;

    if (document[eventName]) return;
    document[eventName] = dispatchEvent;
}

function dispatchEvent(nativeEvent) {
    updaterQueue.isBatch = true;

    let syntheticEvent = createSyntheticEvent(nativeEvent);

    let target = nativeEvent.target;

    while (target) {
        syntheticEvent.currentTarget = target;
        let eventName = `on${nativeEvent.type}`;
        let bindFn = target.attach && target.attach[eventName];
        bindFn && bindFn(syntheticEvent);

        if (syntheticEvent.isPropagationStopped) {
            break;
        }
        target = target.parentNode;
    }

    flushUpdaterQueue();
}

function createSyntheticEvent(nativeEvent) {
    let nativeEventKeyValues = {};

    for (const key in nativeEvent) {
        nativeEventKeyValues[key] =
            typeof nativeEvent[key] === 'function'
                ? nativeEvent[key].bind(nativeEvent)
                : nativeEvent;
    }

    let syntheticEvent = Object.assign(nativeEventKeyValues, {
        nativeEvent,
        isDefaultPrevented: false,
        isPropagationStopped: false,
        preventDefault: function () {
            this.isDefaultPrevented = true;
            if (this.nativeEvent.preventDefault) {
                this.nativeEvent.preventDefault();
            } else {
                this.nativeEvent.returnValue = false;
            }
        },
        stopPropagation: function () {
            this.isPropagationStopped = true;
            if (this.nativeEvent.stopPropagation) {
                this.nativeEvent.preventDefault();
            } else {
                this.nativeEvent.cancelBubble = true;
            }
        },
    });

    return syntheticEvent;
}
