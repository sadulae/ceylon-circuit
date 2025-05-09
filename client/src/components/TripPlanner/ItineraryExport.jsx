import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import { PictureAsPdf as PdfIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ItineraryExport = ({ tripData }) => {
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Your Sri Lanka Travel Itinerary', 20, 20);
    
    // Add trip details
    doc.setFontSize(12);
    doc.text(`Travel Dates: ${format(tripData.startDate, 'MMM d, yyyy')} - ${format(tripData.endDate, 'MMM d, yyyy')}`, 20, 30);
    doc.text(`Number of Travelers: ${tripData.numberOfPeople}`, 20, 37);
    doc.text(`Budget Level: ${tripData.preferences.budget}`, 20, 44);
    doc.text(`Travel Pace: ${tripData.preferences.pace}`, 20, 51);
    doc.text(`Interests: ${tripData.preferences.interests.join(', ')}`, 20, 58);

    let yPos = 70;
    const pageHeight = doc.internal.pageSize.height;

    // Add each day's activities
    tripData.generatedItinerary.days.forEach((day) => {
      // Check if we need a new page
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }

      // Add day header
      doc.setFontSize(16);
      doc.text(`Day ${day.dayNumber}`, 20, yPos);
      yPos += 10;

      // Add activities table
      const tableData = day.activities.map(activity => [
        activity.time,
        activity.duration,
        activity.description,
        activity.location
      ]);

      doc.autoTable({
        startY: yPos,
        head: [['Time', 'Duration', 'Activity', 'Location']],
        body: tableData,
        margin: { left: 20 },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 25 },
          2: { cellWidth: 80 },
          3: { cellWidth: 40 }
        },
      });

      yPos = doc.lastAutoTable.finalY + 20;
    });

    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    // Save the PDF
    doc.save('sri-lanka-itinerary.pdf');
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Export Your Itinerary
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="body1" paragraph>
            Your itinerary is ready to be exported! The PDF will include:
          </Typography>
          <ul>
            <Typography component="li">Complete day-by-day schedule</Typography>
            <Typography component="li">Activity details and locations</Typography>
            <Typography component="li">Duration and timing information</Typography>
            <Typography component="li">Travel preferences and trip details</Typography>
          </ul>
          <Button
            variant="contained"
            startIcon={<PdfIcon />}
            onClick={generatePDF}
            sx={{ mt: 2 }}
          >
            Download PDF
          </Button>
        </CardContent>
      </Card>

      <Typography variant="h6" gutterBottom>
        Preview
      </Typography>

      {tripData.generatedItinerary.days.map((day) => (
        <Card key={day.dayNumber} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Day {day.dayNumber}
            </Typography>
            
            {day.activities.map((activity, index) => (
              <Box key={index} sx={{ mb: 2 }}>
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
            ))}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default ItineraryExport; 