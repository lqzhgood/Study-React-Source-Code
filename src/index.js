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

ReactDOM.render(<CustomTextInput />, document.getElementById('root'));
