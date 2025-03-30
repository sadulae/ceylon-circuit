import { useEffect, useState } from 'react';
import { fetchGuides, deleteGuide, updateGuide } from './tourapi';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';

const TourGuideList = () => {
    const [guides, setGuides] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedGuide, setSelectedGuide] = useState(null);
    const [updatedGuide, setUpdatedGuide] = useState({ name: '', email: '', languages: '', experience: '', description: '', image: null });

    const loadGuides = async () => {
        const response = await fetchGuides();
        setGuides(response.data);
    };

    useEffect(() => {
        const loadGuides = async () => {
            const response = await fetchGuides();
            console.log("Fetched Guides:", response.data); // Debugging
            setGuides(response.data);
        };
        loadGuides();
    }, []);
    

    const handleDelete = async (id) => {
        await deleteGuide(id);
        loadGuides();
    };

    const handleOpenUpdateModal = (guide) => {
        setSelectedGuide(guide);
        setUpdatedGuide({
            name: guide.name,
            email: guide.email,
            languages: guide.languages.join(', '),
            experience: guide.experience,
            description: guide.description,
            image: null
        });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedGuide(null);
    };

    const handleUpdate = async () => {
        if (!selectedGuide) return;
        const formData = new FormData();
        formData.append('name', updatedGuide.name);
        formData.append('email', updatedGuide.email);
        formData.append('languages', updatedGuide.languages);
        formData.append('experience', updatedGuide.experience);
        formData.append('description', updatedGuide.description);
        if (updatedGuide.image) formData.append('image', updatedGuide.image);

        await updateGuide(selectedGuide._id, formData);
        handleClose();
        loadGuides();
    };

    return (
        <>
            <TableContainer component={Paper} style={{ marginTop: '20px' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Languages</TableCell>
                            <TableCell>Experience</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Image</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {guides.map((guide) => (
                            <TableRow key={guide._id}>
                                <TableCell>{guide.name}</TableCell>
                                <TableCell>{guide.email}</TableCell>
                                <TableCell>{guide.languages.join(', ')}</TableCell>
                                <TableCell>{guide.experience} years</TableCell>
                                <TableCell>{guide.description}</TableCell>
                                <TableCell>
                                <img 
    src={`http://localhost:5000/uploads/${guide.image}`} 
    alt="Guide" 
    width="50" 
    onError={(e) => { 
        console.error("Image failed to load:", e.target.src); 
        e.target.src = "/fallback-image.jpg"; // Optional fallback
    }} 
/>

                                </TableCell>
                                <TableCell>
                                    <Button color="primary" onClick={() => handleOpenUpdateModal(guide)}>Update</Button>
                                    <Button color="error" onClick={() => handleDelete(guide._id)}>Delete</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Update Modal */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Update Guide</DialogTitle>
                <DialogContent>
                    <TextField label="Name" fullWidth margin="dense" value={updatedGuide.name} onChange={(e) => setUpdatedGuide({ ...updatedGuide, name: e.target.value })} />
                    <TextField label="Email" fullWidth margin="dense" value={updatedGuide.email} onChange={(e) => setUpdatedGuide({ ...updatedGuide, email: e.target.value })} />
                    <TextField label="Languages" fullWidth margin="dense" value={updatedGuide.languages} onChange={(e) => setUpdatedGuide({ ...updatedGuide, languages: e.target.value })} />
                    <TextField label="Experience" type="number" fullWidth margin="dense" value={updatedGuide.experience} onChange={(e) => setUpdatedGuide({ ...updatedGuide, experience: e.target.value })} />
                    <TextField label="Description" fullWidth margin="dense" multiline rows={3} value={updatedGuide.description} onChange={(e) => setUpdatedGuide({ ...updatedGuide, description: e.target.value })} />
                    <input type="file" accept="image/*" onChange={(e) => setUpdatedGuide({ ...updatedGuide, image: e.target.files[0] })} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">Cancel</Button>
                    <Button onClick={handleUpdate} color="primary">Update</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default TourGuideList;
