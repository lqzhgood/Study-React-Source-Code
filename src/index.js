import React from './react';
import ReactDOM from './react-dom';

function MyTest(props) {
    return <span>world</span>;
}

const MyTestRef = React.forwardRef((props, ref) => {
    return <input type='text' ref={ref} />;
});

class MyClx extends React.Component {
    counter = 0;

    constructor(props) {
        super(props);
        this.state = { count: '0' };
    }

    updateShowText(newText) {
        this.setState({
            count: newText + '',
        });
    }

    render() {
        return (
            <div>
                Hello
                {/* <span
                    onClick={() => {
                        this.updateShowText(++this.counter);
                    }}
                >
                    world
                </span>
                <br />
                1-
                <span>{this.state.count}</span> */}
            </div>
        );
    }
}

class CustomTextInput extends React.Component {
    constructor(props) {
        super(props);
        this.textInput = React.createRef();
        this.counterComponentRef = React.createRef();
        this.inputRef = React.createRef();
        this.focusTextInput = this.focusTextInput.bind(this);
    }

    focusTextInput() {
        this.textInput.current.focus();
    }

    show100() {
        console.log('this.counterComponentRef', this.counterComponentRef);
        this.counterComponentRef.current.updateShowText(100);

        this.inputRef.current.focus();
    }

    render() {
        return (
            <div>
                <div>
                    <input type='text' ref={this.textInput} />
                    <input type='button' onClick={this.focusTextInput} />
                </div>

                <div>
                    <button onClick={() => this.show100()}>add</button>
                    <MyClx A={'b'} ref={this.counterComponentRef}>
                        C
                    </MyClx>
                </div>

                <MyTestRef ref={this.inputRef} />
            </div>
        );
    }
}

class Clock extends React.Component {
    constructor(props) {
        super(props);
        this.state = { show: true, date: new Date() };
    }

    // https://reactjs.org/docs/react-component.html#componentdidmount
    // 1.组件挂载到页面上（已经操作了真实DOM）后调用
    // 2.需要DOM节点的相关初始化操作需要放在这里
    // 3.加载相关数据的好地方
    // 4.适合事件订阅的，但要记住订阅的事件要在componentWillUnmount中取消订阅
    // 5.不适合在这里调用setState，state初始值最好在constructor中赋值
    componentDidMount() {
        console.log('componentDidMount');
        this.timerID = setInterval(() => this.tick(), 1000);
    }

    // https://reactjs.org/docs/react-component.html#componentdidupdate
    // 1.更新完成后调用，初始化渲染不会调用
    // 2.当组件完成更新，需要对DOM进行某种操作的时候，适合在这个函数中进行
    // 3.当当前的props和之前的props有所不同，可以在这里进行有必要的网络请求
    // 4.这里虽然可以调用setState，但是要记住有条件的调用，否则会陷入死循环
    // 5.如果shouldComponentUpdate() 返回false，componentDidUpdate不会执行
    // 6.如果实现了getSnapshotBeforeUpdate，componentDidUpdate会接收第三个参数
    // 7.如果将props中的内容拷贝到state，可以考虑直接使用props
    // https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html
    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log('componentDidUpdated', prevProps, prevState, snapshot);
    }

    // https://reactjs.org/docs/react-component.html#componentwillunmount
    // 1.组件从DOM树上卸载完成的时候调用该函数
    // 2.执行一些清理操作，比如清除定时器，取消事件订阅，取消网络请求等
    // 3.不能在该函数中调用setState，不会产生任何效果，卸载后不会重新渲染
    componentWillUnmount() {
        console.log('componentWillUnmount');
        clearInterval(this.timerID);
    }

    shouldComponentUpdate() {
        return true;
    }

    tick() {
        this.setState({
            date: new Date(),
        });
    }

    render() {
        return (
            <div>
                <h1>Hello, world!</h1>
                <button
                    onClick={() => {
                        this.setState({ show: !this.state.show });
                    }}
                >
                    close
                </button>
                {this.state.show ? (
                    <h2>It is {this.state.date.toLocaleTimeString()}.</h2>
                ) : (
                    <span>close </span>
                )}
            </div>
        );
    }
}
class DerivedState extends React.Component {
    constructor(props) {
        super(props);
        this.state = { prevUserId: 'zs', email: 'zs!!@xx.com' };
    }

    static getDerivedStateFromProps(props, state) {
        if (props.userId !== state.prevUserId) {
            return {
                prevUserId: props.userId,
                email: props.userId + '@xx.com',
            };
        }
        return null;
    }

    render() {
        return (
            <div>
                <h1>Email:</h1>
                <h2>{this.state.email}</h2>
            </div>
        );
    }
}

class ParentClass extends React.Component {
    constructor(props) {
        super(props);
        this.state = { id: 'zhangsanfeng' };
    }
    changUserId = () => {
        this.setState({
            id: 'dongfangbubai',
        });
    };
    render() {
        return (
            <div>
                <input
                    type='button'
                    value='点击改变UserId'
                    onClick={() => this.changUserId()}
                />
                {this.state.id}
                <DerivedState userId={this.state.id} />
            </div>
        );
    }
}
ReactDOM.render(<ParentClass />, document.getElementById('root'));
