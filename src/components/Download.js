import React from 'react';

function Download({ editedFile }) {
  return (
    <div>
      {/* {editedFile && ( */}
        {/* <p><a href={editedFile} download="edited.pdf">
        <i style={{color:"blue"}} class="fa fa-download"></i>
        </a></p> */}

        <div style={{zIndex:300}} class="file-input">
        <a href={editedFile} download="edited.pdf">
      <label style={{display:"flex", gap:"5px"}} class="file-input__label">
      <i style={{color:"white", fontSize:"17px"}} class="fa fa-download"></i>
        <span>Download file</span></label></a>
    </div>
      {/* )} */}
    </div>
  );
}

export default Download;
