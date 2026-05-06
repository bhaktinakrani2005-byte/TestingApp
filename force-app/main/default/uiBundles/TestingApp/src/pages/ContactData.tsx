import { useEffect, useState } from 'react';
import { getContact, type ContactDataResult } from '../api/contacts/contactService';

export default function ContactData(){
    const [contact, setContact] = useState<ContactDataResult | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Example ID - you should probably get this from params or context
        const contactId = '003XXXXXXXXXXXXXXX'; 
        getContact(contactId)
            .then(data => {
                setContact(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div>Loading...</div>;

    return(
        <div className="mx-auto px-8 py-12 bg-cover bg-center">
            <h1>Contact Data</h1>
            {contact ? (
                <div>
                    <p>Name: {contact.Name?.value}</p>
                    <p>Email: {contact.Email?.value}</p>
                    <p>Title: {contact.Title?.value}</p>
                </div>
            ) : (
                <p>No contact found.</p>
            )}
        </div>
    );
}