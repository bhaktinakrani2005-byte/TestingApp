import { useSelector, useDispatch } from "react-redux";
import { updateTodo } from "../../store/slice/TodoSlice";
import { RootState } from "../../store";
// const update = updateTodo();

export default function UpdateTodo() {
    const todos = useSelector((state: RootState) => state.todo.todos);
}