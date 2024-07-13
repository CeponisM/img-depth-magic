import React from 'react';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from '../firebase';

const FileUpload = ({ onUpload }) => {
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const storageRef = ref(storage, `images/${file.name}`);
      await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(storageRef);
      onUpload(file, imageUrl); // Send both file and URL
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} accept="image/*" />
    </div>
  );
};

export default FileUpload;
