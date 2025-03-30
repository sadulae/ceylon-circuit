import { useEffect, useState } from 'react';
import { fetchGuides } from './tourapi';
import { Card, CardContent, CardMedia, Typography, Grid, Paper } from '@mui/material';

const UserGuides = () => {
    const [guides, setGuides] = useState([]);

    useEffect(() => {
        const loadGuides = async () => {
            const response = await fetchGuides();
            setGuides(response.data);
        };
        loadGuides();
    }, []);

    return (
        <Paper style={{ padding: '20px' }}>
            <h2> Tour Guides</h2>
            <Grid container spacing={3}>
                {guides.map((guide) => (
                    <Grid item key={guide._id} xs={12} sm={6} md={4}>
                        <Card>
                            <CardMedia component="img" height="200" image={`http://localhost:5000/${guide.image}`} alt="Guide" />
                            <CardContent>
                                <Typography variant="h6">{guide.name}</Typography>
                                <Typography variant="body2">Languages: {guide.languages.join(', ')}</Typography>
                                <Typography variant="body2">Experience: {guide.experience} years</Typography>
                                <Typography variant="body2">{guide.description}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Paper>
    );
};

export default UserGuides;
