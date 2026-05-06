import GET_CONTACT_QUERY from "./query/getContact.graphql?raw";
import { fetchSingle } from "../graphqlClient";

/**
 * Domain model for a Contact record.
 */
export interface Contact {
    id: string;
    name: string | null;
    email: string | null;
    accountId: string | null;
    title: string | null;
}

/**
 * Service to fetch Contact data.
 * Optimized using the shared fetchSingle helper for clean, flattened data.
 * 
 * @param contactId - The Salesforce Contact ID to fetch.
 * @returns A Promise resolving to a flattened Contact object, or null if no record was found.
 */
export async function getContact(contactId: string): Promise<Contact | null> {
    return fetchSingle<Contact, any, { contactId: string }>(
        GET_CONTACT_QUERY,
        "Contact",
        { contactId }
    );
}

// Alias for backward compatibility
export type ContactDataResult = Contact;
