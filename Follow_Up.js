H Naved please find updated script below:

function sendFollowUpRemindersForInterviewDate() {
  try {
    const spreadsheetId = "1ww4hEgS4_lbHyTeyDfMzrw0mz6yhlAv9hzjGHO3w3hk"; // Updated Spreadsheet ID
    const interviewsSheet = SpreadsheetApp.openById(spreadsheetId)
      .getSheetByName("client_Interviews"); // Updated tab name

    const interviewsData = interviewsSheet.getDataRange().getValues();
    const headers = interviewsData[0];  // Fetch the headers from the first row

    const followUpInterviews = [];

    // Dynamically get the column index based on the header name
    const getColumnIndex = (headerName, headersArray) => headersArray.indexOf(headerName);

    const CANDIDATE_NAME_INDEX = getColumnIndex("Candidate Name", headers);
    const COMPANY_NAME_INDEX = getColumnIndex("Company Name", headers);
    const INTERVIEW_DATE_INDEX = getColumnIndex("Interview Date", headers);
    const TIME_INDEX = getColumnIndex("Time", headers);
    const INTERVIEW_ID_INDEX = getColumnIndex("Interview ID", headers);
    const LINK_INDEX = getColumnIndex("Hyper Link", headers);
    const RESULT_COLUMN_INDEX = getColumnIndex("Result", headers);

    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    fifteenDaysAgo.setHours(0, 0, 0, 0);

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

      // if (!candidateName || !companyName || !interviewDateStr || !timeValue || !interviewID || !link) continue;

      const interviewDate = new Date(interviewDateStr);
      interviewDate.setHours(0, 0, 0, 0);
      console.log(interviewDate , fifteenDaysAgo, interviewDate > fifteenDaysAgo, result, interviewDate > fifteenDaysAgo && result == '')
      if (interviewDate > fifteenDaysAgo && result == '') {
        const formattedDate = interviewDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        followUpInterviews.push([candidateName, companyName, formattedDate, timeValue, interviewID, link]);
      }
    }

    if (followUpInterviews.length > 0) {
      const subject = "Follow-Up Reminder: Pending Interviews";
      let htmlTable =
        `<h3>Hello,</h3>
        <p>Here are the candidates for whom follow-up is needed:</p>
        <table style="border-collapse: collapse; width: 80%; border: 1px solid black;">
          <tr>
            <th style="border: 1px solid black; padding: 8px;">Candidate Name</th>
            <th style="border: 1px solid black; padding: 8px;">Company Name</th>
            <th style="border: 1px solid black; padding: 8px;">Interview Date</th>
            <th style="border: 1px solid black; padding: 8px;">Time</th>
            <th style="border: 1px solid black; padding: 8px;">Interview ID</th>
            <th style="border: 1px solid black; padding: 8px;">Link</th>
          </tr>`;

      followUpInterviews.forEach(row => {
        const linkHTML = `<a href="https://docs.google.com/forms/d/e/1FAIpQLScQhJtXNhXvgD9XHnFnbbVQWrJpSlrHRDs2N4PrPm3aSRt9Zg/viewform?usp=pp_url&entry.235637440=${row[4]}" target="_blank">Click Here</a>`;

        htmlTable +=
          `<tr>
            <td style="border: 1px solid black; padding: 8px;">${row[0]}</td>
            <td style="border: 1px solid black; padding: 8px;">${row[1]}</td>
            <td style="border: 1px solid black; padding: 8px;">${row[2]}</td>
            <td style="border: 1px solid black; padding: 8px;">${row[3]}</td>
            <td style="border: 1px solid black; padding: 8px;">${row[4]}</td>
            <td style="border: 1px solid black; padding: 8px;">${linkHTML}</td>
          </tr>`;
      });

      htmlTable += `</table><br><p>Best,<br>ZecData</p>`;

      Logger.log("Sending Email...");
      MailApp.sendEmail({
        //to: "abhishek@zecdata.com", // Add additional recipient here
        to: "mayuri.s@zecdata.com, ritu.r@zecdata.com", // Add additional recipient here
        cc: "atul@zecdata.com, abhishek@zecdata.com", // CC two recipients here
        subject: subject,
        htmlBody: htmlTable,
      });

      Logger.log("Follow-up reminders sent successfully.");
    } else {
      Logger.log("No follow-ups needed.");
    }
  } catch (error) {
    Logger.log(`Error in sending reminders: ${error.message}`);
  }
}
