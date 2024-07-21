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
    launchUpdate(nextProps) {
        const { ClassComponentInstance, pendingStates } = this;
        if (pendingStates.length === 0 && !nextProps) return;
        let isShouldUpdate = true;
        let nextState = this.pendingStates.reduce((preState, newState) => {
            return {
                ...preState,
                ...newState,
            };
        }, ClassComponentInstance.state);

        if (
            ClassComponentInstance.shouldComponentUpdate &&
            !ClassComponentInstance.shouldComponentUpdate(nextProps, nextState)
        ) {
            isShouldUpdate = false;
        }
        this.pendingStates.length = 0;
        if (nextProps) ClassComponentInstance.props = nextProps;
        ClassComponentInstance.state = nextState;
        if (isShouldUpdate) ClassComponentInstance.update();
    }
}

export class Component {
    static IS_CLASS_COMPONENT = true;

    constructor(props) {
        this.updater = new Updater(this);
        this.state = {};
        this.props = props;
    }

    setState(partialState) {
        this.updater.addState(partialState);
    }

    update() {
        // 1. 获取重新执行render函数后的虚拟DOM 新虚拟DOM
        // 2. 根据新虚拟DOM生成新的真实DOM
        // 3. 将真实DOM挂载到页面上
        let oldVNode = this.oldVNode;
        let oldDOM = findDomByVNode(oldVNode);
        console.log('this', this);
        if (this.constructor.getDerivedStateFromProps) {
            let newState =
                this.constructor.getDerivedStateFromProps(
                    this.props,
                    this.state
                ) || {};
            this.state = { ...this.state, ...newState };
        }
        let newVNode = this.render();
        updateDomTree(oldVNode, newVNode, oldDOM);
        this.oldVNode = newVNode;
        if (this.componentDidUpdate) {
            this.componentDidUpdate(this.props, this.state);
        }
    }
}
