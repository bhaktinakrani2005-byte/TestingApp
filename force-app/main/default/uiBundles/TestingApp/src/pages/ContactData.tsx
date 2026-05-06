import { useEffect, useState } from 'react';
import { getContact, type ContactDataResult } from '../api/contacts/contactService';

export default function ContactData() {
    const [contact, setContact] = useState<ContactDataResult | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch contact ID from environment variables with multiple possible keys
        // Note: Vite requires VITE_ prefix to expose variables to the client
        const contactId =
            import.meta.env.VITE_CONTACT_ID ||
            import.meta.env.VITE_PUBLIC_BASE_URL ||
            import.meta.env.VITE_BASE_URL ||
            '003NS00001bohSUYAY'; // Fallback to hardcoded ID if env is not yet loaded

        console.log("Using Contact ID:", contactId);

        getContact(contactId)
            .then(data => {
                setContact(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="mx-auto px-8 py-12 bg-cover bg-center">
            <h1>Contact Data</h1>
            {contact ? (
                <div>
                    <p>Name: {contact.name}</p>
                    <p>Email: {contact.email}</p>
                    <p>Title: {contact.title}</p>
                </div>
            ) : (
                <p>No contact found.</p>
            )}
        </div>
    );
}