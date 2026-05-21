import {
    configureStore,
    combineReducers,
} from "@reduxjs/toolkit";

import {
    TypedUseSelectorHook,
    useDispatch,
    useSelector,
} from "react-redux";

import {
    persistReducer,
    persistStore,
} from "redux-persist";

import storage from "redux-persist/lib/storage";

// Slices
import todoReducer from "./slice/TodoSlice";

// Root reducer
const rootReducer = combineReducers({
    todo: todoReducer,
});

// Persist config
const persistConfig = {
    key: "root",
    storage,
    whitelist: ["todo"], // Only todo slice will persist
};

const persistedReducer = persistReducer(
    persistConfig,
    rootReducer
);

// Store
export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<
    typeof store.getState
>;

export type AppDispatch = typeof store.dispatch;

// Hooks
export const useAppDispatch = () =>
    useDispatch<AppDispatch>();

export const useAppSelector: TypedUseSelectorHook<RootState> =
    useSelector;