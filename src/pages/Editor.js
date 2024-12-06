import React, { useState, useEffect, useRef } from 'react';
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import * as fabric from 'fabric'
import Upload from '../components/Upload';
import Download from '../components/Download';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.mjs`;

function Editor() {
  const [filePathnew, setFilePathnew] = useState(null);
  const [editedFile, setEditedFile] = useState(null);

  const [height, setheight] = useState(0);
  const [width, setwidth] = useState(0);
  const [pageno, setpageno] = useState(1);
  let [pagesize, setpageSize] = useState(2);
  const [currentfile, setcurrentfile]= useState(`http://localhost:5000/${filePathnew}`);
  const [pdffile, setpdffile] = useState();
  const [color,setcolor]=useState("red");

  const canvasRef = useRef();
  const fabricCanvasRef = useRef(null);
  const fabricCanvasInstanceRef = useRef();

  console.log(filePathnew);

  const pageZoomin =()=>{
    pagesize+= 0.1;
    setpageSize(pagesize);
  }

  const pageZoomOut =()=>{
    pagesize-= 0.1;
    setpageSize(pagesize);
  }

  const handleClear=()=>{
    const fabricCanvas = fabricCanvasInstanceRef.current;
    fabricCanvas.clear();
  }

  const handleEdit = async (type) => {
    console.log(width,height);
    const response = await fetch(currentfile);
    const existingPdfBytes = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[Number(pageno)-1];
    const fabricCanvas = fabricCanvasInstanceRef.current;

      switch (type) {
        case "text":
        const text = new fabric.IText("Enter text here", {
         left: 100,
         top: 100,
         fontFamily: "Arial",
         fill: color,
         fontSize: 20,
        });
        fabricCanvas.add(text);
          break;
      
        case "strike line":
          const strikeLine = new fabric.Line(
            [100, 100, 200, 100],
            {
              stroke: color,
              strokeWidth: 2,
            }
          );
          fabricCanvas.add(strikeLine);
          break;

        case "highlight":
          const highlight = new fabric.Rect({
            left: 100,
            top: 100,
            width: 20,
            height: 20,
            fill: color,
            opacity: 0.5,
          });
          fabricCanvas.add(highlight);
          break;
      
        default:
          
          break;
      }

    fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas);
    fabricCanvas.freeDrawingBrush.width = 5; // Stroke width
    fabricCanvas.freeDrawingBrush.color = 'rgba(0, 0, 255, 0.7)';

    // fabricCanvas.sendToBack(highlight);

    setpdffile(pdfDoc);

  };

  const saveEdit= async ()=>{
    const fabricCanvas = fabricCanvasInstanceRef.current;
    const pages = pdffile.getPages();
    const firstPage = pages[Number(pageno)-1];
    const dataUrl = fabricCanvas.toDataURL({ format: 'png' });
    const pngImage = await pdffile.embedPng(dataUrl);
    const imageDims = pngImage.scaleToFit(width, height-792);
  
    firstPage.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: imageDims.width,
      height: imageDims.height,
    });

    const pdfBytes = await pdffile.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    setcurrentfile(URL.createObjectURL(blob));
    setEditedFile(URL.createObjectURL(blob));

    fabricCanvas.clear();
  };

  

  useEffect(() => {
    const loadPdf = async () => {
      setcurrentfile(`http://localhost:5000/${filePathnew}`);
      console.log(filePathnew);
      if (!filePathnew) return;

      // Get the PDF document
      const pdf = await pdfjs.getDocument(currentfile).promise;

      // Get the first page of the PDF
      const page = await pdf.getPage(Number(pageno));

      // Set up the canvas for rendering the page
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      const viewport = page.getViewport({ scale: pagesize });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      setheight(viewport.height);
      setwidth(viewport.width);

      // Render the page into the canvas
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      page.render(renderContext);

// Initialize Fabric.js canvas
const fabricCanvasElement = fabricCanvasRef.current;
fabricCanvasElement.width = viewport.width;
fabricCanvasElement.height = viewport.height;

const fabricCanvasInstance = new fabric.Canvas(fabricCanvasElement);
fabricCanvasInstanceRef.current = fabricCanvasInstance;

return () => {
  fabricCanvasElement.dispose();
  canvas.dispose();
  
};
    };

    loadPdf();
  }, [currentfile, pagesize,pageno,pdffile,filePathnew]);

  return (
    <>
    

    <div style={{display:"flex", alignItems:"center", gap:"10px", backgroundColor:"black"}}>
    <h3 style={{color:"lightgrey"}}>PDF Editor</h3>
      {<Upload onUpload={setFilePathnew} />}
      <label style={{color:"white"}}>Page No:</label>
      <input type="number" value={pageno} onChange={(e) => setpageno(e.target.value)} />
      <input type="color" value={color} onChange={(e)=>{setcolor(e.target.value)}} />
      <button onClick={()=>handleEdit("text")}>Add Text</button>
      <button onClick={()=>handleEdit("strike line")}>Add Strike</button>
      <button onClick={()=>handleEdit("highlight")}>Add Highlight</button>
      <button onClick={()=>handleClear()}>Clear All</button>
      <button onClick={()=>saveEdit()}>Save</button>
      <button onClick={()=>pageZoomin()}>+</button>
      <button onClick={()=>pageZoomOut()}>-</button>
      {<Download editedFile={editedFile}/>}
    </div>
    
    <div style={{position: "relative"}}>
    {filePathnew ? (<>
      <canvas ref={canvasRef} style={{textAlign:"center", position: "absolute", border: '1px solid #ccc' }} />
      <canvas ref={fabricCanvasRef} style={{textAlign:"center", position: "absolute",zIndex: 1 }}
        /></>
    ) : (
      <p>Select a PDF</p>
    )}
  </div>
  </>
  );
}

export default Editor;
