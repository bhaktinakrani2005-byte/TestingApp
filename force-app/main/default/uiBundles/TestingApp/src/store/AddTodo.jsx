import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addTodo } from "../Store/TodoSlice";

function AddTodo() {
    const dispatch = useDispatch();
    const [todo, setTodo] = useState('');

    return(
        <>
            <input type="text" value={todo} onChange={(e) => setTodo(e.target.value)} />
            <button onClick={() => dispatch(addTodo(todo))}>Add Todo</button>
        </>
    )
}



