const fs = require("fs");

const extractTextFromPDF = async (filePathOrBuffer) => {
  try {
    // Import pdfjs-dist dynamically because it is an ES Module
    const pdfjsLib = await import(
      "pdfjs-dist/legacy/build/pdf.mjs"
    );

    let data;

    if (Buffer.isBuffer(filePathOrBuffer)) {
      data = new Uint8Array(filePathOrBuffer);
    } else {
      data = new Uint8Array(
        fs.readFileSync(filePathOrBuffer)
      );
    }

    const loadingTask = pdfjsLib.getDocument({
      data,
    });

    const pdf = await loadingTask.promise;

    let extractedText = "";

    for (
      let pageNumber = 1;
      pageNumber <= pdf.numPages;
      pageNumber++
    ) {
      const page = await pdf.getPage(pageNumber);

      const textContent =
        await page.getTextContent();

      const pageText = textContent.items
        .map((item) => item.str)
        .join(" ");

      extractedText += pageText + "\n";
    }

    return extractedText.trim();
  } catch (error) {
    console.error("PDF PARSING ERROR:", error);

    throw new Error(
      "Unable to extract text from PDF."
    );
  }
};

module.exports = extractTextFromPDF;