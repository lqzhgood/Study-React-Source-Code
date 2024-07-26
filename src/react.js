import { REACT_ELEMENT, REACT_FORWARD_REF, toVNode, REACT_MEMO } from './const';
import { shallowEqual } from './utils';
import { Component } from './Component';

export * from './hook';

function createElement(type, properties, children) {
    let ref = properties.ref || null;
    let key = properties.key || null;

    ['key', 'ref', '__self', '__source'].forEach(k => {
        delete properties[k];
    });

    let props = { ...properties };

    if (arguments.length > 3) {
        props.children = Array.prototype.slice.call(arguments, 2).map(toVNode);
    } else {
        props.children = toVNode(children);
    }

    return {
        $$typeof: REACT_ELEMENT,
        type,
        ref,
        key,
        props,
    };
}

function createRef() {
    return {
        current: null,
    };
}

function forwardRef(render) {
    return {
        $$typeof: REACT_FORWARD_REF,
        render,
    };
}

function memo(type, compare = shallowEqual) {
    return {
        $$typeof: REACT_MEMO,
        type,
        compare,
    };
}

const React = {
    createElement,
    Component,
    createRef,
    forwardRef,
    memo,
};

export default React;
