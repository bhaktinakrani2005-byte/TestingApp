import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Todo {
    id: number;
    title: string;
}

interface TodoState {
    todos: Todo[];
}

const initialState: TodoState = {
    todos: [{ id: 1, title: 'Learn Redux' }]
}

export const todoSlice = createSlice({
    name: 'todo',
    initialState,
    reducers: {
        addTodo(state, action: PayloadAction<Todo>) {
            state.todos.push(action.payload);
        },
        removeTodo(state, action: PayloadAction<number>) {
            state.todos = state.todos.filter(todo => todo.id !== action.payload);
        }
    }
})

export const { addTodo, removeTodo } = todoSlice.actions;

export default todoSlice.reducer;