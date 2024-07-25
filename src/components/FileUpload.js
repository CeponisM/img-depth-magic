import React, { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from '../firebase';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const FileUploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  animation: ${fadeIn} 0.5s ease-out;
`;

const FileInput = styled.input`
  display: none;
`;

const FileLabel = styled.label`
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  font-size: 1rem;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #2980b9;
  }
`;

const FileName = styled.p`
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #666;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background-color: #e0e0e0;
  margin-top: 1rem;
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  width: ${props => props.progress}%;
  height: 100%;
  background-color: var(--primary-color);
  transition: width 0.3s ease;
`;

const FileUpload = ({ onUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadProgress(0);
      const storageRef = ref(storage, `images/${file.name}`);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload failed:", error);
        },
        async () => {
          const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
          onUpload(file, imageUrl);
        }
      );
    }
  }

  return (
    <FileUploadContainer>
      <FileInput type="file" id="file-upload" onChange={handleFileChange} accept="image/*" />
      <FileLabel htmlFor="file-upload">
        {selectedFile ? "Change Image" : "Upload Image"}
      </FileLabel>
      {selectedFile && (
        <>
          <FileName>{selectedFile.name}</FileName>
          <ProgressBar>
            <ProgressFill progress={uploadProgress} />
          </ProgressBar>
        </>
      )}
    </FileUploadContainer>
  );
}

export default FileUpload;
