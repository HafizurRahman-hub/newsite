const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const nodemailer = require('nodemailer'); // Add Nodemailer to send emails

const app = express();
const port = 3000;

// Middleware to parse JSON and URL encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public'))); // Make sure this points to the 'public' folder

// Set up Nodemailer transport (replace with your email credentials)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'hemelhassan70@gmail.com', // Replace with your email
    pass: 'acjo dylq fdkm xyrc', // Use App Password if 2FA is enabled
  },
});

// Serve index.html when the root URL ("/") is accessed
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html')); // Ensure this points to the correct path
});

// Route to handle form submission
app.post('/submit-form', (req, res) => {
  const { name, email, telegram } = req.body;
  const filePath = 'formData.xlsx';

  try {
    let workbook;
    let worksheet;

    console.log('Checking if Excel file exists...');
    // Check if the Excel file exists
    if (fs.existsSync(filePath)) {
      console.log('File exists, reading...');
      // If the file exists, read it and append new data
      workbook = XLSX.readFile(filePath);
      worksheet = workbook.Sheets[workbook.SheetNames[0]]; // Get the first sheet
    } else {
      console.log('File does not exist, creating new one...');
      // If the file doesn't exist, create a new Excel file and worksheet
      workbook = XLSX.utils.book_new();
      worksheet = XLSX.utils.aoa_to_sheet([['Name', 'Email', 'Telegram Username']]); // Add headers
      XLSX.utils.book_append_sheet(workbook, worksheet, 'FormData');
    }

    // Append new data
    const newRow = [name, email, telegram];
    XLSX.utils.sheet_add_aoa(worksheet, [newRow], { origin: -1 }); // Append to last row

    // Save the updated Excel file
    console.log('Saving the updated Excel file...');
    XLSX.writeFile(workbook, filePath);
    console.log('Data saved successfully!');

    // Send an automatic email to the user
    const mailOptions = {
      from: 'hemelhassan70@gmail.com', // Sender's email
      to: email, // Recipient's email (user who submitted the form)
      subject: 'your Premium Content from Pop Max',
      text: `Hi ${name},\n\nThank you for submitting your details. Here is your Premium Content. Here are the details we received:\n\nName: ${name}\nEmail: ${email}\nTelegram Username: ${telegram}\n\nWe will get back to you soon.\n\nBest regards,\nPop Max`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
        return res.status(500).json({ message: 'There was an error sending the email.' });
      }
      console.log('Email sent: ' + info.response);
    });

    // Respond back with a success message to be displayed on the front-end
    res.status(200).json({
      message: 'Form data has been saved successfully and an email has been sent to you! Please check your email for premium content access.'
    });

  } catch (error) {
    console.error('Error writing to Excel file:', error);
    res.status(500).json({ message: 'There was an error saving your data. Please check the server logs for more details.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
