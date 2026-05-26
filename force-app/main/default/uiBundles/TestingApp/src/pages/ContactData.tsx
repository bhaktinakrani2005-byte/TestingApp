import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Edit, Save, X, ArrowLeft, Trash2, RefreshCcw } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { updateContactThunk, deleteContactThunk, fetchContactList } from '../store/slice/ContactSlice';
import { useRedux } from '@/hook/useRedux';

export default function ContactData() {
    const navigate = useNavigate();
    const { dispatch, selector } = useRedux();
    const { contactList = [], contact } = selector((state) => state.contact);


    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editValues, setEditValues] = useState({
        name: '',
        email: '',
        title: ''
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);


    useEffect(() => {
        if (contact) {
            setEditValues({
                name: contact.name || '',
                email: contact.email || '',
                title: contact.title || ''
            });
        }
    }, [contact]);

    const handleUpdate = async () => {
        if (!contact) return;
        setIsUpdating(true);
        try {
            await dispatch(updateContactThunk({ contactId: contact.id, values: editValues })).unwrap();
            toast.success('Contact updated successfully!');
            setIsEditDialogOpen(false);
            setTimeout(() => {
                navigate('/contact');
            }, 1500);
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
            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (error) {
            console.error('Delete failed:', error);
            toast.error(typeof error === 'string' ? error : 'Failed to delete contact. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">

            {/* SIDEBAR */}
            <aside className="w-80 bg-white border-r border-gray-200 p-4 hidden md:flex flex-col">

                {/* TOP HEADER */}
                <div className="mb-5">

                    {/* SEARCH + REFRESH */}
                    <div className="flex items-center gap-2">

                        <Input
                            placeholder="Search contacts..."
                            className="h-10"
                        />

                        <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0"
                            onClick={() => dispatch(fetchContactList())}
                        >
                            <RefreshCcw className="size-4" />
                        </Button>

                    </div>

                </div>

                {/* CONTACT LIST */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {contactList?.map(contact => {
                        return (
                            <div
                                key={contact.id}
                                className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-3 py-2 hover:bg-gray-50 transition cursor-pointer"
                            >
                                {/* LEFT */}
                                <div className="flex items-center gap-2 min-w-0">

                                    {/* AVATAR */}
                                    <div className="size-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-semibold shrink-0">
                                        {contact.name?.charAt(0) || "C"}
                                    </div>

                                    {/* INFO */}
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-medium text-gray-800 truncate">
                                            {contact.name}
                                        </h3>

                                        <p className="text-xs text-gray-500 truncate">
                                            {contact.email || "No Email"}
                                        </p>
                                    </div>
                                </div>

                                {/* RIGHT */}
                                <div className="text-[11px] text-gray-400 shrink-0 ml-2">
                                    {contact.title || "No Title"}
                                </div>
                            </div>

                        )

                    })}
                    {/* <Button onClick={() => dispatch(fetchContactList())}>Get Contact List</Button> */}
                </div>

            </aside>

            {/* MAIN CONTENT */}
            <div className="p-4 md:p-8 space-y-8 flex-1">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                            <ArrowLeft className="size-5" />
                        </Button>
                        <h1 className="text-3xl font-bold">Contact Details</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {contact && (
                            <>
                                {/* Delete Button & Dialog */}
                                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="destructive" size="sm" className="gap-2">
                                            <Trash2 className="size-4" />
                                            Delete
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Delete Contact</DialogTitle>
                                            <DialogDescription>
                                                Are you sure you want to delete this contact? This action cannot be undone.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
                                                Cancel
                                            </Button>
                                            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                                                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>

                                {/* Edit Button & Dialog */}
                                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="gap-2">
                                            <Edit className="size-4" />
                                            Edit
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Edit Contact</DialogTitle>
                                            <DialogDescription>
                                                Update the contact's personal information.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="name">Name</Label>
                                                <Input
                                                    id="name"
                                                    type="text"
                                                    value={editValues.name}
                                                    onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={editValues.email}
                                                    onChange={(e) => setEditValues({ ...editValues, email: e.target.value })}
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="title">Title</Label>
                                                <Input
                                                    id="title"
                                                    value={editValues.title}
                                                    onChange={(e) => setEditValues({ ...editValues, title: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)} disabled={isUpdating}>
                                                <X className="mr-2 size-4" />
                                                Cancel
                                            </Button>
                                            <Button onClick={handleUpdate} disabled={isUpdating}>
                                                <Save className="mr-2 size-4" />
                                                {isUpdating ? 'Saving...' : 'Save Changes'}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </>
                        )}
                    </div>
                </div>

                {contact ? (
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
                        <CardContent className="py-8 text-center text-red-600">
                            No contact found for ID: {process.env.VITE_CONTACT_ID || '003Qy00000PeGVvIAN'}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
