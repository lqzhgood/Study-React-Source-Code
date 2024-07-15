import { REACT_ELEMENT } from './const';
import { addEvent } from './event';

function render(VNode, containerDom) {
    mount(VNode, containerDom);
}

function mount(VNode, containerDom) {
    let newDOM = createDOM(VNode);

    if (newDOM) {
        containerDom.appendChild(newDOM);
    }
}

function mountArray(children, parent) {
    if (!Array.isArray(children)) return;

    for (let i = 0; i < children.length; i++) {
        const elm = children[i];

        if (typeof elm === 'string') {
            parent.appendChild(document.createTextNode(elm));
        } else {
            mount(elm, parent);
        }
    }
}

function getDomByFunctionComponent(VNode) {
    let { type, props } = VNode;

    let renderVNode = type(props);
    if (!renderVNode) return null;
    return createDOM(renderVNode);
}

function getDomByClassComponent(VNode) {
    let { type, props } = VNode;

    const instance = new type(props);
    let renderVNode = instance.render();
    instance.oldVNode = renderVNode;
    if (!renderVNode) return;

    return createDOM(renderVNode);
}

function createDOM(VNode) {
    const { type, props } = VNode;
    let dom;

    if (
        typeof type === 'function' &&
        VNode.$$typeof === REACT_ELEMENT &&
        type.IS_CLASS_COMPONENT
    ) {
        return getDomByClassComponent(VNode);
    }

    if (typeof type === 'function' && VNode.$$typeof === REACT_ELEMENT) {
        return getDomByFunctionComponent(VNode);
    }

    if (type && VNode.$$typeof === REACT_ELEMENT) {
        dom = document.createElement(type);
    }

    if (props) {
        if (typeof props.children === 'object' && props.children.type) {
            mount(VNode, dom);
        } else if (Array.isArray(props.children)) {
            mountArray(props.children, dom);
        } else if (typeof props.children === 'string') {
            dom.appendChild(document.createTextNode(props.children));
        }
    }

    setPropsForDOM(dom, props);

    VNode.dom = dom;

    return dom;
}

function setPropsForDOM(dom, props = {}) {
    if (!dom) return;
    Object.entries(props).forEach(([key, value]) => {
        if (key === 'children') return;

        if (/^on[A-Z].*/.test(key)) {
            addEvent(dom, key.toLowerCase(), value);
            return;
        }

        if (key === 'style') {
            Object.keys(value).forEach(
                styleName => (dom.style[styleName] = props.style[styleName])
            );
            return;
        }

        dom[key] = value;
    });
}

export function findDomByVNode(VNode) {
    if (!VNode) return;
    if (VNode.dom) return VNode.dom;
}

export function updateDomTree(oldDom, newVNode) {
    let parentNode = oldDom.parentNode;
    parentNode.removeChild(oldDom);
    parentNode.appendChild(createDOM(newVNode));
}

const ReactDom = {
    render,
};

export default ReactDom;
