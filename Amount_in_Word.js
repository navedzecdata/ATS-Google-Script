function convertNumbersToWords() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Live Projects");  // Specify the sheet name here
    const dataRange = sheet.getDataRange();  // Gets the full data range
    const data = dataRange.getValues();      // Get all data in the sheet

    // Identify the "Numbers" and "In Word" column indices
    const headers = data[0];
    const numbersColumnIndex = headers.indexOf("Inclusive Tax");
    const inWordColumnIndex = headers.indexOf("Amount In word");

    if (numbersColumnIndex === -1 || inWordColumnIndex === -1) {
        SpreadsheetApp.getUi().alert("Please make sure both 'Numbers' and 'In Word' columns are present.");
        return;
    }

    // Loop through each row, starting from the second row (index 1)
    for (let i = 1; i < data.length; i++) {
        const numberValue = data[i][numbersColumnIndex];

        if (numberValue && !isNaN(parseInt(numberValue.toString().replace(/[₹,]/g, '')))) {
            // Convert numeric value to integer after removing ₹ and commas
            const numericValue = parseInt(numberValue.toString().replace(/[₹,]/g, ''));

            // Convert the number to words
            const words = numberToWords(numericValue);

            // Prepend "Amount (in words): " to the result
            const result = "Amount (in words): " + words;

            // Store result in "In Word" column
            sheet.getRange(i + 1, inWordColumnIndex + 1).setValue(result);
        } else {
            // If value is not a number, clear the corresponding "In Word" cell
            sheet.getRange(i + 1, inWordColumnIndex + 1).setValue("");
        }
    }
}

function numberToWords(num) {
    if (num === 0) return "zero";

    const belowTwenty = [
        "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
        "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
    ];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const scales = ["", "Thousand", "Lakh", "Crore"];

    function helper(n) {
        if (n === 0) return "";
        if (n < 20) return belowTwenty[n] + " ";
        if (n < 100) return tens[Math.floor(n / 10)] + " " + helper(n % 10);
        if (n < 1000) return belowTwenty[Math.floor(n / 100)] + " Hundred " + (n % 100 === 0 ? "" : "and ") + helper(n % 100);
        return "";
    }

    let result = "";
    let scaleIndex = 0;

    while (num > 0) {
        let part = num % 1000;

        if (scaleIndex === 1) { // thousand
            part = num % 100;
            num = Math.floor(num / 100);
        } else if (scaleIndex > 1) { // lakh, crore, etc.
            part = num % 100;
            num = Math.floor(num / 100);
        } else {
            num = Math.floor(num / 1000);
        }

        if (part !== 0) {
            result = helper(part) + scales[scaleIndex] + " " + result;
        }

        scaleIndex++;
    }

    return result.trim();
}
