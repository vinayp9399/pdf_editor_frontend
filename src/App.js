import React, { useState } from 'react';
import Upload from './components/Upload';
import Editor from './pages/Editor';
import Download from './components/Download';
// import Viewer from './components/Viewer';

function App() {
  const [filePath, setFilePath] = useState(null);
  const [editedFile, setEditedFile] = useState(null);

  return (
    <div>
      {/* <h1>PDF Editor</h1> */}
      {/* <Upload onUpload={setFilePath} /> */}
      {/* {filePath && <Viewer filePath={`http://localhost:5000/${filePath}`}/>} */}
      {/* {filePath && ( */}
        <Editor/>
       {/* )}  */}
      {/* {editedFile && <Download editedFile={editedFile} />} */}
    </div>
  );
}

export default App;
