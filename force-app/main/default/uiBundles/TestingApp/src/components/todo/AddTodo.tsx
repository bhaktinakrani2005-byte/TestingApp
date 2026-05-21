import { useRedux } from "@/hook/useRedux";
import {
    addTodo,
    fetchTodos,
    updateTodo
} from "@/store/slice/TodoSlice";

import { useState } from "react";
import { Button } from "../ui";
import { RefreshCcw } from "lucide-react";

export default function AddTodo() {

    const { dispatch, selector } = useRedux();
   // const { todos = [] } = selector(state => state.todo);

    const [title, setTitle] = useState('');
    const [editId, setEditId] = useState<number | null>(null);

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!title.trim()) return;

        // UPDATE
        if (editId !== null) {

            dispatch(updateTodo({
                id: editId,
                title: title.trim(),
                completed: false,
                userId: 0
            }));

            setEditId(null);

        } else {

            // ADD
            dispatch(addTodo({
                id: Date.now(),
                title: title.trim(),
                completed: false,
                userId: 0
            }));
        }

        setTitle('');
    };

    const handleEdit = (todo: any) => {
        setTitle(todo.title);
        setEditId(todo.id);
    };

    const getTodos = () => {
        dispatch(fetchTodos(true));
    };

    return (
        <div className="sticky top-[90px] bg-white p-3">

            <form onSubmit={handleSubmit} className="flex gap-2 items-center p-2">

                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && e.shiftKey) {
                            e.preventDefault();
                        }
                    }}
                    className="flex-1 px-3 py-2 border rounded-md"
                    placeholder="Add todo..."
                />

                <Button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600"
                >
                    {editId !== null ? 'Update Todo' : 'Add Todo'}
                </Button>

                <Button type="button" onClick={getTodos} variant="outline" size="icon">
                    <RefreshCcw className="size-4" />
                </Button>

            </form>

            {/* Todo List */}
            {/* <div className="space-y-2">

                {todos?.map((todo: any) => (

                    <div
                        key={todo.id}
                        className="flex items-center justify-between border p-2 rounded-md"
                    >
                        <span>{todo.title}</span>

                        <button
                            onClick={() => handleEdit(todo)}
                            className="px-3 py-1 bg-green-500 text-white rounded"
                        >
                            Edit
                        </button>
                    </div>

                ))}

            </div> */}

        </div>
    );
}
