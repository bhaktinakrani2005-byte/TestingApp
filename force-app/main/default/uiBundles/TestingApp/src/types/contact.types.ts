// Shared contact types — imported by both contactService.ts and ContactSlice.ts
// to avoid circular dependencies.

export interface NewContactInput {
    firstName: string;
    lastName: string;
    email: string;
    title: string;
}

export interface NewContactResponse {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    title: string;
}
