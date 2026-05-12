import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

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
    void,
    { rejectValue: string }
>(
    "todos/fetchTodos",
    async (_, { rejectWithValue }) => {
        try {
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

export const { addTodo, removeTodo } = todoSlice.actions;

export default todoSlice.reducer;