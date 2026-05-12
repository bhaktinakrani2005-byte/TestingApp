import { useAppDispatch, useAppSelector } from "@/store";
export const useRedux = () => {
    const dispatch = useAppDispatch();
    const selector = useAppSelector;


    return {
        dispatch,
        selector
    };
};
