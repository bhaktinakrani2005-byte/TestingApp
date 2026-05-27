import React from "react";

export default function CreateContactForm() {
    const [formData, setFormData] = React.useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        title: ''
    });

    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [loading, setLoading] = React.useState(false);

    const validate = () => {
        const newErrors: Record<string, string> = {};

        // First Name
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        } else if (formData.firstName.length < 2) {
            newErrors.firstName = 'Minimum 2 characters required';
        }

        // Last Name
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        } else if (formData.lastName.length < 2) {
            newErrors.lastName = 'Minimum 2 characters required';
        }

        // Email
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
            newErrors.email = 'Invalid email address';
        }

        // Phone
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.phone)) {
            newErrors.phone = 'Phone number must be 10 digits';
        }

        // Title
        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: ''
        }));
    };

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            setLoading(true);

            console.log('FORM DATA', formData);

            // Example API Call
            // await dispatch(createContactThunk(formData)).unwrap();

            alert('Contact created successfully');

            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                title: ''
            });

        } catch (error) {
            console.error(error);
            alert('Failed to create contact');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">

                <h1 className="text-3xl font-bold mb-6 text-gray-800">
                    Create Contact
                </h1>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* FIRST NAME */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            First Name
                        </label>

                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="Enter first name"
                            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        {errors.firstName && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.firstName}
                            </p>
                        )}
                    </div>

                    {/* LAST NAME */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Last Name
                        </label>

                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Enter last name"
                            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        {errors.lastName && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.lastName}
                            </p>
                        )}
                    </div>

                    {/* EMAIL */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter email"
                            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* PHONE */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Phone
                        </label>

                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Enter phone number"
                            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        {errors.phone && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.phone}
                            </p>
                        )}
                    </div>

                    {/* TITLE */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Title
                        </label>

                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Enter title"
                            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        {errors.title && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.title}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Contact'}
                    </button>

                </form>
            </div>
        </div>
    );
}
