import { toast } from 'sonner';
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
    getContact,
    getDistinctCaseStatus,
    updateContact,
    deleteContact,
    ContactData,
    getAllContacts,
    createContact
} from "@/api/contacts/contactService";
import { RootState } from "..";

export interface Case {
    id: string;
    caseNumber: string;
    subject: string;
    status: string;
    priority: string;
}

export interface ContactDetails {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    accountId: string;
    title: string;
    accountName: string;
    accountIndustry: string;
    accountPhone: string | null;
    cases: Case[];
    isLoading: boolean;
}

export interface CaseStatusCount {
    status: string;
    count: number;
}

export interface ContactListItem {
    email: string;
    id: string;
    name: string;
    title: string;
}

interface ContactState {
    contact: ContactDetails | null;
    contactList: {
        data: ContactListItem[],
        isLoading: boolean,
    },
    caseStatuses: CaseStatusCount[];
    loading: boolean;
    error: string | null;
    currentUser: CurrentUser | null;
    newContactInput: newContactInput
    newContactResponse: newContactResponse
}

const initialState: ContactState = {
    contact: {
        id: "",
        name: "",
        firstName: "",
        lastName: "",
        cases: [],
        email: "",
        accountId: "",
        title: "",
        accountName: "",
        accountIndustry: "",
        accountPhone: null,
        isLoading: false
    },
    contactList: {
        data: [],
        isLoading: false,

    },
    caseStatuses: [],
    loading: false,
    error: null,
    currentUser: null,
    newContactInput: {
        firstName: "",
        lastName: "",
        email: "",
        title: ""
    },
    newContactResponse: {
        id: "",
        firstName: "",
        lastName: "",
        email: "",
        title: ""
    }
};

export interface CurrentUser {
    id: string;
    name: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
}


export interface newContactInput {
    firstName: string;
    lastName: string;
    email: string;
    title: string;
}

export interface newContactResponse {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    title: string;
}


// export async function getCurrentUser(): Promise<CurrentUser> {
//     const response = await fetch('/services/oauth2/userinfo');
//     if (!response.ok) {
//         throw new Error('Failed to fetch user');
//     }
//     return response.json();
// }

// export const fetchUser = createAsyncThunk<
//     CurrentUser,
//     void,
//     {
//         rejectValue: string;
//     }
// >(
//     'contact/fetchUser',
//     async (_, { rejectWithValue }) => {
//         try {
//             const data = await getCurrentUser();
//             if (!data) {
//                 return rejectWithValue("User not found");
//             }
//             return data;
//         }
//         catch (error) {
//             console.log(error);
//             return rejectWithValue("Failed to fetch user");
//         }
//     }
// )



export const createContactThunk = createAsyncThunk<
    newContactResponse,
    newContactInput,
    {
        rejectValue: string;
        state: RootState;
    }
>(
    "contact/createContact",
    async (payload, { rejectWithValue }) => {
        try {
            console.log("payload : ", payload);
            const data = await createContact(payload);
            console.log("Data", data);
            if (!data) {
                return rejectWithValue("Failed to create contact");
            }

            return data;
        } catch (error: any) {
            return rejectWithValue(
                error.message || "Failed to create contact"
            );
        }
    }
);

export const fetchContactList = createAsyncThunk<
    ContactListItem[],
    void,
    {
        rejectValue: string;
        state: RootState;
    }>(
        'contact/fetchContactList',
        async (_, { rejectWithValue }) => {
            try {
                const data = await getAllContacts();
                console.log("Dtaa", data);


                if (!data) {
                    return rejectWithValue("User not found");
                }
                return data;
            }
            catch (error) {
                console.log(error);
                return rejectWithValue("Failed to fetch user");
            }
        });


export const fetchContact = createAsyncThunk<
    ContactDetails,
    string,
    {
        rejectValue: string;
        state: RootState;
    }
>(
    'contact/fetchContact',
    async (contactId: string, { rejectWithValue }) => {
        try {
            const data = await getContact(contactId);
            if (!data) {
                return rejectWithValue("Contact not found");
            }
            const contactDetails: ContactDetails = {
                id: data.id,
                isLoading: false,
                name: data.name,
                firstName: data.firstName || "",
                lastName: data.lastName || "",
                email: data.email,
                accountId: data.accountId,
                title: data.title,
                accountName: data.accountName,
                accountIndustry: data.accountIndustry || '',
                accountPhone: data.accountPhone ?? null,
                cases: data.cases.map(c => ({
                    id: c.id,
                    caseNumber: c.caseNumber,
                    subject: c.subject,
                    status: c.status || '',
                    priority: c.priority || ''
                }))
            };
            return contactDetails;
        }
        catch (error) {
            console.log(error);
            return rejectWithValue("Failed to fetch contact");
        }
    }
);

export const fetchDistinctCaseStatuses = createAsyncThunk<
    CaseStatusCount[],
    void,
    {
        rejectValue: string;
        state: RootState;
    }
>(
    'contact/fetchDistinctCaseStatuses',
    async (_, { rejectWithValue }) => {
        try {
            const data = await getDistinctCaseStatus();
            return data as CaseStatusCount[];
        }
        catch (error) {
            console.log(error);
            return rejectWithValue("Failed to fetch case statuses");
        }
    }
);

export const updateContactThunk = createAsyncThunk<
    Partial<ContactDetails>,
    { contactId: string; values: Partial<Omit<ContactData, 'id' | 'cases' | 'accountName' | 'accountIndustry' | 'accountPhone'>> },
    {
        rejectValue: string;
        state: RootState;
    }
