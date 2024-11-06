function countProfilesShared() {
    try {
      const spreadsheetId = "1MNX9KylDsDdPEFVY128SlPBzBOsqIuNde4z7g_619ao"; // Replace with your actual Spreadsheet ID
      const sharedSheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName("shared_profiles"); // Profile sharing sheet
      const interviewSheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName("interview"); // Interview sheet
  
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7); // Set date to 7 days ago
  
      // Create a variable for yesterday's date
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1); // Set date to yesterday
  
      // Set the start and end of yesterday
      const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0)); // Start of yesterday
      const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999)); // End of yesterday
  
      // Format testdate as DD MM YYYY
      const testdate = `${String(yesterday.getDate()).padStart(2, '0')} ${String(yesterday.getMonth() + 1).padStart(2, '0')} ${yesterday.getFullYear()}`;
  
      // --- Count Profiles Shared (From "shared_profiles" Tab) ---
      const sharedData = sharedSheet.getDataRange().getValues(); // Fetch all the data from shared_profiles
      const sharedHeaders = sharedData[0]; // Get the first row (header)
      const emailColIndex = sharedHeaders.indexOf("Email address"); // Find the index of the "Email address" column
      const timestampColIndex = sharedHeaders.indexOf("Timestamp"); // Find the index of the "Timestamp" column
      const candidateNameColIndex = sharedHeaders.indexOf("Candidate Name"); // Find the index of the "Candidate Name" column
      const vendorNameColIndex = sharedHeaders.indexOf("Vendor Name"); // Find the index of the "Vendor Name" column
      const jdColIndex = sharedHeaders.indexOf("Job Description"); // Find the index of the "JD" column
  
      if (emailColIndex === -1 || timestampColIndex === -1) {
        throw new Error('The "Email address" or "Timestamp" column is not found in shared_profiles.');
      }
  
      // Create dictionaries to count profiles for each email for the last 7 days and last day
      let profileCounts7Days = {};
      let totalProfiles7Days = 0;
      let totalProfilesLastDay = 0;
      let profileCountsLastDay = {}; // For last day profiles count
  
      // Prepare array for last day profile details
      let lastDayProfileDetails = [];
  
      // Loop through the shared_profiles data starting from the second row
      for (let i = 1; i < sharedData.length; i++) {
        const email = sharedData[i][emailColIndex].trim();
        const timestamp = new Date(sharedData[i][timestampColIndex]);
  
        // Check if the timestamp is within the last 7 days
        if (timestamp >= sevenDaysAgo && timestamp <= today && email) {
          totalProfiles7Days++; // Count the profile
          if (profileCounts7Days[email]) {
            profileCounts7Days[email]++;
          } else {
            profileCounts7Days[email] = 1;
          }
        }
  
        // Check if the timestamp is from the last day (yesterday)
        if (timestamp >= startOfYesterday && timestamp <= endOfYesterday && email) {
          totalProfilesLastDay++; // Count the profile
          if (profileCountsLastDay[email]) {
            profileCountsLastDay[email]++;
          } else {
            profileCountsLastDay[email] = 1;
          }
  
          // Store candidate details for the last day
          lastDayProfileDetails.push([
            sharedData[i][candidateNameColIndex],
            sharedData[i][vendorNameColIndex],
            sharedData[i][jdColIndex]
          ]);
        }
      }
  
      // --- Count Total Interviews (From "interview" Tab) ---
      const interviewData = interviewSheet.getDataRange().getValues(); // Fetch all the data from interview tab
      const interviewHeaders = interviewData[0]; // Get the first row (header)
      const interviewEmailColIndex = interviewHeaders.indexOf("Email Address"); // Find the index of the "Email Address" column
      const interviewDateColIndex = interviewHeaders.indexOf("Interview Date"); // Replace with the correct column for the date in the interview tab
  
      if (interviewEmailColIndex === -1 || interviewDateColIndex === -1) {
        throw new Error('The "Email Address" or "Interview Date" column is not found in interview.');
      }
  
      // Count total interviews for the last 7 days and last day
      let totalInterviews7Days = 0;
      let totalInterviewsLastDay = 0;
      for (let i = 1; i < interviewData.length; i++) {
        const interviewEmail = interviewData[i][interviewEmailColIndex].trim();
        const interviewDate = new Date(interviewData[i][interviewDateColIndex]);
  
        // Check if the interview date is within the last 7 days
        if (interviewDate >= sevenDaysAgo && interviewDate <= today && interviewEmail) {
          totalInterviews7Days++;
        }
  
        // Check if the interview date is from the last day (yesterday)
        if (interviewDate >= startOfYesterday && interviewDate <= endOfYesterday && interviewEmail) {
          totalInterviewsLastDay++;
        }
      }
  
      // --- Create the HTML table for email ---
      // Generate the dynamic rows for each email address in the last 7 days
      let profileRows7Days = '';
      for (const email in profileCounts7Days) {
        profileRows7Days += `
          <tr>
            <td>${email}</td>
            <td>${profileCounts7Days[email]}</td>
          </tr>
        `;
      }
  
      // Generate the dynamic rows for each email address in the last day
      let profileRowsLastDay = '';
      for (const email in profileCountsLastDay) {
        profileRowsLastDay += `
          <tr>
            <td>${email}</td>
            <td>${profileCountsLastDay[email]}</td>
          </tr>
        `;
      }
  
      // Generate the dynamic rows for last day profile details
      let lastDayProfileRows = '';
      lastDayProfileDetails.forEach(detail => {
        lastDayProfileRows += `
          <tr>
            <td>${detail[0] || 'N/A'}</td>
            <td>${detail[1] || 'N/A'}</td>
            <td>${detail[2] || 'N/A'}</td>
          </tr>
        `;
      });
  
      // Handle the case where no profiles or interviews were shared yesterday
      let noInterviewsLastDayMessage = totalInterviewsLastDay === 0 ? "No interviews held yesterday" : totalInterviewsLastDay;
      let noProfilesLastDayMessage = totalProfilesLastDay === 0 ? "No profiles shared yesterday" : totalProfilesLastDay;
  
      const htmlBody = `
        <h3>Profile Shared Report (Last 7 Days)</h3>
        <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 50%;">
          <thead>
            <tr>
              <th>Email Address</th>
              <th>Profiles Shared</th>
            </tr>
          </thead>
          <tbody>
            ${profileRows7Days}
          </tbody>
        </table>
        
        <h3>Interview Report (Last 7 Days)</h3>
        <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 50%;">
          <thead>
            <tr>
              <th>Total Interviews</th>
              <th>Total Profiles Shared (7 Days)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${totalInterviews7Days}</td>
              <td>${totalProfiles7Days}</td>
            </tr>
          </tbody>
        </table>
        
        <br>
        
        <h3>Profile Shared Report for Yesterday (${testdate})</h3> <!-- Using testdate variable -->
        <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 50%;">
          <thead>
            <tr>
              <th>Email Address</th>
              <th>Profiles Shared</th>
            </tr>
          </thead>
          <tbody>
            ${profileRowsLastDay || '<tr><td colspan="2">No profiles shared yesterday</td></tr>'}
          </tbody>
        </table>
        
        <h3>Interview Report for Yesterday (${testdate})</h3> <!-- Using testdate variable -->
        <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 50%;">
          <thead>
            <tr>
              <th>Total Interviews</th>
              <th>Total Profiles Shared</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${noInterviewsLastDayMessage}</td>
              <td>${noProfilesLastDayMessage}</td>
            </tr>
          </tbody>
        </table>
        
        <h3>Profiles Shared Yesterday (${testdate})</h3>
        <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 50%;">
          <thead>
            <tr>
              <th>Candidate Name</th>
              <th>Client Name</th>
              <th>Job Description</th>
            </tr>
          </thead>
          <tbody>
            ${lastDayProfileRows || '<tr><td colspan="3">No profiles shared yesterday</td></tr>'}
          </tbody>
        </table>
      `;
  
      // Send the email (update with actual recipient email)
      MailApp.sendEmail({
        to: "thenaved7089@gmail.com", // Replace with the recipient email address
        subject: "Weekly Profile and Interview Report",
        htmlBody: htmlBody
      });
      
    } catch (error) {
      Logger.log(error.message);
    }
  }
  