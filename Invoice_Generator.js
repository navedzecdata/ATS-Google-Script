function generateInvoicesForAllEmployees() {
    try {
      // Open the spreadsheet and get the necessary tabs
      const spreadsheet = SpreadsheetApp.openById('1IXSYESwhjzrI3qZ59ILJec3XLwsNs8W0lBv-PSpbXAg'); // Replace with your sheet ID
      const invoiceTemplate = spreadsheet.getSheetByName('TEMPLATE OF INVOICE'); // Invoice template sheet name
      const employeeTab = spreadsheet.getSheetByName('Live Projects'); // Employee data tab
  
      // Verify that sheets exist
      if (!invoiceTemplate || !employeeTab) {
        throw new Error('One or more tabs are missing. Please check your tab names.');
      }
  
      // Get the headers from the employee tab
      const headers = employeeTab.getRange(1, 1, 1, employeeTab.getLastColumn()).getValues()[0];
      
      // Find column indexes dynamically based on the headers
      const developerNameIndex = headers.indexOf('Developer Name');
      const workingDayIndex = headers.indexOf('Actual Working Day');
      const rateIndex = headers.indexOf('Rate(+ GST)');
      const amountIndex = headers.indexOf('Amount');
      const invoiceNumberIndex = headers.indexOf('Invoice Number');
      const vendorNameIndex = headers.indexOf('Vendor Name');
      const address1Index = headers.indexOf('Address Line 1');
      const address2Index = headers.indexOf('Address Line 2');
      const gstNumberIndex = headers.indexOf('GST Number');
      const descriptionIndex = headers.indexOf('Description of service');
      const amountInWordsIndex = headers.indexOf('Amount In word');
  
      // Validate that all necessary columns are found
      if (
        developerNameIndex === -1 ||
        workingDayIndex === -1 ||
        rateIndex === -1 ||
        amountIndex === -1 ||
        invoiceNumberIndex === -1 ||
        vendorNameIndex === -1 ||
        address1Index === -1 ||
        address2Index === -1 ||
        gstNumberIndex === -1 ||
        descriptionIndex === -1 ||
        amountInWordsIndex === -1
      ) {
        throw new Error('One or more necessary columns are missing in the employee data sheet.');
      }
  
      // Get the last row in the employee tab
      const lastRow = employeeTab.getLastRow();
  
      for (let i = 2; i <= lastRow; i++) { // Start from row 2
        // Fetch employee details dynamically based on the column headers
        const employeeName = employeeTab.getRange(i, developerNameIndex + 1).getValue();
        const employeeWorkingDays = employeeTab.getRange(i, workingDayIndex + 1).getValue();
        const employeeRate = employeeTab.getRange(i, rateIndex + 1).getValue();
        const employeeAmount = employeeTab.getRange(i, amountIndex + 1).getValue();
  
        // Fetch vendor and invoice details dynamically
        const invoiceNumber = employeeTab.getRange(i, invoiceNumberIndex + 1).getValue();
        const vendorName = employeeTab.getRange(i, vendorNameIndex + 1).getValue();
        const vendorAddress1 = employeeTab.getRange(i, address1Index + 1).getValue();
        const vendorAddress2 = employeeTab.getRange(i, address2Index + 1).getValue();
        const GSTIN = employeeTab.getRange(i, gstNumberIndex + 1).getValue();
        const description = employeeTab.getRange(i, descriptionIndex + 1).getValue();
        const amountInWords = employeeTab.getRange(i, amountInWordsIndex + 1).getValue();
  
        // Debugging Logs
        Logger.log(`Processing Employee: ${employeeName}`);
  
        // Validate employee details
        if (employeeWorkingDays === '' || employeeRate === '' || employeeAmount === '') {
          Logger.log(`Some employee details are missing for ${employeeName} in "Live Projects" tab.`);
          continue; // Skip this employee and move to the next
        }
  
        // Validate vendor and invoice details
        if (!invoiceNumber || !vendorName || !vendorAddress1 || !vendorAddress2 || !GSTIN) {
          Logger.log(`Some vendor or invoice details are missing for ${employeeName} in "Live Projects" tab.`);
          continue; // Skip this employee and move to the next
        }
  
        // Populate invoice template with the fetched data
        invoiceTemplate.getRange('D3').setValue(invoiceNumber); // Set invoice number in the template
        invoiceTemplate.getRange('F3').setValue(new Date()); // Set today's date
        invoiceTemplate.getRange('D5').setValue(vendorName); // Set vendor name
        invoiceTemplate.getRange('D6').setValue(vendorAddress1); // Set vendor address 1
        invoiceTemplate.getRange('D7').setValue(vendorAddress2); // Set address line 2
        invoiceTemplate.getRange('D8').setValue(GSTIN); // Set GSTIN
        invoiceTemplate.getRange('E11').setValue(employeeWorkingDays); // Set working days
        invoiceTemplate.getRange('F11').setValue(employeeRate); // Set rate
        invoiceTemplate.getRange('G11').setValue(employeeAmount); // Set amount
        invoiceTemplate.getRange('C11').setValue(description); // Set description of service
        invoiceTemplate.getRange('B17').setValue(amountInWords); // Set amount in words
  
        // Ensure all changes are applied before PDF generation
        SpreadsheetApp.flush();
  
        // Create a PDF of the invoice template
        const pdfBlob = createPdfFromSheet(invoiceTemplate);
  
        // Save invoice as PDF in Google Drive
        const folder = DriveApp.getFolderById('1AvL-FnkB-Tfub6jB7Rgdg7d-G31bcww6'); // Replace with your Google Drive folder ID
        folder.createFile(pdfBlob.setName(`Invoice_${employeeName}_${invoiceNumber}.pdf`));
  
        Logger.log(`Invoice generated for ${employeeName} and saved as PDF.`);
      }
    } catch (error) {
      Logger.log('Error: ' + error.message);
    }
  }
  
  // Function to create PDF from specified sheet
  function createPdfFromSheet(sheet) {
    const spreadsheetId = sheet.getParent().getId();
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=pdf&gid=${sheet.getSheetId()}&size=A4&portrait=true&fitw=true&sheetnames=false&printtitle=false&pagenumbers=false&gridlines=false&fzr=false&range=B1:G26`;
  
    const options = {
      headers: {
        'Authorization': 'Bearer ' + ScriptApp.getOAuthToken(),
      },
    };
    
    return UrlFetchApp.fetch(url, options).getBlob();
  }
  