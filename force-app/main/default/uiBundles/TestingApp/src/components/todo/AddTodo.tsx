import { useRedux } from "@/hook/useRedux";
import {
    createBodyData,
    createTodos,
    fetchTodos,
    updateTodo
} from "@/store/slice/TodoSlice";

import { RefreshCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui";

export default function AddTodo() {

    const { dispatch } = useRedux();
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
            const bodyData: createBodyData = {
                userId: Date.now().toString(),
                title: title.trim(),
                completed: false
            };
            dispatch(
                createTodos(bodyData)
            );
            // ADD
            /* dispatch(addTodo({
                id: Date.now(),
                title: title.trim(),
                completed: false,
                userId: 0
            })); */
        }

        setTitle('');
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // const handleEdit = (todo: any) => {
    //     setTitle(todo.title);
    //     setEditId(todo.id);
    // };

    const getTodos = () => {
        dispatch(fetchTodos(true));
    };
    //  style={{position: 'sticky', top: 65, background: 'white', paddingTop: '10px'}}
    return (
        <div className="sticky top-22.5 bg-white">
            <form onSubmit={handleSubmit} className="flex gap-2 mb-4 items-center p-2">
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
