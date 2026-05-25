import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "..";
import { 
    getContact, 
    getDistinctCaseStatus, 
    updateContact, 
    deleteContact, 
    ContactData 
} from "@/api/contacts/contactService";

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
    email: string;
    accountId: string;
    title: string;
    accountName: string;
    accountIndustry: string;
    accountPhone: string | null;
    cases: Case[];
}

export interface CaseStatusCount {
    status: string;
    count: number;
}

interface ContactState {
    contact: ContactDetails | null;
    caseStatuses: CaseStatusCount[];
    loading: boolean;
    error: string | null;
}

const initialState: ContactState = {
    contact: null,
    caseStatuses: [],
    loading: false,
    error: null,
};

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
                name: data.name,
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
    ContactDetails,
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
            const contactDetails: ContactDetails = {
                id: data.id,
                name: data.name,
                email: data.email,
                accountId: data.accountId,
                title: data.title,
                accountName: data.accountName,
                accountIndustry: data.accountIndustry || '',
                accountPhone: data.accountPhone ?? null,
                cases: []
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
        catch (error) {
            console.log(error);
            return rejectWithValue("Failed to delete contact");
        }
    }
);

export const ContactSlice = createSlice({
    name: "contact",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // fetchContact
            .addCase(fetchContact.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchContact.fulfilled, (state, action) => {
                state.loading = false;
                state.contact = action.payload;
            })
            .addCase(fetchContact.rejected, (state, action) => {
                state.loading = false;
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
            });
    }
});

export default ContactSlice.reducer;
