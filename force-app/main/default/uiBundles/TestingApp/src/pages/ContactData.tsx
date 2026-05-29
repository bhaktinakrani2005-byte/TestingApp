import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Edit, X, Trash2, RefreshCcw, UserPlus } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import {
    updateContactThunk,
    deleteContactThunk,
    fetchContact,
    fetchContactList,
    createContactThunk
} from '../store/slice/ContactSlice';
import { useRedux } from '@/hook/useRedux';
import SidebarLoader from '@/components/ui/SidebarLoader';
import ContactDetailSkeleton from '../components/contacts/ContactDetailSkeleton';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    title: string;
}

interface ModalState {
    open: boolean;
    mode: 'create' | 'edit';
    contactId: string | null;
}

const EMPTY_FORM: FormData = { firstName: '', lastName: '', email: '', title: '' };

// ─── Validation ───────────────────────────────────────────────────────────────

function validateField(name: keyof FormData, value: string): string {
    const limits: Record<keyof FormData, number> = {
        firstName: 15,
        lastName: 15,
        email: 30,
        title: 20,
    };
    switch (name) {
        case 'firstName':
        case 'lastName':
            if (!value.trim()) return `${name === 'firstName' ? 'First' : 'Last'} name is required`;
            if (value.trim().length < 2) return 'Minimum 2 characters required';
            if (value.length > limits[name]) return `${name} cannot exceed ${limits[name]} characters`;
            return '';
        case 'email':
            if (!value.trim()) return 'Email is required';
            if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) return 'Invalid email address';
            if (value.length > limits.email) return `Email cannot exceed ${limits.email} characters`;
            return '';
        case 'title':
            if (!value.trim()) return 'Title is required';
            if (value.length > limits.title) return `Title cannot exceed ${limits.title} characters`;
            return '';
        default:
            return '';
    }
}

