import React, { useState, useCallback, useMemo } from './react';
import ReactDOM from './react-dom';

const M = React.memo(function Child2({ data, onClick }) {
    console.log('cccc');
    return <button onClick={onClick}>btn {data.age}</button>;
});

function Form() {
    console.log('F render');
    const [name, setName] = useState('xx');
    const [age, setAge] = useState(30);

    let data = useMemo(() => ({ age }), [age]);

    let handleClick = useCallback(() => {
        setAge(age + 1);
    }, [age]);

    return (
        <div>
            <input
                type='text'
                value={name}
                onInput={e => {
                    setName(e.target.target.value);
                }}
            />
            <M data={data} onClick={handleClick} />
        </div>
    );
}

ReactDOM.render(<Form />, document.getElementById('root'));
