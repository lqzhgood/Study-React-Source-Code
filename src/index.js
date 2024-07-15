import React from './react';
import ReactDOM from './react-dom';

function MyTest(props) {
    return (
        <div style={{ color: 'red', backgroundColor: 'blue' }}>
            Hello <span>world</span>
        </div>
    );
}

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
                <span
                    onClick={() => {
                        this.updateShowText(++this.counter);
                    }}
                >
                    world
                </span>
                <br />
                1-
                <span>{this.state.count}</span>
            </div>
        );
    }
}

// ReactDOM.render(<MyClx A={'b'}>C</MyClx>, document.getElementById('root'));

ReactDOM.render(<MyClx A={'b'}>C</MyClx>, document.getElementById('root'));
