import React, { useState } from 'react';
import Upload from './components/Upload';
import Editor from './pages/Editor';
import Download from './components/Download';
// import Viewer from './components/Viewer';

function App() {
  const [filePath, setFilePath] = useState(null);
  const [editedFile, setEditedFile] = useState(null);

  fetch(`https://pdf-editor-backend-mgej.onrender.com/empty-files`).then(console.log("Extra Files Deleted"))

  return (
    <div>
      {/* <h1>PDF Editor</h1> */}
      {/* <Upload onUpload={setFilePath} /> */}
      {/* {filePath && <Viewer filePath={`https://pdf-editor-backend-mgej.onrender.com/${filePath}`}/>} */}
      {/* {filePath && ( */}
        <Editor/>
       {/* )}  */}
      {/* {editedFile && <Download editedFile={editedFile} />} */}
    </div>
  );
}

export default App;
