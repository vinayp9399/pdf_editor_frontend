import React from 'react';

function Download({ editedFile }) {
  return (
    <div>
      {/* {editedFile && ( */}
        <button><a href={editedFile} download="edited.pdf">
          Download
        </a></button>
      {/* )} */}
    </div>
  );
}

export default Download;
