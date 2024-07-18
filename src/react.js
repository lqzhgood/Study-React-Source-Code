import { REACT_ELEMENT, REACT_FORWARD_REF, toVNode } from './const';

import { Component } from './Component';

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

const React = {
    createElement,
    Component,
    createRef,
    forwardRef,
};

export default React;
