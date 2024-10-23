function onFormSubmit(e) {
  // The unique form ID you want to match
  const targetFormId = '1UIRjHOOcn8zrLpL0HR-28jYZ7KlDLKLEFcZHgJMyYrs';

  // Get the submitted form ID
  const formId = FormApp.getActiveForm().getId();

  // Check if the submitted form ID matches the target form ID
  if (formId !== targetFormId) {
    Logger.log("Form ID does not match. No action will be taken.");
    return; // Exit if the form ID doesn't match
  }

  Logger.log("Form ID matches. Processing form response...");

  // Check if form submission data exists
  if (!e || !e.response) {
    Logger.log("No form submission data found.");
    return;
  }

  // Get the Google Sheet where the Interview IDs, Results, and Feedback are stored
  const sheet = SpreadsheetApp.openById('1MNX9KylDsDdPEFVY128SlPBzBOsqIuNde4z7g_619ao').getSheetByName('interview');

  // Get the headers (first row) from the Google Sheet
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  // Dynamically find the index of the Interview ID, Result, and Feedback columns based on headers
  const interviewIDColIndex = headers.indexOf('Interview ID'); // Replace with the exact header name
  const resultColIndex = headers.indexOf('Result'); // Replace with the exact header name
  const feedbackColIndex = headers.indexOf('Feedback'); // Replace with the exact header name for Feedback

  // Check if all necessary columns are found
  if (interviewIDColIndex === -1 || resultColIndex === -1 || feedbackColIndex === -1) {
    Logger.log("Interview ID, Result, or Feedback column not found.");
    return;
  }

  Logger.log(`Interview ID column found at index: ${interviewIDColIndex}`);
  Logger.log(`Result column found at index: ${resultColIndex}`);
  Logger.log(`Feedback column found at index: ${feedbackColIndex}`);

  // Get the responses from the submitted form
  const formResponse = e.response; // Get the FormResponse object
  const itemResponses = formResponse.getItemResponses(); // Get individual item responses

  Logger.log("Number of item responses: " + itemResponses.length);

  // Assuming Interview ID, Result, and Feedback are the first, second, and third form fields (adjust as needed)
  const formInterviewID = itemResponses[0].getResponse(); // Interview ID
  const formResult = itemResponses[1].getResponse();      // Result
  const formFeedback = itemResponses[2].getResponse();    // Feedback

  Logger.log("Form Interview ID: " + formInterviewID);
  Logger.log("Form Result: " + formResult);
  Logger.log("Form Feedback: " + formFeedback);

  // Get all data from the Google Sheet
  const interviewData = sheet.getDataRange().getValues();

  // Find the matching Interview ID and update both the Result and Feedback columns
  for (let i = 1; i < interviewData.length; i++) {
    const sheetInterviewID = interviewData[i][interviewIDColIndex]; // Access the Interview ID column dynamically

    if (formInterviewID === sheetInterviewID) {
      // Update the 'Result' column dynamically based on the found index
      sheet.getRange(i + 1, resultColIndex + 1).setValue(formResult); // Update Result
      Logger.log(`Interview ID ${formInterviewID} updated with result: ${formResult}`);

      // Update the 'Feedback' column dynamically based on the found index
      sheet.getRange(i + 1, feedbackColIndex + 1).setValue(formFeedback); // Update Feedback
      Logger.log(`Interview ID ${formInterviewID} updated with feedback: ${formFeedback}`);
      
      break;
    }
  }
}
