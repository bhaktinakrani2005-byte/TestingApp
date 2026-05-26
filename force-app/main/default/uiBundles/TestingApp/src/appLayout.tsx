import { Outlet, Link, useLocation } from "react-router";
import { getAllRoutes } from "./router-utils";
import { useState } from "react";
import { AuthMenu } from "./features/authentication/menu/AuthMenu";
import { Button } from "./components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useRedux } from "./hook/useRedux";
import { fetchTodos } from "./store/slice/TodoSlice";
import { useAuth } from "@/features/authentication/context/AuthContext";

export default function AppLayout() {
	const [isOpen, setIsOpen] = useState(false);
	const location = useLocation();
	const { dispatch } = useRedux();

	const isActive = (path: string) => location.pathname === path;
	const toggleMenu = () => setIsOpen(!isOpen);
	const { isAuthenticated } = useAuth();

	const navigationRoutes = getAllRoutes()
		.filter(
			(route) =>
				route.handle?.showInNavigation &&
				route.fullPath &&
				route.handle?.label
		)
		.map((route) => ({
			path: route.fullPath!,
			label: route.handle?.label,
		}));

	const onChangeTab = (target: string) => {
		if (target !== "/todo") return
		dispatch(fetchTodos())
	}

	// return (
	// 	<div className="min-h-screen flex flex-col bg-gray-50">

	// 		{/* NAVBAR */}

	// 		<nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200">
	// 			<div className="mx-auto px-4 sm:px-6 lg:px-8">
	// 				<div className="flex justify-between items-center h-16">
	// 					{/* LOGO */}
	// 					<Link
	// 						to="/"
	// 						className="text-lg font-semibold text-gray-900 tracking-tight"
	// 					>
	// 						React Admin
	// 					</Link>

	// 					{/* DESKTOP NAV */}
	// 					<div className="hidden md:flex items-center gap-2">
	// 						{navigationRoutes.map((item) => (
	// 							<Link
	// 								key={item.path}
	// 								to={item.path}
	// 								onClick={() => onChangeTab(item.path)}
	// 								className={`px-3 py-2 text-sm font-medium rounded-md transition ${isActive(item.path)
	// 									? "bg-blue-50 text-blue-600"
	// 									: "text-gray-600 hover:bg-gray-100"
	// 									}`}
	// 							>
	// 								{item.label}
	// 							</Link>
	// 						))}

	// 						<AuthMenu />
	// 					</div>

	// 					{/* MOBILE */}
	// 					<div className="flex items-center gap-2 md:hidden">
	// 						<AuthMenu />

	// 						<Button
	// 							variant="ghost"
	// 							size="icon"
	// 							onClick={toggleMenu}
	// 							aria-label="Toggle menu"
	// 						>
	// 							<div className="w-6 h-6 relative">
	// 								<span
	// 									className={`absolute h-0.5 w-6 bg-current transition-all ${isOpen ? "rotate-45 top-3" : "top-1"
	// 										}`}
	// 								/>
	// 								<span
	// 									className={`absolute h-0.5 w-6 bg-current transition-all ${isOpen ? "opacity-0" : "top-3"
	// 										}`}
	// 								/>
	// 								<span
	// 									className={`absolute h-0.5 w-6 bg-current transition-all ${isOpen ? "-rotate-45 top-3" : "top-5"
	// 										}`}
	// 								/>
	// 							</div>
	// 						</Button>
	// 					</div>
	// 				</div>
	// 			</div>

	// 			{/* MOBILE MENU */}
	// 			<AnimatePresence>
	// 				{isOpen && (
	// 					<motion.div
	// 						initial={{ opacity: 0, y: -8 }}
	// 						animate={{ opacity: 1, y: 0 }}
	// 						exit={{ opacity: 0, y: -8 }}
	// 						transition={{ duration: 0.2 }}
	// 						className="md:hidden border-t border-gray-200 bg-white shadow-sm"
	// 					>
	// 						<div className="px-4 py-3 space-y-1">
	// 							{navigationRoutes.map((item) => (
	// 								<Link
	// 									key={item.path}
	// 									to={item.path}
	// 									onClick={() => setIsOpen(false)}
	// 									className={`block px-3 py-2 rounded-md text-sm font-medium transition ${isActive(item.path)
	// 										? "bg-blue-50 text-blue-600"
	// 										: "text-gray-600 hover:bg-gray-100"
	// 										}`}
	// 								>
	// 									{item.label}
	// 								</Link>
	// 							))}
	// 						</div>
	// 					</motion.div>
	// 				)}
	// 			</AnimatePresence>
	// 		</nav>

	// 		{/* CONTENT */}
	// 		<main className="flex-1">
	// 			<Outlet />
	// 		</main>
	// 	</div>
	// );


	return (
		<div className="min-h-screen flex flex-col bg-gray-50">

			{/* SHOW NAVBAR ONLY WHEN AUTHENTICATED */}
			{isAuthenticated && (
				<>
					{/* NAVBAR */}
					<nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200">

						<div className="mx-auto px-4 sm:px-6 lg:px-8">

							<div className="flex justify-between items-center h-16">

								{/* LOGO */}
								<Link
									to="/"
									className="text-lg font-semibold text-gray-900 tracking-tight"
								>
									React Admin
								</Link>

								{/* DESKTOP NAV */}
								<div className="hidden md:flex items-center gap-2">

									{navigationRoutes.map((item) => (
										<Link
											key={item.path}
											to={item.path}
											onClick={() => onChangeTab(item.path)}
											className={`px-3 py-2 text-sm font-medium rounded-md transition ${isActive(item.path)
												? "bg-blue-50 text-blue-600"
												: "text-gray-600 hover:bg-gray-100"
												}`}
										>
											{item.label}
										</Link>
									))}

									<AuthMenu />

								</div>

								{/* MOBILE */}
								<div className="flex items-center gap-2 md:hidden">

									<AuthMenu />

									<Button
										variant="ghost"
										size="icon"
										onClick={toggleMenu}
										aria-label="Toggle menu"
									>

										<div className="w-6 h-6 relative">

											<span
												className={`absolute h-0.5 w-6 bg-current transition-all ${isOpen ? "rotate-45 top-3" : "top-1"
													}`}
											/>

											<span
												className={`absolute h-0.5 w-6 bg-current transition-all ${isOpen ? "opacity-0" : "top-3"
													}`}
											/>

											<span
												className={`absolute h-0.5 w-6 bg-current transition-all ${isOpen ? "-rotate-45 top-3" : "top-5"
													}`}
											/>

										</div>

									</Button>

								</div>

							</div>

						</div>

						{/* MOBILE MENU */}
						<AnimatePresence>

							{isOpen && (
								<motion.div
									initial={{ opacity: 0, y: -8 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -8 }}
									transition={{ duration: 0.2 }}
									className="md:hidden border-t border-gray-200 bg-white shadow-sm"
								>

									<div className="px-4 py-3 space-y-1">

										{navigationRoutes.map((item) => (
											<Link
												key={item.path}
												to={item.path}
												onClick={() => setIsOpen(false)}
												className={`block px-3 py-2 rounded-md text-sm font-medium transition ${isActive(item.path)
													? "bg-blue-50 text-blue-600"
													: "text-gray-600 hover:bg-gray-100"
													}`}
											>
												{item.label}
											</Link>
										))}

									</div>

								</motion.div>
							)}

						</AnimatePresence>

					</nav>
				</>
			)}

			{/* CONTENT ALWAYS RENDERS */}
			<main className="flex-1">
				<Outlet />
			</main>

		</div>
	);
}