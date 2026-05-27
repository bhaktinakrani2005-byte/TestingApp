
const SidebarLoader = () => {
    return (
        <aside className="w-70 bg-white  p-4 hidden md:flex flex-col ">

            {/* TOP SEARCH SECTION */}
            <div className="flex items-center gap-2 mb-5 animate-pulse">
                <div className="h-10 flex-1 rounded-xl bg-gray-200" />
                <div className="h-10 w-10 rounded-xl bg-gray-200" />
                <div className="h-10 w-16 rounded-xl bg-gray-200" />
            </div>

            {/* CONTACT COUNT */}
            <div className="mb-4 animate-pulse">
                <div className="h-4 w-28 rounded bg-gray-200" />
            </div>

            {/* CONTACT LIST */}
            <div className="flex flex-col gap-3 overflow-hidden">
                {[1, 2, 3, 4, 5].map((item) => (
                    <div
                        key={item}
                        className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 bg-white shadow-sm animate-pulse"
                    >
                        {/* Avatar */}
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300" />

                        {/* Text Content */}
                        <div className="flex-1 min-w-0 space-y-2">
                            <div className="h-4 w-32 rounded bg-gray-200" />

                            <div className="h-3 w-40 rounded bg-gray-100" />

                            <div className="h-3 w-24 rounded bg-gray-100" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Loader */}
            <div className="mt-auto pt-6 animate-pulse">
                <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full w-1/2 bg-gray-300 rounded-full animate-[loading_1.5s_ease-in-out_infinite]" />
                </div>
            </div>

            {/* Custom Animation */}
            <style>
                {`
          @keyframes loading {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(250%);
            }
          }
        `}
            </style>
        </aside>
    );
};

export default SidebarLoader;