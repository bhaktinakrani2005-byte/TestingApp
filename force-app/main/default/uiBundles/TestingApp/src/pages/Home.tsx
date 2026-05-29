import { useRedux } from '@/hook/useRedux';
import { fetchContactList } from '@/store/slice/ContactSlice';
// import { fetchContact } from '@/store/slice/ContactSlice';
import { Navigate, useNavigate } from 'react-router-dom';

export default function HomePage() {
	const { dispatch } = useRedux();
	const navigate = useNavigate();
	// const ContactId = process.env.VITE_CONTACT_ID;
	const handleClick = () => {
		navigate('/contact');
		dispatch(fetchContactList())
			.unwrap()
			.then(() => {
				navigate('/Contact');
			})
			.catch((error: any) => {
				navigate("/");
				console.error('Failed to fetch contact:', error);
			})
	};

	return (
		<div className="mx-auto heroClass px-8 sm:px-6 lg:px-3 py-12 h-full w-full bg-cover bg-center">
			<div className="h-full px-6 py-6 flex items-center justify-center">
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
