import { useEffect, useState } from 'react';
import { getContact, type ContactData as ContactDataType } from '../api/contacts/contactService';

export default function ContactData() {
    const [contact, setContact] = useState<ContactDataType | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const contactId =
            import.meta.env.VITE_CONTACT_ID ||
            '003JW00001HQzVOYA1';

        getContact(contactId)
            .then(data => {
                setContact(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <>
            <div className="mx-auto px-8 py-12 bg-cover bg-center border-b">
                <h1 className="text-2xl font-bold mb-4">Contact Data</h1>
                {contact ? (
                    <div className="space-y-2">
                        {/* <p><span className="font-semibold">Name:</span> {contact.name}</p>
                        <p><span className="font-semibold">Email:</span> {contact.email}</p>
                        <p><span className="font-semibold">Title:</span> {contact.title}</p>
                        <p><span className="font-semibold">Account ID:</span> {contact.accountId}</p> */}
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-blue-100 p-6 rounded-lg shadow text-center font-bold">{contact.name}</div>
                                <div className="bg-green-100 p-6 rounded-lg shadow text-center font-bold">{contact.email}</div>
                                <div className="bg-purple-100 p-6 rounded-lg shadow text-center font-bold">{contact.title}</div>
                                <div className="bg-orange-100 p-6 rounded-lg shadow text-center font-bold">{contact.accountId}</div>
                            </div>
                       </div> 
                    </div>
                ) : (
                    <p className="text-red-500">No contact found for ID: {import.meta.env.VITE_CONTACT_ID || '003Qy00000PeGVvIAN'}</p>
                )}
            </div>

            {/* <div className="p-8">
                <h2 className="text-xl font-bold mb-4">Grid Example</h2>
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-100 p-6 rounded-lg shadow text-center font-bold">{contact.name}</div>
                        <div className="bg-green-100 p-6 rounded-lg shadow text-center font-bold">{contact.email}</div>
                        <div className="bg-purple-100 p-6 rounded-lg shadow text-center font-bold">{contact.title}</div>
                        <div className="bg-orange-100 p-6 rounded-lg shadow text-center font-bold">{contact.accountId}</div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-100 p-6 rounded-lg shadow text-center font-bold">1</div>
                        <div className="bg-orange-100 p-6 rounded-lg shadow text-center font-bold">2</div>
                        <div className="bg-purple-100 p-6 rounded-lg shadow text-center font-bold">3</div>
                        <div className="bg-orange-100 p-6 rounded-lg shadow text-center font-bold">4</div>
                    </div>
                </div>
            </div> */}
        </>
    );
}
