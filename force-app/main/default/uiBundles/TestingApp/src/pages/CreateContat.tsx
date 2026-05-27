import React from 'react';
import { ArrowLeft, UserPlus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createContact } from '@/api/contacts/contactService';
//import { useRedux } from '@/hook/useRedux';

interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    title: string;
}

interface FormErrors {
    firstName?: string;
    lastName?: string;
    email?: string;
    title?: string;
}

export default function CreateContactForm() {
    const navigate = useNavigate();
    //const { dispatch } = useRedux();
    const [formData, setFormData] = React.useState<FormData>({
        firstName: '',
        lastName: '',
        email: '',
        title: ''
    });

    const clearForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            title: ''
        });

        setErrors({
            firstName: '',
            lastName: '',
            email: '',
            title: ''
        });
    }

    const [errors, setErrors] = React.useState<FormErrors>({});
    const [loading, setLoading] = React.useState(false);

    const validateField = (name: string, value: string) => {

        switch (name) {

            case 'firstName':
                if (!value.trim()) return 'First Name is required';
                if (value.trim().length < 2) return 'Minimum 2 characters required';
                return '';

            case 'lastName':
                if (!value.trim()) return 'Last Name is required';
                if (value.trim().length < 2) return 'Minimum 2 characters required';
                return '';

            case 'email':
                if (!value.trim()) return 'Email is required';

                if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
                    return 'Invalid email address';
                }

                return '';

            case 'title':
                if (!value.trim()) return 'Title is required';
                return '';

            default:
                return '';
        }
    };

    const validateForm = () => {

        const newErrors: FormErrors = {};

        Object.keys(formData).forEach((key) => {

            const fieldName = key as keyof FormData;

            const error = validateField(
                fieldName,
                formData[fieldName]
            );

            if (error) {
                newErrors[fieldName] = error;
            }
        });

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

        if (errors[name as keyof FormErrors]) {

            setErrors((prev) => ({
                ...prev,
                [name]: validateField(name, value)
            }));
        }
    };

    const handleBlur = (
        e: React.FocusEvent<HTMLInputElement>
    ) => {

        const { name, value } = e.target;

        const error = validateField(name, value);

        setErrors((prev) => ({
            ...prev,
            [name]: error
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setLoading(true);

            const payload = {
                FirstName: formData.firstName,
                LastName: formData.lastName,
                Email: formData.email,
                Title: formData.title
            };

            console.log("SENDING PAYLOAD:", payload);

            const response = await createContact(payload);

            console.log("CREATE RESPONSE:", response);

            if (response?.error) {
                throw new Error(response.error);
            }

            alert('Contact created successfully');

            clearForm();

            navigate('/contact');

        } catch (error) {
            console.error(error);
            alert('Failed to create contact');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = (field: keyof typeof errors) => `
    w-full px-4 py-3 rounded-2xl border outline-none transition-all duration-200
    ${errors[field]
            ? 'border-red-500 bg-red-50 animate-shake'
            : 'border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
        }
`;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center p-4">

            <div className="w-full max-w-4xl bg-white rounded-[20px] shadow-2xl overflow-hidden border border-gray-200">

                {/* HEADER */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-4 flex items-center justify-between">

                    <div className="flex items-center gap-4">

                        <div className="size-14 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                            <UserPlus size={28} />
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold text-white">
                                Create Contact
                            </h1>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate('/contact')}
                        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-5 py-3 rounded-2xl transition-all duration-200"
                    >
                        {/* <ArrowLeft size={18} />
                        Back */}
                        <X size={20} />
                    </button>
                </div>

                {/* FORM */}
                <form
                    onSubmit={handleSubmit}
                    className="p-5 space-y-7"
                >

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* FIRST NAME */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label
                                    className="text-sm font-semibold text-gray-700"
                                    htmlFor="fname"
                                >
                                    First Name
                                    <span className="text-red-500 ml-1">*</span>
                                </label>

                                {errors.firstName && (
                                    <p className="text-red-500 text-xs font-medium">
                                        {errors.firstName}
                                    </p>
                                )}
                            </div>

                            <input
                                type="text"
                                name="firstName"
                                id="fname"
                                value={formData.firstName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Enter first name"
                                className={inputClass('firstName')}
                            />

                        </div>

                        {/* LAST NAME */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="lname">
                                    Last Name
                                    <span className="text-red-500 ml-1">*</span>
                                </label>

                                {errors.lastName && (
                                    <p className="text-red-500 text-sm mt-2 font-medium">
                                        {errors.lastName}
                                    </p>
                                )}
                            </div>

                            <input
                                type="text"
                                name="lastName"
                                id="lname"
                                value={formData.lastName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Enter last name"
                                className={inputClass('lastName')}
                            />
                        </div>

                        {/* EMAIL */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="email">
                                    Email
                                    <span className="text-red-500 ml-1">*</span>
                                </label>

                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-2 font-medium">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <input
                                type="email"
                                name="email"
                                id="email"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Enter email address"
                                className={inputClass('email')}
                            />
                        </div>

                        {/* TITLE */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="title">
                                    Job Title
                                    <span className="text-red-500 ml-1">*</span>
                                </label>

                                {errors.title && (
                                    <p className="text-red-500 text-sm mt-2 font-medium">
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            <input
                                type="text"
                                name="title"
                                id="title"
                                value={formData.title}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Enter job title"
                                className={inputClass('title')}
                            />
                        </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">

                        <button
                            type="button"
                            onClick={() => clearForm()}
                            className="px-6 py-3 rounded-2xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-all duration-200"
                        >
                            Clear
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold shadow-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating Contact...' : 'Create Contact'}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
}