>(
    'contact/updateContact',
    async ({ contactId, values }, { rejectWithValue }) => {
        try {
            const data = await updateContact(contactId, values);
            if (!data) {
                return rejectWithValue("Failed to update contact");
            }
            const contactDetails: Partial<ContactDetails> = {
                id: data.id,
                name: data.name,
                firstName: data.firstName ?? '',
                lastName: data.lastName ?? '',
                email: data.email,
                accountId: data.accountId,
                title: data.title

            };
            return contactDetails;
        }
        catch (error) {
            console.log(error);
            return rejectWithValue("Failed to update contact");
        }
    }
);

export const deleteContactThunk = createAsyncThunk<
    { id: string },
    string,
    {
        rejectValue: string;
        state: RootState;
    }
>(
    'contact/deleteContact',
    async (contactId: string, { rejectWithValue }) => {
        try {
            const data = await deleteContact(contactId);
            if (!data) {
                return rejectWithValue("Failed to delete contact");
            }
            return data;
        }
        catch (error: any) {
            console.log(error);
            return rejectWithValue(error?.message || "Failed to delete contact");
        }
    }
);

export const ContactSlice = createSlice({
    name: "contact",
    initialState,
    reducers: {
        // logoutUser: (state) => {
        //     state.currentUser = null;
        //     state.loading = false;
        //     state.error = null;
        // },
        logoutContact: () => initialState,
        // Clear selected contact without resetting whole state
        clearContact: (state) => {
            state.contact = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchContact
            .addCase(fetchContact.pending, (state) => {
                if (state.contact) {
                    state.contact.isLoading = true;
                }
                state.error = null;
            })
            .addCase(fetchContact.fulfilled, (state, action) => {
                if (state.contact) {
                    state.contact.isLoading = false;
                }
                state.contact = action.payload;
            })
            .addCase(fetchContact.rejected, (state, action) => {
                state.loading = false;
                if (state.contact) {
                    state.contact.isLoading = false;
                }
                state.error = action.payload || "Failed to fetch contact";
            })
            // fetchDistinctCaseStatuses
            .addCase(fetchDistinctCaseStatuses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDistinctCaseStatuses.fulfilled, (state, action) => {
                state.loading = false;
                state.caseStatuses = action.payload;
            })
            .addCase(fetchDistinctCaseStatuses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch case statuses";
            })
            // updateContactThunk
            .addCase(updateContactThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateContactThunk.fulfilled, (state, action) => {
                state.loading = false;
                if (state.contact && state.contact.id === action.payload.id) {
                    state.contact = {
                        ...state.contact,
                        ...action.payload,
                        cases: state.contact.cases
                    };
                }
            })
            .addCase(updateContactThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to update contact";
            })
            // deleteContactThunk
            .addCase(deleteContactThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteContactThunk.fulfilled, (state, action) => {
                state.loading = false;
                if (state.contact && state.contact.id === action.payload.id) {
                    state.contact = null;
                }
            })
            .addCase(deleteContactThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to delete contact";
            })
            // .addCase(fetchUser.pending, (state) => {
            //     state.loading = true;
            //     state.error = null;
            // })
            // .addCase(fetchUser.fulfilled, (state, action) => {
            //     state.loading = false;
            //     state.currentUser = action.payload;
            // })
            // .addCase(fetchUser.rejected, (state, action) => {
            //     state.loading = false;
            //     state.error = action.payload || "Failed to get user";
            //     toast.error(state.error);
            //})
            .addCase(createContactThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createContactThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.newContactResponse = action.payload;
                // Prepend the newly created contact to the contact list for immediate UI update
                // if (state.contactList && Array.isArray(state.contactList.data)) {
                //     state.contactList.data.unshift({
                //         id: action.payload.id,
                //         name: `${action.payload.firstName} ${action.payload.lastName}`.trim(),
                //         email: action.payload.email,
                //         title: action.payload.title,
                //     });
                // }
            })
            .addCase(createContactThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to get user";
                toast.error(state.error);
            })
            .addCase(fetchContactList.pending, (state) => {
                if (Array.isArray(state.contactList)) {
                    state.contactList = { data: [...state.contactList], isLoading: true };
                } else if (!state.contactList || typeof state.contactList !== 'object') {
                    state.contactList = { data: [], isLoading: true };
                } else {
                    state.contactList.isLoading = true;
                }
                state.error = null;
            })
            .addCase(fetchContactList.fulfilled, (state, action) => {
                if (Array.isArray(state.contactList)) {
                    state.contactList = { data: Array.isArray(action.payload) ? [...action.payload] : [], isLoading: false };
                } else if (!state.contactList || typeof state.contactList !== 'object') {
                    state.contactList = { data: Array.isArray(action.payload) ? [...action.payload] : [], isLoading: false };
                } else {
                    state.contactList.isLoading = false;
                    state.contactList.data = Array.isArray(action.payload) ? [...action.payload] : [];
                }
            })
            .addCase(fetchContactList.rejected, (state, action) => {
                if (Array.isArray(state.contactList)) {
                    state.contactList = { data: [...state.contactList], isLoading: false };
                } else if (!state.contactList || typeof state.contactList !== 'object') {
                    state.contactList = { data: [], isLoading: false };
                } else {
                    state.contactList.isLoading = false;
                }
                state.error = action.payload || "Failed to get contact list";
            });
    }
});

export const { logoutContact, clearContact } = ContactSlice.actions;
export default ContactSlice.reducer;