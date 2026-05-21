import { useRedux } from "@/hook/useRedux";
import { removeTodo } from "../../store/slice/TodoSlice";
import LoadingTodos from "./LoadingTodos";

export default function TodoList() {
    const { dispatch, selector } = useRedux()
    const { todos = [], loading } = selector(state => state?.todo)

    const reveredTodos = [...todos].reverse()
    return (
        loading ? <LoadingTodos /> : <ul className="space-y-2">
            {reveredTodos?.map((todo, i) => (
                <li
                    key={todo.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md shadow-sm border border-gray-100"
                >
                    <div className="flex items-start gap-2">
                        <p className="text-red font-bold">{i + 1}.</p>
                        <span className="text-gray-800">{todo.title}</span>
                    </div>
                    {/* <button
                        onClick={() => dispatch(updateTodo(todo))}
                        className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors"
                    >
                        Update
                    </button> */}
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
