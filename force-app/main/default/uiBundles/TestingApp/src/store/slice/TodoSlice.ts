import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "..";

export interface Todo {
    id: number;
    title: string;
    completed: boolean;
    userId: number;
}

interface TodoState {
    todos: Todo[];
    loading: boolean;
    error: string | null;
}

const initialState: TodoState = {
    todos: [],
    loading: false,
    error: null,
};

/* Get all todos */
export const fetchTodos = createAsyncThunk<
    Todo[],
    boolean | undefined,
    {
        rejectValue: string;
        state: RootState;
    }
>(
    "todos/fetchTodos",
    async (isForce = false, { rejectWithValue, getState }) => {
        try {
            const state = getState();

            // if todos already available and not force call
            if (!isForce && state.todo.todos.length > 0) {
                return state.todo.todos;
            }

            const response = await fetch(
                "https://jsonplaceholder.typicode.com/todos"
            );

            if (!response.ok) {
                return rejectWithValue("Failed to fetch todos");
            }

            const data: Todo[] = await response.json();

            return data;
        } catch (error) {
            return rejectWithValue(
                error instanceof Error
                    ? error.message
                    : "Something went wrong"
            );
        }
    }
);

export const todoSlice = createSlice({
    name: "todo",
    initialState,
    reducers: {
        addTodo(state, action: PayloadAction<Todo>) {
            state.todos.push(action.payload);
        },

        removeTodo(state, action: PayloadAction<number>) {
            state.todos = state.todos.filter(
                (todo) => todo.id !== action.payload
            );
        },
        updateTodo(state, action: PayloadAction<Todo>) {
            const todo = state.todos.find(
                (t) => t.id === action.payload.id
            );
            if (todo) {
                todo.title = action.payload.title;
                todo.completed = action.payload.completed;
            }
        }
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchTodos.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(
                fetchTodos.fulfilled,
                (state, action: PayloadAction<Todo[]>) => {
                    state.loading = false;
                    state.todos = action.payload;
                }
            )

            .addCase(fetchTodos.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.payload || "Failed to fetch todos";
            });
    },
});

export const { addTodo, removeTodo, updateTodo } = todoSlice.actions;

export default todoSlice.reducer;