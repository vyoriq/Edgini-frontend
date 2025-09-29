import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

/**
 * Document processor utility for extracting text from PDF and DOCX files
 * Provides secure, client-side document processing with comprehensive error handling
 */

// File validation constants
export const SUPPORTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
};

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB limit
export const MAX_TEXT_LENGTH = 100000; // 100k characters limit

/**
 * Validates file type and size before processing
 * @param {File} file - The file to validate
 * @returns {Object} Validation result with success flag and error message
 */
export const validateFile = (file) => {
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = Math.round(file.size / (1024 * 1024));
    return {
      isValid: false,
      error: `File size (${sizeMB}MB) exceeds the 50MB limit`
    };
  }

  // Check file type
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
  const isValidType = Object.entries(SUPPORTED_FILE_TYPES).some(([mimeType, extensions]) => {
    return file.type === mimeType && extensions.includes(fileExtension);
  });

  if (!isValidType) {
    return {
      isValid: false,
      error: 'Please upload PDF or DOCX files only'
    };
  }

  return { isValid: true, error: null };
};

/**
 * Extracts text from PDF files using PDF.js
 * @param {ArrayBuffer} arrayBuffer - PDF file as ArrayBuffer
 * @param {Function} onProgress - Progress callback function
 * @returns {Promise<string>} Extracted text content
 */
export const extractTextFromPDF = async (arrayBuffer, onProgress) => {
  try {
    // Load the PDF document
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;

    if (numPages === 0) {
      throw new Error('PDF document contains no pages');
    }

    let fullText = '';

    // Process each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      try {
        // Update progress
        if (onProgress) {
          onProgress({
            current: pageNum,
            total: numPages,
            message: `Processing page ${pageNum} of ${numPages}...`
          });
        }

        // Get page and extract text
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        // Combine text items with proper spacing
        const pageText = textContent.items
          .map(item => item.str)
          .join(' ')
          .trim();

        if (pageText) {
          fullText += pageText + '\n\n';
        }

        // Clean up page resources
        page.cleanup();

      } catch (pageError) {
        console.warn(`Error processing page ${pageNum}:`, pageError);
        // Continue with other pages
      }
    }

    // Clean up PDF document
    pdf.destroy();

    if (!fullText.trim()) {
      throw new Error('No text content found in PDF. This might be a scanned document without text layer.');
    }

    return cleanupExtractedText(fullText);

  } catch (error) {
    console.error('PDF extraction error:', error);

    // Provide user-friendly error messages
    if (error.message.includes('Invalid PDF')) {
      throw new Error('Invalid PDF file. The file may be corrupted.');
    } else if (error.message.includes('Password')) {
      throw new Error('Password-protected PDFs are not supported.');
    } else {
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }
};

/**
 * Extracts text from DOCX files using Mammoth.js
 * @param {ArrayBuffer} arrayBuffer - DOCX file as ArrayBuffer
 * @param {Function} onProgress - Progress callback function
 * @returns {Promise<string>} Extracted text content
 */
export const extractTextFromDOCX = async (arrayBuffer, onProgress) => {
  try {
    // Update progress
    if (onProgress) {
      onProgress({
        current: 1,
        total: 1,
        message: 'Processing DOCX document...'
      });
    }

    // Extract raw text using Mammoth.js
    const result = await mammoth.extractRawText({ arrayBuffer });

    if (!result.value || !result.value.trim()) {
      throw new Error('No text content found in DOCX document.');
    }

    // Check for conversion messages/warnings
    if (result.messages && result.messages.length > 0) {
      console.warn('DOCX conversion messages:', result.messages);
    }

    return cleanupExtractedText(result.value);

  } catch (error) {
    console.error('DOCX extraction error:', error);

    if (error.message.includes('not a valid zip file')) {
      throw new Error('Invalid DOCX file. The file may be corrupted.');
    } else {
      throw new Error(`Failed to extract text from DOCX: ${error.message}`);
    }
  }
};

/**
 * Main function to process any supported document type
 * @param {File} file - The file to process
 * @param {Function} onProgress - Progress callback function
 * @returns {Promise<Object>} Processing result with extracted text
 */
export const processDocument = async (file, onProgress) => {
  try {
    // Validate file first
    const validation = validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Update progress
    if (onProgress) {
      onProgress({
        current: 0,
        total: 1,
        message: 'Reading file...'
      });
    }

    // Read file as ArrayBuffer
    const arrayBuffer = await readFileAsArrayBuffer(file);

    let extractedText = '';

    // Process based on file type
    if (file.type === 'application/pdf') {
      extractedText = await extractTextFromPDF(arrayBuffer, onProgress);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      extractedText = await extractTextFromDOCX(arrayBuffer, onProgress);
    } else {
      throw new Error('Unsupported file type');
    }

    // Check text length
    if (extractedText.length > MAX_TEXT_LENGTH) {
      const truncatedText = extractedText.substring(0, MAX_TEXT_LENGTH);
      console.warn(`Text truncated from ${extractedText.length} to ${MAX_TEXT_LENGTH} characters`);

      return {
        success: true,
        text: truncatedText,
        originalLength: extractedText.length,
        truncated: true,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      };
    }

    return {
      success: true,
      text: extractedText,
      truncated: false,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    };

  } catch (error) {
    console.error('Document processing error:', error);

    return {
      success: false,
      error: error.message,
      fileName: file?.name || 'Unknown',
      fileSize: file?.size || 0,
      fileType: file?.type || 'Unknown'
    };
  }
};

/**
 * Reads a file as ArrayBuffer using FileReader
 * @param {File} file - The file to read
 * @returns {Promise<ArrayBuffer>} File content as ArrayBuffer
 */
const readFileAsArrayBuffer = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      resolve(event.target.result);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Cleans up extracted text by removing excessive whitespace and formatting
 * @param {string} text - Raw extracted text
 * @returns {string} Cleaned text
 */
const cleanupExtractedText = (text) => {
  return text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove excessive line breaks
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    // Trim whitespace
    .trim();
};

/**
 * Gets a human-readable file size string
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Gets file type display name
 * @param {string} mimeType - MIME type of the file
 * @returns {string} User-friendly file type name
 */
export const getFileTypeDisplayName = (mimeType) => {
  switch (mimeType) {
    case 'application/pdf':
      return 'PDF Document';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'Word Document';
    default:
      return 'Document';
  }
};