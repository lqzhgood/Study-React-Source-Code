import { findDomByVNode, updateDomTree } from './react-dom';

export const updaterQueue = {
    isBatch: false,
    updaters: new Set(),
};
export function flushUpdaterQueue() {
    updaterQueue.isBatch = false;
    for (const u of updaterQueue.updaters) {
        u.launchUpdate();
    }
    updaterQueue.updaters.clear();
}

class Updater {
    constructor(ClassComponentInstance) {
        this.ClassComponentInstance = ClassComponentInstance;
        this.pendingStates = [];
    }
    addState(partialState) {
        this.pendingStates.push(partialState);
        this.preHandleForUpdate();
    }
    preHandleForUpdate() {
        if (updaterQueue.isBatch) {
            updaterQueue.updaters.add(this);
        } else {
            this.launchUpdate();
        }
    }
    launchUpdate() {
        const { ClassComponentInstance, pendingStates } = this;
        if (pendingStates.length === 0) return;
        ClassComponentInstance.state = this.pendingStates.reduce(
            (pre, cV) => ({ ...pre, ...cV }),
            ClassComponentInstance.state
        );
        this.pendingStates.length = 0;
        ClassComponentInstance.update();
    }
}

export class Component {
    static IS_CLASS_COMPONENT = true;
    oldVNode;

    constructor(props) {
        this.updater = new Updater(this);
        this.state = {};
        this.props = props;
    }

    setState(partialState) {
        this.updater.addState(partialState);
    }

    update() {
        let oldVNode = this.oldVNode;
        let oldDom = findDomByVNode(oldVNode);
        let newVNode = this.render();
        updateDomTree(oldVNode, newVNode, oldDom);
        this.oldVNode = newVNode;
    }
}
