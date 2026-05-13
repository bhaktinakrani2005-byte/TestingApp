export default function LoadingTodos() {
    return (
        <div className="flex min-h-[60vh] items-center justify-center px-4 py-10">
            <div className="relative flex h-20 w-20 items-center justify-center">
                <div className="absolute h-20 w-20 animate-ping rounded-full bg-gray-200 opacity-40"></div>
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
            </div>

            <div className="space-y-2 text-center">
                <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                    Loading Todos
                </h2>

                <p className="text-sm text-gray-500 sm:text-base">
                    Fetching your latest tasks. Please wait...
                </p>
            </div>
        </div >
    );
}