function validateAll(data: FormData): Record<string, string> {
    const errors: Record<string, string> = {};
    (Object.keys(data) as (keyof FormData)[]).forEach((key) => {
        const err = validateField(key, data[key]);
        if (err) errors[key] = err;
    });
    return errors;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ContactData() {
    const navigate = useNavigate();
    const { dispatch, selector } = useRedux();
    const { contactList, contact } = selector((state) => state.contact);
    const isLoading = contactList.isLoading;
    const contactData: any[] = Array.isArray(contactList) ? contactList : contactList?.data ?? [];

    // Unified modal state
    const [modal, setModal] = useState<ModalState>({ open: false, mode: 'create', contactId: null });
    const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Delete modal
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [search, setSearch] = useState('');

    // Auto-select first contact
    useEffect(() => {
        if (contactData.length > 0 && (!contact || !contact.id)) {
            dispatch(fetchContact([...contactData].reverse()[0].id));
        }
    }, [contactData, contact, dispatch]);

    // ── Modal helpers ──────────────────────────────────────────────────────────

    const handleOpenModal = (mode: 'create' | 'edit', contactObj?: typeof contact) => {
        if (mode === 'edit' && contactObj?.id) {
            // Populate form fields with existing contact data
            console.log('contactObj for edit', contactObj);
            setFormData({
                firstName: contactObj.firstName || '',
                lastName: contactObj.lastName || '',
                email: contactObj.email || '',
                title: contactObj.title || '',
            });
            setModal({ open: true, mode: 'edit', contactId: contactObj.id });
        } else {
            setFormData(EMPTY_FORM);
            setModal({ open: true, mode: 'create', contactId: null });
        }
        setFormErrors({});
    };

    const handleCloseModal = () => {
        setModal((prev) => ({ ...prev, open: false }));
        setFormErrors({});
    };

    // ── Form handlers ──────────────────────────────────────────────────────────

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors((prev) => ({ ...prev, [name]: validateField(name as keyof FormData, value) }));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormErrors((prev) => ({ ...prev, [name]: validateField(name as keyof FormData, value) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errors = validateAll(formData);
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setIsSubmitting(true);
        try {
            if (modal.mode === 'create') {
                await dispatch(createContactThunk(formData)).unwrap();
                toast.success('Contact created successfully!');
            } else {
                const updatedValues = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    title: formData.title,
                };
                await dispatch(updateContactThunk({ contactId: modal.contactId!, values: updatedValues })).unwrap();
                toast.success('Contact updated successfully!');
            }
            dispatch(fetchContactList());
            handleCloseModal();
            if (modal.mode === 'create') navigate('/contact');
        } catch (error: any) {
            // toast.error(
            //     modal.mode === 'create' ? 'Failed to create contact' : 'Failed to update contact. Please try again.'
            // );
            console.log("Submit error :", error);

            toast.error(
                typeof error === 'string'
                    ? error
                    : error?.message ||
                    (
                        modal.mode === 'create'
                            ? 'Failed to create contact'
                            : 'Failed to update contact'
                    )
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Delete ─────────────────────────────────────────────────────────────────

    const handleDelete = async () => {
        if (!contact) return;
        console.log('RAW contact.id:', JSON.stringify(contact.id));
        setIsDeleting(true);
        try {
            console.log('delete started');
            await dispatch(deleteContactThunk(contact.id)).unwrap();
            console.log('delete completed');
            setIsDeleteDialogOpen(false);

            // // refresh list
            // const updatedList = await dispatch(fetchContactList()).unwrap();

            // // select first remaining contact
            // if (updatedList?.length > 0) {
            //     dispatch(fetchContact(updatedList[0].id));
            // }

            // toast.success('Contact deleted successfully!');

            dispatch(fetchContactList());
            navigate('/contact');
        } catch (error) {
            toast.error(typeof error === 'string' ? error : 'Failed to delete contact. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    // ── Filtered list ──────────────────────────────────────────────────────────

    const filteredContacts = contactData?.filter(
        (c) =>
            c.name?.toLowerCase().includes(search.toLowerCase()) ||
            c.email?.toLowerCase().includes(search.toLowerCase()) ||
            c.title?.toLowerCase().includes(search.toLowerCase())
    );

    const isEdit = modal.mode === 'edit';

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-[90vh] bg-gray-100 flex relative">
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
                .animate-scaleUp { animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>

            {/* ── SIDEBAR ── */}
            <aside className="w-80 bg-white border-r border-gray-200 p-4 hidden md:flex flex-col">
                <div className="mb-5">
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="Search contacts..."
                            className="h-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="shrink-0"
                            disabled={isLoading}
                            onClick={() => dispatch(fetchContactList())}
                        >
                            <RefreshCcw className="size-4" />
                        </Button>
                        <Button type="button" onClick={() => handleOpenModal('create')}>
                            New
                        </Button>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-gray-700">Contacts: {contactData.length}</h2>
                </div>

                {isLoading ? (
                    <SidebarLoader />
                ) : (
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                        {[...filteredContacts].reverse().map((cItem) => {
                            const isSelected = contact?.id === cItem.id;
                            return (
                                <div
                                    key={cItem.id}
                                    onClick={() => dispatch(fetchContact(cItem.id))}
                                    className={`flex items-center justify-between border rounded-xl px-3 py-2 transition cursor-pointer ${isSelected
                                        ? 'bg-blue-50 border-blue-400 shadow-sm ring-1 ring-blue-200'
                                        : 'bg-white border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div
                                            className={`size-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${isSelected
                                                ? 'bg-blue-600 text-white shadow-sm'
                                                : 'bg-blue-100 text-blue-700'
                                                }`}
                                        >
                                            {cItem.name?.charAt(0) || 'C'}
                                        </div>
                                        <div className="min-w-0">
                                            <h3
                                                className={`text-sm font-medium truncate ${isSelected ? 'text-blue-900 font-bold' : 'text-gray-800'
                                                    }`}
                                            >
                                                {cItem.name}
                                            </h3>
                                            <p
                                                className={`text-xs ${isSelected ? 'text-blue-700/80' : 'text-gray-500'
                                                    }`}
                                            >
                                                {cItem.email || 'No Email'}
                                            </p>
                                        </div>
                                    </div>
                                    <div
                                        className={`text-[11px] shrink-0 ml-2 ${isSelected ? 'text-blue-700/80 font-medium' : 'text-gray-400'
                                            }`}
                                    >
                                        {cItem.title || 'No Title'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </aside>

            {/* ── MAIN CONTENT ── */}
            {contact?.isLoading ? (
                <ContactDetailSkeleton />
            ) : (
                <div className="p-4 md:p-8 space-y-8 flex-1">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold">
                            {contact?.id ? `Contact Details: ${contact.name}` : 'Contact Details'}
                        </h1>
                        {contact?.id && (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => setIsDeleteDialogOpen(true)}
                                >
                                    <Trash2 className="size-4" />
                                    Delete
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => handleOpenModal('edit', contact)}
                                >
                                    <Edit className="size-4" />
                                    Edit
                                </Button>
                            </div>
                        )}
                    </div>

                    {contact?.id ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Name</p>
                                            <p className="text-lg font-semibold">{contact.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Email</p>
                                            <p className="text-lg">{contact.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Title</p>
                                            <p className="text-lg">{contact.title}</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader><CardTitle>Account Information</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Account Name</p>
                                            <p className="text-lg font-semibold">{contact.accountName || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Industry</p>
                                            <p className="text-lg">{contact.accountIndustry || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Phone</p>
                                            <p className="text-lg">{contact.accountPhone || 'N/A'}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader><CardTitle>Related Cases</CardTitle></CardHeader>
                                <CardContent>
                                    {contact.cases?.length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Case Number</TableHead>
                                                    <TableHead>Subject</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Priority</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {contact.cases.map((c: any) => (
                                                    <TableRow key={c.id}>
                                                        <TableCell className="font-medium">{c.caseNumber}</TableCell>
                                                        <TableCell>{c.subject}</TableCell>
                                                        <TableCell><Badge variant="outline">{c.status}</Badge></TableCell>
                                                        <TableCell><Badge variant="secondary">{c.priority}</Badge></TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">No related cases found.</div>
                                    )}
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <Card className="border-red-200 bg-red-50">
                            <CardContent className="py-8 text-center text-red-600 font-medium">
                                No contact selected. Choose a contact from the list.
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════════
                UNIFIED CREATE / EDIT MODAL
            ══════════════════════════════════════════ */}
            {modal.open && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
                    onClick={handleCloseModal}
                >
                    <div
                        className="w-full max-w-2xl bg-white rounded-[20px] shadow-2xl overflow-hidden border border-gray-200 animate-scaleUp"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-xl bg-white/20 flex items-center justify-center text-white">
                                    {isEdit ? <Edit size={24} /> : <UserPlus size={24} />}
                                </div>
                                <h2 className="text-2xl font-bold text-white">
                                    {isEdit ? 'Edit Contact' : 'Create Contact'}
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="flex items-center justify-center bg-white/20 hover:bg-white/30 text-white w-10 h-10 rounded-xl transition-all duration-200"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-5 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* First Name */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <Label className="text-sm font-semibold text-gray-700" htmlFor="firstName">
                                            First Name <span className="text-red-500">*</span>
                                        </Label>
                                        {formErrors.firstName && (
                                            <p className="text-xs font-semibold text-red-500 animate-pulse">
                                                {formErrors.firstName}
                                            </p>
                                        )}
                                    </div>
                                    <Input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Enter first name"
                                        className={formErrors.firstName ? 'border-red-500 bg-red-50' : ''}
                                    />
                                </div>

                                {/* Last Name */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <Label className="text-sm font-semibold text-gray-700" htmlFor="lastName">
                                            Last Name <span className="text-red-500">*</span>
                                        </Label>
                                        {formErrors.lastName && (
                                            <p className="text-xs font-semibold text-red-500 animate-pulse">
                                                {formErrors.lastName}
                                            </p>
                                        )}
                                    </div>
                                    <Input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Enter last name"
                                        className={formErrors.lastName ? 'border-red-500 bg-red-50' : ''}
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <Label className="text-sm font-semibold text-gray-700" htmlFor="email">
                                            Email <span className="text-red-500">*</span>
                                        </Label>
                                        {formErrors.email && (
                                            <p className="text-xs font-semibold text-red-500 animate-pulse">
                                                {formErrors.email}
                                            </p>
                                        )}
                                    </div>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Enter email address"
                                        className={formErrors.email ? 'border-red-500 bg-red-50' : ''}
                                    />
                                </div>

                                {/* Title */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <Label className="text-sm font-semibold text-gray-700" htmlFor="title">
                                            Job Title <span className="text-red-500">*</span>
                                        </Label>
                                        {formErrors.title && (
                                            <p className="text-xs font-semibold text-red-500 animate-pulse">
                                                {formErrors.title}
                                            </p>
                                        )}
                                    </div>
                                    <Input
                                        id="title"
                                        name="title"
                                        type="text"
                                        value={formData.title}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Enter job title"
                                        className={formErrors.title ? 'border-red-500 bg-red-50' : ''}
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                {!isEdit && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => {
                                            setFormData(EMPTY_FORM);
                                            setFormErrors({});
                                        }}
                                        disabled={isSubmitting}
                                        className="px-5 bg-black/10"
                                    >
                                        Clear
                                    </Button>
                                )}
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 bg-gradient-to-r from-blue-600 to-indigo-700 hover:opacity-90 text-white shadow-md font-semibold"
                                >
                                    {isSubmitting
                                        ? isEdit ? 'Saving...' : 'Creating...'
                                        : isEdit ? 'Save Changes' : 'Create Contact'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── DELETE MODAL (unchanged logic, kept separate — it's a confirmation, not a form) ── */}
            {isDeleteDialogOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
                    onClick={() => setIsDeleteDialogOpen(false)}
                >
                    <div
                        className="w-full max-w-md bg-white rounded-[20px] shadow-2xl overflow-hidden border border-gray-200 animate-scaleUp"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-red-600 px-5 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-xl bg-white/20 flex items-center justify-center text-white">
                                    <Trash2 size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Delete Contact</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsDeleteDialogOpen(false)}
                                className="flex items-center justify-center bg-white/20 hover:bg-white/30 text-white w-10 h-10 rounded-xl transition-all duration-200"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-5 space-y-6">
                            <p className="text-gray-700 text-base leading-relaxed">
                                Are you sure you want to delete{' '}
                                <span className="font-bold text-gray-900">{contact?.name}</span>? This action cannot be
                                undone and will permanently remove this contact.
                            </p>
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsDeleteDialogOpen(false)}
                                    disabled={isDeleting}
                                    className="px-5 bg-black/10"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="px-6 bg-red-600 hover:opacity-90 text-white shadow-md font-semibold"
                                >
                                    {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}