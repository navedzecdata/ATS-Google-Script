function sendFollowUpRemindersForInterviewDate() {
  try {
    const spreadsheetId = "1MNX9KylDsDdPEFVY128SlPBzBOsqIuNde4z7g_619ao"; // Your Spreadsheet ID
    const interviewsSheet = SpreadsheetApp.openById(spreadsheetId)
      .getSheetByName("interview"); // Sheet name

    const interviewsData = interviewsSheet.getDataRange().getValues();
    const headers = interviewsData[0];  // Fetch the headers from the first row

    const followUpInterviews = [];

    // Dynamically get the column index based on the header name
    const getColumnIndex = (headerName, headersArray) => headersArray.indexOf(headerName);

    // Define column indices using the headers
    // const UNIQUE_INDEX = getColumnIndex("Unique", headers);
    const CANDIDATE_NAME_INDEX = getColumnIndex("Candidate Name", headers);
    const COMPANY_NAME_INDEX = getColumnIndex("Company Name", headers);
    const INTERVIEW_DATE_INDEX = getColumnIndex("Interview Date", headers);
    const TIME_INDEX = getColumnIndex("Time", headers);
    const INTERVIEW_ID_INDEX = getColumnIndex("Interview ID", headers);
    const LINK_INDEX = getColumnIndex("Hyper Link", headers);
    const RESULT_COLUMN_INDEX = getColumnIndex("Result", headers);
    const EMAIL_INDEX = getColumnIndex("Email Address", headers); // New Email Address column
    const INTERVIEW_TYPE_INDEX = getColumnIndex("Interview Type", headers); // New Interview Type column

    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    fifteenDaysAgo.setHours(0, 0, 0, 0);

    // Log total rows in the sheet
    Logger.log(`Total rows in the interview sheet: ${interviewsData.length}`);

    // Loop through rows and find interviews that are older than 15 days and have no result
    for (let i = 1; i < interviewsData.length; i++) {
      if (interviewsData[i].length < 5) continue;

      const candidateName = interviewsData[i][CANDIDATE_NAME_INDEX];
      const companyName = interviewsData[i][COMPANY_NAME_INDEX];
      const interviewDateStr = interviewsData[i][INTERVIEW_DATE_INDEX];
      const timeValue = Utilities.formatDate(new Date(interviewsData[i][TIME_INDEX]), Session.getScriptTimeZone(), "hh:mm a");
      const interviewID = interviewsData[i][INTERVIEW_ID_INDEX];
      const link = interviewsData[i][LINK_INDEX];
      const result = interviewsData[i][RESULT_COLUMN_INDEX];
      const email = interviewsData[i][EMAIL_INDEX]; // Fetch email address
      const interviewType = interviewsData[i][INTERVIEW_TYPE_INDEX]; // Fetch interview type

      const interviewDate = new Date(interviewDateStr);
      interviewDate.setHours(0, 0, 0, 0);

      // Log the current row's details
      Logger.log(`Checking row ${i}: Candidate - ${candidateName}, Interview Date - ${interviewDateStr}, Result - ${result}`);
      
      // Check if the interview date is within the last 15 days and result is empty
      if (interviewDate > fifteenDaysAgo && result === '') {
        const formattedDate = interviewDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        Logger.log(`Follow-up needed for: ${candidateName}, Interview ID: ${interviewID}`);
        followUpInterviews.push([candidateName, companyName, formattedDate, timeValue, interviewID, link, email, interviewType]);
      }
    }

    // If there are follow-up interviews, send an email
    if (followUpInterviews.length > 0) {
      const subject = "Follow-Up Reminder: Pending Interviews";
      let htmlTable = `<h3>Hello,</h3>
                       <p>Here are the candidates for whom follow-up is needed:</p>
                       <table style="border-collapse: collapse; width: 80%; border: 1px solid black;">
                         <tr>
                           <th style="border: 1px solid black; padding: 8px;">Candidate Name</th>
                           <th style="border: 1px solid black; padding: 8px;">Company Name</th>
                           <th style="border: 1px solid black; padding: 8px;">Interview Date</th>
                           <th style="border: 1px solid black; padding: 8px;">Time</th>
                           <th style="border: 1px solid black; padding: 8px;">Interview ID</th>
                           <th style="border: 1px solid black; padding: 8px;">Email</th>
                           <th style="border: 1px solid black; padding: 8px;">Interview Type</th>
                           <th style="border: 1px solid black; padding: 8px;">Link</th>
                         </tr>`;

      followUpInterviews.forEach(row => {
  const linkHTML = `<a href="https://docs.google.com/forms/d/e/1FAIpQLScQhJtXNhXvgD9XHnFnbbVQWrJpSlrHRDs2N4PrPm3aSRt9Zg/viewform?usp=pp_url&entry.235637440=${row[4]}" target="_blank">Click Here</a>`;

  htmlTable += `<tr>
                  <td style="border: 1px solid black; padding: 8px;">${row[0]}</td> <!-- Candidate Name -->
                  <td style="border: 1px solid black; padding: 8px;">${row[1]}</td> <!-- Company Name -->
                  <td style="border: 1px solid black; padding: 8px;">${row[2]}</td> <!-- Interview Date -->
                  <td style="border: 1px solid black; padding: 8px;">${row[3]}</td> <!-- Time -->
                  <td style="border: 1px solid black; padding: 8px;">${row[4]}</td> <!-- Interview ID -->
                  <td style="border: 1px solid black; padding: 8px;">${row[6]}</td> <!-- Email -->
                  <td style="border: 1px solid black; padding: 8px;">${row[7]}</td> <!-- Interview Type -->
                  <td style="border: 1px solid black; padding: 8px;">${linkHTML}</td> <!-- Link, moved to the last column -->
                </tr>`;
});


      htmlTable += `</table><br><p>Best,<br>ZecData</p>`;

      Logger.log(`Sending follow-up emails for ${followUpInterviews.length} candidates.`);
      MailApp.sendEmail({
        to: "thenaved7089@gmail.com",
        subject: subject,
        htmlBody: htmlTable,
      });

      Logger.log("Follow-up reminders sent successfully.");
    } else {
      Logger.log("No candidates found for follow-up.");
      // Test email sending to verify if the email functionality works
      MailApp.sendEmail({
        to: "your-email@example.com", // Replace with your email
        subject: "Test Email",
        htmlBody: "<p>This is a test email. No follow-ups needed.</p>"
      });
    }
  } catch (error) {
    Logger.log(`Error in sending reminders: ${error.message}`);
  }
}





