import { useState, useCallback } from 'react';
import { processDocument } from '../utils/documentProcessor';

/**
 * Custom hook for handling file upload and document processing
 * Provides state management and processing logic for PDF/DOCX files
 */
export const useFileUpload = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 1, message: '' });
  const [error, setError] = useState(null);
  const [lastProcessedFile, setLastProcessedFile] = useState(null);

  /**
   * Processes a file and extracts text content
   * @param {File} file - The file to process
   * @returns {Promise<Object>} Processing result
   */
  const processFile = useCallback(async (file) => {
    setIsProcessing(true);
    setError(null);
    setProgress({ current: 0, total: 1, message: 'Starting...' });

    try {
      const result = await processDocument(file, (progressInfo) => {
        setProgress(progressInfo);
      });

      if (result.success) {
        setLastProcessedFile({
          name: result.fileName,
          size: result.fileSize,
          type: result.fileType,
          extractedText: result.text,
          truncated: result.truncated,
          originalLength: result.originalLength
        });

        setProgress({
          current: 1,
          total: 1,
          message: `Successfully extracted text from ${result.fileName}`
        });

        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /**
   * Handles file input change event
   * @param {Event} event - File input change event
   * @returns {Promise<Object>} Processing result
   */
  const handleFileChange = useCallback(async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return { success: false, error: 'No file selected' };
    }

    const file = files[0];
    return await processFile(file);
  }, [processFile]);

  /**
   * Handles drag and drop file upload
   * @param {DragEvent} event - Drop event
   * @returns {Promise<Object>} Processing result
   */
  const handleFileDrop = useCallback(async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer.files;
    if (!files || files.length === 0) {
      return { success: false, error: 'No file dropped' };
    }

    const file = files[0];
    return await processFile(file);
  }, [processFile]);

  /**
   * Resets the upload state
   */
  const resetUpload = useCallback(() => {
    setIsProcessing(false);
    setProgress({ current: 0, total: 1, message: '' });
    setError(null);
    setLastProcessedFile(null);
  }, []);

  /**
   * Clears only the error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isProcessing,
    progress,
    error,
    lastProcessedFile,

    // Actions
    processFile,
    handleFileChange,
    handleFileDrop,
    resetUpload,
    clearError
  };
};