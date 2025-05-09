import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  DragHandle as DragHandleIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const ActivityDialog = ({ open, activity, onClose, onSave }) => {
  const [editedActivity, setEditedActivity] = useState(activity);

  useEffect(() => {
    setEditedActivity(activity);
  }, [activity]);

  const handleChange = (field) => (event) => {
    setEditedActivity({
      ...editedActivity,
      [field]: event.target.value,
    });
  };

  const handleSave = () => {
    onSave(editedActivity);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {activity ? 'Edit Activity' : 'Add New Activity'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Time"
              value={editedActivity?.time || ''}
              onChange={handleChange('time')}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Duration"
              value={editedActivity?.duration || ''}
              onChange={handleChange('duration')}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={editedActivity?.description || ''}
              onChange={handleChange('description')}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Location"
              value={editedActivity?.location || ''}
              onChange={handleChange('location')}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ItineraryCustomizer = ({ tripData, onUpdate }) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [currentDayIndex, setCurrentDayIndex] = useState(null);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(null);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const [sourceDay, sourceIndex] = source.droppableId.split('-');
    const [destDay, destIndex] = destination.droppableId.split('-');

    const newItinerary = { ...tripData.generatedItinerary };
    const [removed] = newItinerary.days[sourceDay].activities.splice(sourceIndex, 1);
    newItinerary.days[destDay].activities.splice(destIndex, 0, removed);

    onUpdate({ generatedItinerary: newItinerary });
  };

  const handleEditActivity = (dayIndex, activityIndex) => {
    setCurrentDayIndex(dayIndex);
    setCurrentActivityIndex(activityIndex);
    setCurrentActivity(tripData.generatedItinerary.days[dayIndex].activities[activityIndex]);
    setEditDialogOpen(true);
  };

  const handleAddActivity = (dayIndex) => {
    setCurrentDayIndex(dayIndex);
    setCurrentActivityIndex(null);
    setCurrentActivity(null);
    setEditDialogOpen(true);
  };

  const handleDeleteActivity = (dayIndex, activityIndex) => {
    const newItinerary = { ...tripData.generatedItinerary };
    newItinerary.days[dayIndex].activities.splice(activityIndex, 1);
    onUpdate({ generatedItinerary: newItinerary });
  };

  const handleSaveActivity = (editedActivity) => {
    const newItinerary = { ...tripData.generatedItinerary };
    
    if (currentActivityIndex !== null) {
      // Edit existing activity
      newItinerary.days[currentDayIndex].activities[currentActivityIndex] = editedActivity;
    } else {
      // Add new activity
      newItinerary.days[currentDayIndex].activities.push(editedActivity);
    }
    
    onUpdate({ generatedItinerary: newItinerary });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Customize Your Itinerary
      </Typography>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        {tripData.generatedItinerary.days.map((day, dayIndex) => (
          <Card key={day.dayNumber} sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Day {day.dayNumber}
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => handleAddActivity(dayIndex)}
                >
                  Add Activity
                </Button>
              </Box>
              
              <Droppable droppableId={`${dayIndex}`}>
                {(provided) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {day.activities.map((activity, activityIndex) => (
                      <Draggable
                        key={`${dayIndex}-${activityIndex}`}
                        draggableId={`${dayIndex}-${activityIndex}`}
                        index={activityIndex}
                      >
                        {(provided) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            sx={{
                              mb: 2,
                              p: 2,
                              border: '1px solid #e0e0e0',
                              borderRadius: 1,
                              bgcolor: 'background.paper',
                            }}
                          >
                            <Box display="flex" alignItems="center">
                              <Box {...provided.dragHandleProps}>
                                <DragHandleIcon sx={{ mr: 1, color: 'text.secondary' }} />
                              </Box>
                              
                              <Box flexGrow={1}>
                                <Typography variant="subtitle1" color="primary">
                                  {activity.time} ({activity.duration})
                                </Typography>
                                <Typography variant="body1">
                                  {activity.description}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Location: {activity.location}
                                </Typography>
                              </Box>
                              
                              <Box>
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditActivity(dayIndex, activityIndex)}
                                >
                                  <EditIcon />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteActivity(dayIndex, activityIndex)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            </Box>
                          </Box>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </CardContent>
          </Card>
        ))}
      </DragDropContext>

      <ActivityDialog
        open={editDialogOpen}
        activity={currentActivity}
        onClose={() => setEditDialogOpen(false)}
        onSave={handleSaveActivity}
      />
    </Box>
  );
};

export default ItineraryCustomizer; 