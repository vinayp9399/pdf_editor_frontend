import React, { useState, useEffect, useRef } from 'react';
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import * as fabric from 'fabric'
import Upload from '../components/Upload';
import Download from '../components/Download';

import { LiaMarkerSolid } from "react-icons/lia";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.mjs`;

function Editor() {
  const [filePathnew, setFilePathnew] = useState(null);
  const [editedFile, setEditedFile] = useState(null);

  const [height, setheight] = useState(0);
  const [width, setwidth] = useState(0);
  const [pageno, setpageno] = useState(1);
  let [pagesize, setpageSize] = useState(2);
  let [zoom, setzoom] = useState(1);
  const [currentfile, setcurrentfile]= useState(`http://localhost:5000/${filePathnew}`);
  const [pdffile, setpdffile] = useState();
  const [color,setcolor]=useState("red");

  const canvasRef = useRef();
  const fabricCanvasRef = useRef(null);
  const fabricCanvasInstanceRef = useRef();

  console.log(filePathnew);

  const pageZoomin = async ()=>{
    zoom+= 0.1;
    setzoom(zoom);
  }

  const pageZoomOut = async ()=>{
    zoom-= 0.1;
    setzoom(zoom);
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
            width: 100,
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

      const contents = await page.getTextContent();

      // const items = contents.items.map((item)=>{
      //    console.log(item.str)
      //    console.log(item.fontName)
      // })


      // Set up the canvas for rendering the page
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      const viewport = page.getViewport({ scale: pagesize });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      console.log(viewport.height,viewport.width, pagesize);
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
// fabricCanvasElement.width = fabwidth;
// fabricCanvasElement.height = fabheight;


const fabricCanvasInstance = new fabric.Canvas('fabcanvas');
// fabricCanvasInstance.requestRenderAll();
fabricCanvasInstanceRef.current = fabricCanvasInstance;
// const fabricc = fabricCanvasInstanceRef.current;
// fabricc.setwidth(500);
// fabricc.setheight(100);


return () => {
  canvas.dispose();
  
};
    };

    loadPdf();
  }, [currentfile,pageno,pdffile,filePathnew,pagesize]);

  return (
    <>
    

    <div style={{display:"flex", alignItems:"center", justifyContent:"space-around", position:"fixed",zIndex:5, backgroundColor:"rgb(208 212 249)", width:"1285px",margin:"0px"}}>
    <h3 style={{color:"#4245a8"}}>PDF Editor</h3>
      {/* {<Upload onUpload={setFilePathnew} />} */}
      {/* <label>Page No:</label> */}
      <input type="color" value={color} onChange={(e)=>{setcolor(e.target.value)}} />



      <p onClick={()=>handleEdit("text")}><i style={{color:"#4245a8", fontSize:"25px"}} class="fa fa-text-width"></i></p>
      <p onClick={()=>handleEdit("strike line")}><i style={{color:"#4245a8", fontSize:"23px"}} class="fa fa-strikethrough"></i></p>
      <p onClick={()=>handleEdit("highlight")}><LiaMarkerSolid  style={{color:"#4245a8", fontSize:"23px"}}/></p>
      <p onClick={()=>handleClear()}><i style={{color:"#4245a8", fontSize:"23px"}} class="fa fa-eraser"></i></p>
      <input style={{border:"2px solid #4245a8", width:"30px",height:"30px"}} type="number" value={pageno} onChange={(e) => setpageno(e.target.value)} />
      <p onClick={()=>pageZoomin()}><i style={{color:"#4245a8", fontSize:"23px"}} class="fa fa-search-plus"></i></p>
      <p onClick={()=>pageZoomOut()}><i style={{color:"#4245a8", fontSize:"23px"}} class="fa fa-search-minus"></i></p>
      <p onClick={()=>saveEdit()}><i style={{color:"#4245a8", fontSize:"23px"}} class="fa fa-save"></i></p>
      {<Download editedFile={editedFile}/>}
    </div>
    
    
    {filePathnew ? (<>
      <div style={{position:"relative", display:"flex", justifyContent:"center",marginTop:"0px",marginBottom:"50px",padding:"0px"}}>
      <canvas ref={canvasRef} style={{border:"2px solid #4245a8",position:"absolute",transform:`scale(${zoom})`,marginTop:"100px"}} />
      <canvas id="fabcanvas" height={1584} width={1224} ref={fabricCanvasInstanceRef} style={{zIndex: 1, position:"absolute",transform:`scale(${zoom})`,marginTop:"100px"}}/>
      </div></>
    ) : (
      <div style={{position:"relative", display:"flex", justifyContent:"center"}}>
      <div style={{position:"absolute",border:"2px solid #4245a8", height:"420px", width:"1020px",display:"flex",justifyContent:"center", alignItems:"center",zIndex: 1,marginLeft:"auto",marginTop:"90px",marginRight:"auto"}}>
      {<Upload onUpload={setFilePathnew} />}
      </div></div>
    )}

  </>
  );
}

export default Editor;
