import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addTodo } from "../../store/slice/TodoSlice";

export default function AddTodo() {
    const dispatch = useDispatch();
    const [title, setTitle] = useState('');

    const handleAddTodo = () => {
        if (title.trim()) {
            dispatch(addTodo({
                id: Date.now(),
                title: title.trim()
            }));
            setTitle('');
        }
    };

    return (
        <div className="flex gap-2 mb-4">
            <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a new todo..."
            />
            <button 
                onClick={handleAddTodo}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
                Add Todo
            </button>
        </div>
    )
}



