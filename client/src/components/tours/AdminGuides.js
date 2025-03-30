import GuideForm from './AddTourGuide';
import GuideList from './TourGuideList';

const AdminGuides = () => {
    return (
        <div style={{ padding: '20px' }}>
            <h2>Admin Dashboard - Manage Tour Guides</h2>
            <GuideForm onGuideAdded={() => window.location.reload()} />
            <GuideList />
        </div>
    );
};

export default AdminGuides;
