import React from 'react';

function Upload({ onUpload }) {
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      onUpload(result.filePath);
    }
  };

  return (
    
      <input style={{color:"white"}} type="file" onChange={handleFileChange} />
    
  );
}

export default Upload;
