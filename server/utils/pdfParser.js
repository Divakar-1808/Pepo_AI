const { PDFParse } = require("pdf-parse");

const extractTextFromPDF = async (pdfBuffer) => {
  let parser;

  try {
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