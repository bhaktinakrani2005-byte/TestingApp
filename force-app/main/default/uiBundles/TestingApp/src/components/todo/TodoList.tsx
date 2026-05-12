import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { removeTodo } from "../../store/slice/TodoSlice";

export default function TodoList() {
    const todos = useSelector((state: RootState) => state.todo.todos);
    const dispatch = useDispatch();

    return (
        <ul className="space-y-2">
            {todos.map((todo) => (
                <li
                    key={todo.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md shadow-sm border border-gray-100"
                >
                    <span className="text-gray-800">{todo.title}</span>
                    <button
                        onClick={() => dispatch(removeTodo(todo.id))}
                        className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors"
                    >
                        Remove
                    </button>
                </li>
            ))}
            {todos.length === 0 && (
                <p className="text-center text-gray-500 py-4">No todos yet. Add one above!</p>
            )}
        </ul>
    );
}
