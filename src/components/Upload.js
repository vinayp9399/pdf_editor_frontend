import React from 'react';

function Upload({ onUpload, isUploading }) {
  const handleFileChange = async (event) => {
    isUploading(true);
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('https://pdf-editor-backend-mgej.onrender.com/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      onUpload(result.filePath);
      isUploading(false);
    }
  };

  return (
    <>
      {/* <input type="file" onChange={handleFileChange} /> */}
      <div class="file-input">
      <input
        type="file"
        name="file-input"
        id="file-input"
        class="file-input__input"
        onChange={handleFileChange} 
      />
      <label class="file-input__label" for="file-input">
        <svg
          aria-hidden="true"
          focusable="false"
          data-prefix="fas"
          data-icon="upload"
          class="svg-inline--fa fa-upload fa-w-16"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          <path
            fill="currentColor"
            d="M296 384h-80c-13.3 0-24-10.7-24-24V192h-87.7c-17.8 0-26.7-21.5-14.1-34.1L242.3 5.7c7.5-7.5 19.8-7.5 27.3 0l152.2 152.2c12.6 12.6 3.7 34.1-14.1 34.1H320v168c0 13.3-10.7 24-24 24zm216-8v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h136v8c0 30.9 25.1 56 56 56h80c30.9 0 56-25.1 56-56v-8h136c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"
          ></path>
        </svg>
        <span>Upload file</span></label>
    </div>
    </>
    
  );
}

export default Upload;
