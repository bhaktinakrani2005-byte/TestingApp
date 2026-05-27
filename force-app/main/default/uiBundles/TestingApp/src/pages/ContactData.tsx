import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Edit, Save, X, Trash2, RefreshCcw, UserPlus } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { updateContactThunk, deleteContactThunk, fetchContact, fetchContactList, createContactThunk } from '../store/slice/ContactSlice';
import { useRedux } from '@/hook/useRedux';
import SidebarLoader from '@/components/ui/SidebarLoader';
import ContactDetailSkeleton from '../components/contacts/ContactDetailSkeleton';
import { createContact } from '@/api/contacts/contactService';

export default function ContactData() {
    const navigate = useNavigate();
    const { dispatch, selector } = useRedux();
    const { contactList, contact } = selector((state) => state.contact);
    const isLoading = contactList.isLoading;
    const contactData = Array.isArray(contactList) ? contactList : contactList?.data ?? [];

    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editValues, setEditValues] = useState({
        name: '',
        email: '',
        title: ''
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [search, setSearch] = useState('');

    // Create Modal state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createFormData, setCreateFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        title: '',
        accountId: ''
    });
    const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
    const [isCreating, setIsCreating] = useState(false);

    // Auto-select first contact in list on first load
    useEffect(() => {
        if (contactData.length > 0 && (!contact || !contact.id)) {
            dispatch(fetchContact(contactData[0].id));
        }
    }, [contactData, contact, dispatch]);

    useEffect(() => {
        if (contact && contact.id) {
            setEditValues({
                name: contact.name || '',
                email: contact.email || '',
                title: contact.title || ''
            });
        }
        console.log('Contact updated in state:', contactData);
        console.log('Contact in state:', contact);
    }, [contact]);

    const handleContactClick = (cItem: any) => {
        dispatch(fetchContact(cItem.id));
        console.log('Contact clicked:', cItem.id);
    };

    const filteredContacts = contactData?.filter((cItem) =>
        cItem.name?.toLowerCase().includes(search.toLowerCase()) ||
        cItem.email?.toLowerCase().includes(search.toLowerCase()) ||
        cItem.title?.toLowerCase().includes(search.toLowerCase())
    );

    const handleNewContact = () => {
        setCreateFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            title: '',
            accountId: ''
        });
        setCreateErrors({});
        setIsCreateModalOpen(true);
    };

    const validateCreateField = (name: string, value: string) => {
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
            case 'phone':
                if (!value.trim()) return 'Phone number is required';
                if (!/^\d{10}$/.test(value)) {
                    return 'Phone number must be 10 digits';
                }
                return '';
            case 'title':
                if (!value.trim()) return 'Title is required';
                return '';
            case 'accountId':
                if (!value.trim()) return 'Account ID is required';
                return '';
            default:
                return '';
        }
    };

    const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCreateFormData((prev) => ({
            ...prev,
            [name]: value
        }));
        if (createErrors[name]) {
            setCreateErrors((prev) => ({
                ...prev,
                [name]: validateCreateField(name, value)
            }));
        }
    };

    const handleCreateBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const error = validateCreateField(name, value);
        setCreateErrors((prev) => ({
            ...prev,
            [name]: error
        }));
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: Record<string, string> = {};
        Object.entries(createFormData).forEach(([key, val]) => {
            const err = validateCreateField(key, val);
            if (err) newErrors[key] = err;
        });

        if (Object.keys(newErrors).length > 0) {
            setCreateErrors(newErrors);
            return;
        }

        setIsCreating(true);
        try {
            dispatch(createContactThunk(createFormData)).unwrap();
            // console.log("RESPONCE : ", response);
            // if (response.success) {
            //     toast.success('Contact created successfully!');
            //     setIsCreateModalOpen(false);
            //     dispatch(fetchContactList());
            // } else {
            //     toast.error(response.error || 'Failed to create contact');
            // }
        } catch (error) {
            console.error(error);
            toast.error('Failed to create contact');
        } finally {
            setIsCreating(false);
        }
    };

    const handleUpdate = async () => {
        if (!contact) return;
        setIsUpdating(true);
        try {
            await dispatch(updateContactThunk({ contactId: contact.id, values: editValues })).unwrap();
            toast.success('Contact updated successfully!');
            setIsEditDialogOpen(false);
            dispatch(fetchContactList());
        } catch (error) {
            console.error('Update failed:', error);
            toast.error(typeof error === 'string' ? error : 'Failed to update contact. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!contact) return;
        setIsDeleting(true);
        try {
            await dispatch(deleteContactThunk(contact.id)).unwrap();
            toast.success('Contact deleted successfully!');
            setIsDeleteDialogOpen(false);
            dispatch(fetchContactList());
        } catch (error) {
            console.error('Delete failed:', error);
            toast.error(typeof error === 'string' ? error : 'Failed to delete contact. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex relative">
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleUp {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out forwards;
                }
                .animate-scaleUp {
                    animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>

            {/* SIDEBAR */}
            <aside className="w-80 bg-white border-r border-gray-200 p-4 hidden md:flex flex-col">

                {/* TOP HEADER */}
                <div className="mb-5">

                    {/* SEARCH + REFRESH */}
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
                            onClick={() => {
                                dispatch(fetchContactList())
                            }}
                        >
                            <RefreshCcw className="size-4" />
                        </Button>

                        <Button
                            type="button"
                            onClick={() => handleNewContact()}
                        >
                            New
                        </Button>

                    </div>

                </div>

                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-gray-700">
                        Contacts :  {contactData.length}
                    </h2>
                </div>

                {/* CONTACT LIST */}
                {isLoading ? <SidebarLoader /> : <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {filteredContacts?.map(cItem => {
                        const isSelected = contact?.id === cItem.id;
                        return (
                            <div
                                key={cItem.id}
                                onClick={() => handleContactClick(cItem)}
                                className={`flex items-center justify-between border rounded-xl px-3 py-2 transition cursor-pointer ${isSelected
                                    ? 'bg-blue-50 border-blue-400 shadow-sm ring-1 ring-blue-200'
                                    : 'bg-white border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                {/* LEFT */}
                                <div className="flex items-center gap-2 min-w-0">

                                    {/* AVATAR */}
                                    <div className={`size-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-colors ${isSelected
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {cItem.name?.charAt(0) || "C"}
                                    </div>

                                    {/* INFO */}
                                    <div className="min-w-0">
                                        <h3 className={`text-sm font-medium truncate transition-colors ${isSelected ? 'text-blue-900 font-bold' : 'text-gray-800'
                                            }`}>
                                            {cItem.name}
                                        </h3>

                                        <p className={`text-xs truncate transition-colors ${isSelected ? 'text-blue-700/80' : 'text-gray-500'
                                            }`}>
                                            {cItem.email || "No Email"}
                                        </p>
                                    </div>
                                </div>

                                {/* RIGHT */}
                                <div className={`text-[11px] shrink-0 ml-2 transition-colors ${isSelected ? 'text-blue-700/80 font-medium' : 'text-gray-400'
                                    }`}>
                                    {cItem.title || "No Title"}
                                </div>
                            </div>
                        )
                    })}
                </div>}

            </aside>

            {/* MAIN CONTENT */}
            {contact?.isLoading ? <ContactDetailSkeleton /> : <div className="p-4 md:p-8 space-y-8 flex-1">
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <h1 className="text-3xl font-bold">
                            {contact && contact.id ? `Contact Details: ${contact.name}` : 'Contact Details'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {contact && contact.id && (
                            <>
                                {/* Delete Button */}
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => setIsDeleteDialogOpen(true)}
                                >
                                    <Trash2 className="size-4" />
                                    Delete
                                </Button>

                                {/* Edit Button */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => setIsEditDialogOpen(true)}
                                >
                                    <Edit className="size-4" />
                                    Edit
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {contact && contact.id ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Contact Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Contact Information</CardTitle>
                                </CardHeader>
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

                            {/* Account Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Account Information</CardTitle>
                                </CardHeader>
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

                        {/* Related Cases */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Related Cases</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {contact.cases && contact.cases.length > 0 ? (
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
                                            {contact.cases.map((c) => (
                                                <TableRow key={c.id}>
                                                    <TableCell className="font-medium">{c.caseNumber}</TableCell>
                                                    <TableCell>{c.subject}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{c.status}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary">{c.priority}</Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No related cases found.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="py-8 text-center text-red-650 font-medium">
                            No contact selected. Choose a contact from the list.
                        </CardContent>
                    </Card>
                )}
            </div>
            }

            {/* CREATE CONTACT MODAL */}
            {isCreateModalOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 animate-fadeIn"
                    onClick={() => setIsCreateModalOpen(false)}
                >
                    <div
                        className="w-full max-w-4xl bg-white rounded-[20px] shadow-2xl overflow-hidden border border-gray-200 transition-all duration-300 transform animate-scaleUp"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* HEADER */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-xl bg-white/20 flex items-center justify-center text-white">
                                    <UserPlus size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        Create Contact
                                    </h2>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(false)}
                                className="flex items-center justify-center bg-white/20 hover:bg-white/30 text-white w-10 h-10 rounded-xl transition-all duration-200"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* FORM */}
                        <form onSubmit={handleCreateSubmit} className="p-5 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* FIRST NAME */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <Label className="text-sm font-semibold text-gray-700" htmlFor="modal-fname">
                                            First Name <span className="text-red-500">*</span>
                                        </Label>
                                        {createErrors.firstName && (
                                            <p className="text-red-550 text-xs font-semibold text-red-500 animate-pulse">
                                                {createErrors.firstName}
                                            </p>
                                        )}
                                    </div>
                                    <Input
                                        type="text"
                                        name="firstName"
                                        id="modal-fname"
                                        value={createFormData.firstName}
                                        onChange={handleCreateChange}
                                        onBlur={handleCreateBlur}
                                        placeholder="Enter first name"
                                        className={createErrors.firstName ? 'border-red-500 bg-red-50' : ''}
                                    />
                                </div>

                                {/* LAST NAME */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <Label className="text-sm font-semibold text-gray-700" htmlFor="modal-lname">
                                            Last Name <span className="text-red-500">*</span>
                                        </Label>
                                        {createErrors.lastName && (
                                            <p className="text-red-550 text-xs font-semibold text-red-500 animate-pulse">
                                                {createErrors.lastName}
                                            </p>
                                        )}
                                    </div>
                                    <Input
                                        type="text"
                                        name="lastName"
                                        id="modal-lname"
                                        value={createFormData.lastName}
                                        onChange={handleCreateChange}
                                        onBlur={handleCreateBlur}
                                        placeholder="Enter last name"
                                        className={createErrors.lastName ? 'border-red-500 bg-red-50' : ''}
                                    />
                                </div>

                                {/* EMAIL */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <Label className="text-sm font-semibold text-gray-700" htmlFor="modal-email">
                                            Email <span className="text-red-500">*</span>
                                        </Label>
                                        {createErrors.email && (
                                            <p className="text-red-550 text-xs font-semibold text-red-500 animate-pulse">
                                                {createErrors.email}
                                            </p>
                                        )}
                                    </div>
                                    <Input
                                        type="email"
                                        name="email"
                                        id="modal-email"
                                        value={createFormData.email}
                                        onChange={handleCreateChange}
                                        onBlur={handleCreateBlur}
                                        placeholder="Enter email address"
                                        className={createErrors.email ? 'border-red-500 bg-red-50' : ''}
                                    />
                                </div>
                                {/* 
                                {/* PHONE */}
                                {/* <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <Label className="text-sm font-semibold text-gray-700" htmlFor="modal-phone">
                                            Phone Number <span className="text-red-500">*</span>
                                        </Label>
                                        {createErrors.phone && (
                                            <p className="text-red-550 text-xs font-semibold text-red-500 animate-pulse">
                                                {createErrors.phone}
                                            </p>
                                        )}
                                    </div>
                                    <Input
                                        type="text"
                                        name="phone"
                                        id="modal-phone"
                                        value={createFormData.phone}
                                        onChange={handleCreateChange}
                                        onBlur={handleCreateBlur}
                                        placeholder="Enter 10 digit phone number"
                                        className={createErrors.phone ? 'border-red-500 bg-red-50' : ''}
                                    />
                                </div>  */}

                                {/* TITLE */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <Label className="text-sm font-semibold text-gray-700" htmlFor="modal-title">
                                            Job Title <span className="text-red-500">*</span>
                                        </Label>
                                        {createErrors.title && (
                                            <p className="text-red-550 text-xs font-semibold text-red-500 animate-pulse">
                                                {createErrors.title}
                                            </p>
                                        )}
                                    </div>
                                    <Input
                                        type="text"
                                        name="title"
                                        id="modal-title"
                                        value={createFormData.title}
                                        onChange={handleCreateChange}
                                        onBlur={handleCreateBlur}
                                        placeholder="Enter job title"
                                        className={createErrors.title ? 'border-red-500 bg-red-50' : ''}
                                    />
                                </div>

                                {/* ACCOUNT ID
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <Label className="text-sm font-semibold text-gray-700" htmlFor="modal-accountId">
                                            Account ID <span className="text-red-500">*</span>
                                        </Label>
                                        {createErrors.accountId && (
                                            <p className="text-red-550 text-xs font-semibold text-red-500 animate-pulse">
                                                {createErrors.accountId}
                                            </p>
                                        )}
                                    </div>
                                    <Input
                                        type="text"
                                        name="accountId"
                                        id="modal-accountId"
                                        value={createFormData.accountId}
                                        onChange={handleCreateChange}
                                        onBlur={handleCreateBlur}
                                        placeholder="Enter Salesforce account ID"
                                        className={createErrors.accountId ? 'border-red-500 bg-red-50' : ''}
                                    />
                                </div> */}
                            </div>

                            {/* ACTION BUTTONS */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-5"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isCreating}
                                    className="px-6 bg-gradient-to-r from-blue-600 to-indigo-700 hover:opacity-90 text-white shadow-md font-semibold"
                                >
                                    {isCreating ? 'Creating...' : 'Create Contact'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT CONTACT MODAL */}
            {isEditDialogOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 animate-fadeIn"
                    onClick={() => setIsEditDialogOpen(false)}
                >
                    <div
                        className="w-full max-w-2xl bg-white rounded-[20px] shadow-2xl overflow-hidden border border-gray-200 transition-all duration-300 transform animate-scaleUp"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* HEADER */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-xl bg-white/20 flex items-center justify-center text-white">
                                    <Edit size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        Edit Contact
                                    </h2>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsEditDialogOpen(false)}
                                className="flex items-center justify-center bg-white/20 hover:bg-white/30 text-white w-10 h-10 rounded-xl transition-all duration-200"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* FORM */}
                        <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }} className="p-5 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-sm font-semibold text-gray-700 mb-1.5 block" htmlFor="edit-name">
                                        Name
                                    </Label>
                                    <Input
                                        id="edit-name"
                                        type="text"
                                        value={editValues.name}
                                        onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                                        placeholder="Enter name"
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm font-semibold text-gray-700 mb-1.5 block" htmlFor="edit-email">
                                        Email
                                    </Label>
                                    <Input
                                        id="edit-email"
                                        type="email"
                                        value={editValues.email}
                                        onChange={(e) => setEditValues({ ...editValues, email: e.target.value })}
                                        placeholder="Enter email address"
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm font-semibold text-gray-700 mb-1.5 block" htmlFor="edit-title">
                                        Title
                                    </Label>
                                    <Input
                                        id="edit-title"
                                        type="text"
                                        value={editValues.title}
                                        onChange={(e) => setEditValues({ ...editValues, title: e.target.value })}
                                        placeholder="Enter job title"
                                    />
                                </div>
                            </div>

                            {/* ACTION BUTTONS */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsEditDialogOpen(false)}
                                    className="px-5"
                                    disabled={isUpdating}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="px-6 bg-gradient-to-r from-blue-600 to-indigo-700 hover:opacity-90 text-white shadow-md font-semibold"
                                >
                                    {isUpdating ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DELETE CONTACT MODAL */}
            {isDeleteDialogOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 animate-fadeIn"
                    onClick={() => setIsDeleteDialogOpen(false)}
                >
                    <div
                        className="w-full max-w-md bg-white rounded-[20px] shadow-2xl overflow-hidden border border-gray-200 transition-all duration-300 transform animate-scaleUp"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* HEADER */}
                        <div className="bg-gradient-to-r from-red-650 to-rose-700 bg-red-600 px-5 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-xl bg-white/20 flex items-center justify-center text-white">
                                    <Trash2 size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        Delete Contact
                                    </h2>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsDeleteDialogOpen(false)}
                                className="flex items-center justify-center bg-white/20 hover:bg-white/30 text-white w-10 h-10 rounded-xl transition-all duration-200"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* BODY */}
                        <div className="p-5 space-y-6">
                            <p className="text-gray-650 text-base leading-relaxed">
                                Are you sure you want to delete <span className="font-bold text-gray-900">{contact?.name}</span>? This action cannot be undone and will permanently remove this contact.
                            </p>

                            {/* ACTION BUTTONS */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsDeleteDialogOpen(false)}
                                    className="px-5"
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="px-6 bg-gradient-to-r from-red-600 to-rose-750 bg-red-600 hover:opacity-90 text-white shadow-md font-semibold"
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
