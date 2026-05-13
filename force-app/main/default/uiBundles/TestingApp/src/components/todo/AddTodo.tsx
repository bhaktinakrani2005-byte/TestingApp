import { useRedux } from "@/hook/useRedux";
import { addTodo, fetchTodos } from "@/store/slice/TodoSlice";
import { useState } from "react";
import { Button } from "../ui";

export default function AddTodo() {
    const { dispatch } = useRedux()
    const [title, setTitle] = useState('');

    const handleAddTodo = () => {
        if (title.trim()) {
            dispatch(addTodo({
                id: Date.now(),
                title: title.trim(),
                completed: false,
                userId: 0
            }));
            setTitle('');
        }
    };


    const getTodos = () => {
        dispatch(fetchTodos(true));
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

            <Button onClick={getTodos}>Get Todos</Button>
        </div>
    )
}



