import { useState } from 'react';
import { Button, TextField } from '@mui/material';
import { createGuide } from './tourapi';

const AddTourGuide = ({ onGuideAdded }) => {
    const [guide, setGuide] = useState({ name: '', email: '', languages: '', experience: '', description: '', image: null });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(guide).forEach(key => formData.append(key, guide[key]));

        await createGuide(formData);
        onGuideAdded();
        setGuide({ name: '', email: '', languages: '', experience: '', description: '', image: null });
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px', margin: 'auto' }}>
            <TextField label="Name" value={guide.name} onChange={(e) => setGuide({ ...guide, name: e.target.value })} fullWidth required />
            <TextField label="Email" type="email" value={guide.email} onChange={(e) => setGuide({ ...guide, email: e.target.value })} fullWidth required />
            <TextField label="Languages (comma separated)" value={guide.languages} onChange={(e) => setGuide({ ...guide, languages: e.target.value })} fullWidth required />
            <TextField label="Experience (years)" type="number" value={guide.experience} onChange={(e) => setGuide({ ...guide, experience: e.target.value })} fullWidth required />
            <TextField label="Description" multiline rows={3} value={guide.description} onChange={(e) => setGuide({ ...guide, description: e.target.value })} fullWidth required />
            <input type="file" onChange={(e) => setGuide({ ...guide, image: e.target.files[0] })} required />
            <Button type="submit" variant="contained" color="primary">Add Guide</Button>
        </form>
    );
};

export default AddTourGuide;
