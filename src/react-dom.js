import { REACT_ELEMENT, REACT_FORWARD_REF, REACT_TEXT } from './const';
import { addEvent } from './event';

function render(VNode, containerDom) {
    // debugger;
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
        elm.index = i;
        mount(elm, parent);
    }
}

function getDomByFunctionComponent(VNode) {
    let { type, props } = VNode;

    let renderVNode = type(props);
    if (!renderVNode) return null;
    return createDOM(renderVNode);
}

function getDomByClassComponent(VNode) {
    let { type, props, ref } = VNode;

    const instance = new type(props);
    ref && (ref.current = instance);
    let renderVNode = instance.render();
    instance.oldVNode = renderVNode;
    if (!renderVNode) return;

    return createDOM(renderVNode);
}

function getDomByForwardRefFunction(VNode) {
    const { type, props, ref } = VNode;
    let renderVNode = type.render(props, ref);

    if (!renderVNode) return null;

    return createDOM(renderVNode);
}

function createDOM(VNode) {
    debugger;
    const { type, props, ref } = VNode;
    let dom;

    if (type && type.$$typeof === REACT_FORWARD_REF) {
        return getDomByForwardRefFunction(VNode);
    }

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

    if (type === REACT_TEXT) {
        dom = document.createTextNode(props.text);
    } else if (type && VNode.$$typeof === REACT_ELEMENT) {
        dom = document.createElement(type);
    }

    if (props) {
        if (typeof props.children === 'object' && props.children.type) {
            mount(props.children, dom);
        } else if (Array.isArray(props.children)) {
            mountArray(props.children, dom);
        }
    }

    setPropsForDOM(dom, props);

    VNode.dom = dom;
    ref && (ref.current = dom);

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

export function updateDomTree(oldVNode, newVNode, oldDOM) {
    let parentNode = oldDOM.parentNode;
    // parentNode.removeChild(oldDom);
    // parentNode.appendChild(createDOM(newVNode));

    const typeMap = {
        NO_OPERATE: !oldVNode && !newVNode,
        ADD: !oldVNode && newVNode,
        DELETE: oldVNode && !newVNode,
        REPLACE: oldVNode && newVNode && oldVNode.type !== newVNode.type,
    };

    let UPDATE_TYPE = Object.keys(typeMap).filter(k => typeMap[k])[0];

    switch (UPDATE_TYPE) {
        case 'NO_OPERATE':
            break;
        case 'ADD':
            parentNode.appendChild(createDOM(newVNode));
            break;
        case 'DELETE':
            removeVNode(oldVNode);
            break;
        case 'REPLACE':
            removeVNode(oldVNode);
            parentNode.appendChild(createDOM(newVNode));
            break;
        default:
            deepDOMDiff(oldVNode, newVNode);
            break;
    }
}

function removeVNode(VNode) {
    const currentDOM = findDomByVNode(VNode);
    if (currentDOM) currentDOM.remove();
}

function deepDOMDiff(oldVNode, newVNode) {
    let diffTypeMap = {
        ORIGIN_NODE: typeof oldVNode.type === 'string',
        CLASS_COMPONENT:
            typeof oldVNode.type === 'function' &&
            oldVNode.type.IS_CLASS_COMPONENT,
        FUNCTION_COMPONENT: typeof oldVNode.type === 'function',
        TEXT: oldVNode.type === REACT_TEXT,
    };

    let DIFF_TYPE = Object.keys(diffTypeMap).filter(k => diffTypeMap[k])[0];
    switch (DIFF_TYPE) {
        case 'ORIGIN_NODE':
            let currentDom = (newVNode.dom = findDomByVNode(oldVNode));
            setPropsForDOM(currentDom, newVNode.props);
            updateChildren(
                currentDom,
                oldVNode.props.children,
                newVNode.props.children
            );
            break;
        case 'CLASS_COMPONENT':
            updateClassComponent(oldVNode, newVNode);
            break;
        case 'FUNCTION_COMPONENT':
            updateFunctionComponent(oldVNode, newVNode);
            break;
        case 'TEXT':
            newVNode.dom = findDomByVNode(oldVNode);
            newVNode.dom.textContent = newVNode.props.text;
            break;
        default:
            break;
    }
}

function updateClassComponent(oldVNode, newVNode) {
    const classInstance = (newVNode.classInstance = oldVNode.classInstance);
    classInstance.updater.launchUpdate();
}
function updateFunctionComponent(oldVNode, newVNode) {
    const oldDOM = findDomByVNode(oldVNode);
    if (!oldDOM) return;
    const { type, props } = newVNode;
    let newRenderVNode = type(props);
    updateDomTree(oldVNode.oldRenderVNode, newRenderVNode, oldDOM);
    newRenderVNode.oldRenderVNode = newRenderVNode;
}

function updateChildren(parentDOM, oldVNodeChildren, newVNodeChildren) {
    oldVNodeChildren = [
        Array.isArray(oldVNodeChildren) ? oldVNodeChildren : [oldVNodeChildren],
    ].filter(Boolean);
    newVNodeChildren = [
        Array.isArray(newVNodeChildren) ? newVNodeChildren : [newVNodeChildren],
    ].filter(Boolean);

    let lastNotChangedIndex = -1;
    let oldKeyChildMap = {};
    oldVNodeChildren.forEach((oldVNode, index) => {
        let oldKey = oldVNode && oldVNode.key ? oldVNode.key : index;
        oldKeyChildMap[oldKey] = oldVNode;
    });

    let actions = [];
    newVNodeChildren.forEach((newVNode, index) => {
        newVNode.index = index;
        let newKey = newVNode.key ? newVNode.key : index;
        let oldVNode = oldKeyChildMap[newKey];
        if (oldVNode) {
            deepDOMDiff(oldVNode, newVNode);
            if (oldVNode.index < lastNotChangedIndex) {
                actions.push({
                    type: 'MOVE',
                    oldVNode,
                    newVNode,
                    index,
                });
            }
            delete oldKeyChildMap[newKey];
            lastNotChangedIndex = Math.max(lastNotChangedIndex, oldVNode.index);
        } else {
            actions.push({
                type: 'CREATE',
                newVNode,
                index,
            });
        }
    });
    let VNodeToMove = actions
        .filter(v => v.type === 'MOVE')
        .map(v => v.oldVNode);
    let VNodeToDelete = Object.values(oldKeyChildMap);

    VNodeToMove.concat(VNodeToDelete).forEach(oldVNode => {
        let currentDOM = findDomByVNode(oldVNode);
        currentDOM.remove();
    });

    actions.forEach(v => {
        let { type, oldVNode, newVNode, index } = v;
        let childNodes = parentDOM.childNodes;
        let childNode = childNodes[index];

        const getDomForInsert = () => {
            if (type === 'CREATE') {
                return createDOM(newVNode);
            }
            if (type === 'MOVE') {
                return findDomByVNode(oldVNode);
            }
        };

        if (childNode) {
            parentDOM.insertBefore(getDomForInsert(), childNode);
        } else {
            parentDOM.appendChild(getDomForInsert());
        }
    });
}

const ReactDom = {
    render,
};

export default ReactDom;
