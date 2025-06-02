import React, { useState, useCallback, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const FileUploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 1rem auto;
  width: 100%;
  max-width: 400px;
  animation: ${fadeIn} 0.5s ease-out;

  @media (max-width: 768px) {
    padding: 1rem;
    margin: 0.5rem;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FileLabel = styled.label`
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color, #007bff);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: #0056b3;
    transform: translateY(-2px);
  }

  &:focus {
    outline: 2px solid #0056b3;
    outline-offset: 2px;
  }
`;

const FileName = styled.p`
  margin-top: 0.75rem;
  font-size: 0.9rem;
  color: #555;
  text-align: center;
  word-break: break-all;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background-color: #e0e0e0;
  margin-top: 0.75rem;
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  width: ${props => props.progress}%;
  height: 100%;
  background-color: var(--primary-color, #007bff);
  transition: width 0.3s ease;
`;

const ErrorMessage = styled.div`
  margin-top: 0.75rem;
  font-size: 0.9rem;
  color: #d32f2f;
  text-align: center;
  background-color: #ffebee;
  padding: 0.5rem;
  border-radius: 4px;
`;

const FileUpload = ({ onUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleFileChange = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setUploadProgress(0);
    setError(null);

    try {
      const storageRef = ref(storage, `images/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (err) => {
          console.error('Upload failed:', err);
          setError('Failed to upload image. Please try again.');
          setSelectedFile(null);
          setUploadProgress(0);
        },
        async () => {
          try {
            const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
            await onUpload(file, imageUrl);
            setError(null);
          } catch (err) {
            console.error('Error getting download URL:', err);
            setError('Failed to retrieve image URL. Please try again.');
            setSelectedFile(null);
            setUploadProgress(0);
          }
        }
      );
    } catch (err) {
      console.error('Error initiating upload:', err);
      setError('An unexpected error occurred. Please try again.');
      setSelectedFile(null);
      setUploadProgress(0);
    }
  }, [onUpload]);

  return (
    <FileUploadContainer role="region" aria-label="File upload section">
      <FileInput
        type="file"
        id="file-upload"
        accept="image/*"
        onChange={handleFileChange}
        ref={inputRef}
        aria-label="Upload an image"
      />
      <FileLabel htmlFor="file-upload">
        {selectedFile ? 'Change Image' : 'Upload Image'}
      </FileLabel>
      {selectedFile && (
        <>
          <FileName>{selectedFile.name}</FileName>
          <ProgressBar>
            <ProgressFill progress={uploadProgress} />
          </ProgressBar>
        </>
      )}
      {error && <ErrorMessage role="alert">{error}</ErrorMessage>}
    </FileUploadContainer>
  );
};

export default FileUpload;
