const fs = require("fs");
const { PDFParse } = require("pdf-parse");

const extractTextFromPDF = async (filePath) => {
  let parser;

  try {
    const pdfBuffer = fs.readFileSync(filePath);

    parser = new PDFParse({
      data: pdfBuffer,
    });

    const result = await parser.getText();

    return result.text.trim();
  } catch (error) {
    console.error("PDF PARSING ERROR:", error);

    throw new Error("Unable to extract text from PDF.");
  } finally {
    if (parser) {
      await parser.destroy();
    }
  }
};

module.exports = extractTextFromPDF;