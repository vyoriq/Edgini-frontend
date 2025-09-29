import React, { useRef } from 'react';
import { useFileUpload } from '../hooks/useFileUpload';
import { SUPPORTED_FILE_TYPES, formatFileSize } from '../utils/documentProcessor';

/**
 * File upload component for PDF and DOCX documents
 * Provides drag-and-drop and click-to-upload functionality
 * Integrates with document processing for text extraction
 */
export default function FileUpload({ onTextExtracted, disabled = false }) {
  const fileInputRef = useRef(null);
  const {
    isProcessing,
    progress,
    error,
    handleFileChange,
    handleFileDrop,
    clearError
  } = useFileUpload();

  /**
   * Handles successful file processing
   */
  const handleProcessingComplete = async (result) => {
    if (result.success && onTextExtracted) {
      onTextExtracted(result.text, {
        fileName: result.fileName,
        fileSize: result.fileSize,
        fileType: result.fileType,
        truncated: result.truncated
      });
    }
  };

  /**
   * Handles file input change
   */
  const onFileChange = async (event) => {
    const result = await handleFileChange(event);
    await handleProcessingComplete(result);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Handles file drop
   */
  const onFileDrop = async (event) => {
    const result = await handleFileDrop(event);
    await handleProcessingComplete(result);
  };

  /**
   * Handles drag over event
   */
  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  /**
   * Opens file dialog
   */
  const openFileDialog = () => {
    if (disabled || isProcessing) return;

    if (error) {
      clearError();
    }

    fileInputRef.current?.click();
  };

  /**
   * Gets the document icon based on processing state
   */
  const getDocumentIcon = () => {
    if (isProcessing) {
      return (
        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      );
    }

    return (
      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  /**
   * Gets supported file types for display
   */
  const getSupportedTypes = () => {
    return Object.values(SUPPORTED_FILE_TYPES)
      .flat()
      .join(', ')
      .toUpperCase();
  };

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={onFileChange}
        style={{ display: 'none' }}
        disabled={disabled || isProcessing}
      />

      {/* File upload button */}
      <button
        type="button"
        onClick={openFileDialog}
        onDrop={onFileDrop}
        onDragOver={handleDragOver}
        className={`p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
          disabled || isProcessing
            ? 'text-gray-400 cursor-not-allowed'
            : error
            ? 'text-red-600 hover:text-red-800 hover:bg-red-50'
            : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
        }`}
        title={
          disabled
            ? 'File upload disabled'
            : isProcessing
            ? 'Processing document...'
            : error
            ? `Error: ${error}`
            : `Upload document (${getSupportedTypes()})`
        }
        aria-label={
          disabled
            ? 'File upload disabled'
            : isProcessing
            ? 'Processing document'
            : 'Upload document'
        }
        disabled={disabled || isProcessing}
      >
        {getDocumentIcon()}
      </button>

      {/* Processing feedback */}
      {isProcessing && progress.message && (
        <div className="absolute top-full mt-1 left-0 right-0 z-10">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-2 shadow-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-blue-800">{progress.message}</span>
            </div>
            {progress.total > 1 && (
              <div className="mt-1 w-full bg-blue-200 rounded-full h-1">
                <div
                  className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                ></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error display */}
      {error && !isProcessing && (
        <div className="absolute top-full mt-1 left-0 right-0 z-10">
          <div className="bg-red-50 border border-red-200 rounded-md p-2 shadow-sm">
            <div className="flex items-start space-x-2">
              <svg className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <div>
                <p className="text-xs text-red-800 font-medium">Upload Error</p>
                <p className="text-xs text-red-600">{error}</p>
                <p className="text-xs text-red-500 mt-1">
                  Supported: {getSupportedTypes()}, Max 50MB
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}