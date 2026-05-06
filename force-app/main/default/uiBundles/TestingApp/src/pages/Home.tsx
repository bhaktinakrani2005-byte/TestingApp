import { useNavigate } from 'react-router-dom';

export default function HomePage() {
	const navigate = useNavigate(); 
	const handleClick = () => {
		navigate('/contact');
	};

	return (
		// <div className=" mx-auto 
		// px-8 sm:px-6 lg:px-3 
		// py-12 h-125 bg-red-200 w-full">
		// 	<div className="bg-green-300 h-full px-3 py-2 ">
		// 		<div className="bg-pink-300 p-3">
		// 			Lorem ipsum dolor sit amet consectetur adipisicing elit. Nemo, repudiandae nobis. Ex dolores sunt reprehenderit delectus eum minus. Adipisci officia quae unde facere error optio nisi cumque quisquam rerum eaque.
		// 		</div>
		// 	</div>
		// </div>
		<div
			className="mx-auto px-8 sm:px-6 lg:px-3 py-12 h-screen w-full bg-cover bg-center"
			style={{
				backgroundImage:
					"url('https://picsum.photos/id/1/200/300')",
			}}
		>
			<div className="bg-black/50 h-full px-6 py-6 flex items-center justify-center">
				<div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl max-w-xl text-center shadow-lg">
					<h1 className="text-3xl font-bold mb-4">
						Welcome Home 👋
					</h1>
					<p className="text-gray-700">
						Lorem ipsum dolor sit amet consectetur adipisicing elit.
						Nemo, repudiandae nobis. Ex dolores sunt reprehenderit
						delectus eum minus.
					</p>
					<button onClick={handleClick}
						className="bg-blue-300 text-white px-4 py-2 rounded-md mt-4 items-center justify-center">
						Get Start
					</button>
				</div>
			</div>
		</div>
	);
}
