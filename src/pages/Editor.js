import React, { useState, useEffect, useRef } from 'react';
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import * as pdfjsLib from 'pdfjs-dist';
import { getDocument, OPS } from 'pdfjs-dist';
import * as fabric from 'fabric'
import Upload from '../components/Upload';
import Download from '../components/Download';



import { LiaMarkerSolid } from "react-icons/lia";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.mjs`;

function Editor() {
  const [filePathnew, setFilePathnew] = useState(null);
  const [editedFile, setEditedFile] = useState(null);

  const [img, setimg] =useState();

  const [height, setheight] = useState(0);
  const [width, setwidth] = useState(0);
  const [pageno, setpageno] = useState(1);
  let [pagesize, setpageSize] = useState(2);
  let [zoom, setzoom] = useState(1);
  const [currentfile, setcurrentfile]= useState('');
  const [pdffile, setpdffile] = useState();
  const [color,setcolor]=useState("black");
  const [pagecontents, setpagecontent] = useState();
  const [operatorlist, setoperatorlist] = useState();
  const [isediting, setisediting] = useState(false);

  const [isuploading, setisuploading] = useState(false);

  const [totalpages,settotalpages] =useState();

  const [currentpage, setcurrentpage] =useState();

  // const [undoStack, setUndoStack] = useState([]);
  // const [redoStack, setRedoStack] = useState([]);

  const canvasRef = useRef();
  const fabricCanvasRef = useRef(null);
  const fabricCanvasInstanceRef = useRef();

  // console.log(filePathnew);

  const settextcolor=(e)=>{
    setcolor(e.target.value);
    const fabricCanvas = fabricCanvasInstanceRef.current;
    const activeObject = fabricCanvas.getActiveObject();
  if (activeObject && activeObject.type === 'i-text') {
    activeObject.set('fill', color);
    fabricCanvas.renderAll();
  }else if (activeObject && activeObject.type === 'rect') {
    activeObject.set('fill', color);
    fabricCanvas.renderAll();
  }else if (activeObject && activeObject.type === 'line') {
    activeObject.set('stroke', color);
    fabricCanvas.renderAll();
  }

  }


  const handleEditContent = async ()=>{
    const fabricCanvas = fabricCanvasInstanceRef.current;
    fabricCanvas.setZoom(2)
    // console.log(currentpage);
    // console.log(pdffile)

    // const pages = pdffile.getPages();
    // const firstPage = pages[Number(pageno)-1];
    // const dataUrl = fabricCanvas.toDataURL({ format: 'png' });
    // const pngImage = await pdffile.embedPng(dataUrl);

    const response = await fetch(currentfile);
    const existingPdfBytes = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const pages = pdfDoc.getPages();
    const firstPage = pages[Number(pageno)-1];

          
    pagecontents.items.forEach((item) => {
      const transform = item.transform;
      const x = transform[4]; // X position
      const y = (height/2) - transform[5]; // Adjust Y for Fabric.js
      const fontName = item.fontName || 'Unknown';
      let scalefactor = 1;
      // console.log(item)

      const commonObjs = currentpage.commonObjs;

      const font = commonObjs.get(fontName);

      const fontFamily = font.fallbackName;
      let fontWeight = 'normal';
      let fontStyle = 'normal';

      const isBold = font.name && font.name.toLowerCase().includes('bold');
    const isItalic = font.name && font.name.toLowerCase().includes('italic');

    if (isBold) {
      fontWeight = 'bold';
      scalefactor =0.95;

  }
  if (isItalic) {
      fontStyle = 'italic';
  }

  if(transform[0]>=27){
    scalefactor=0.8;
  }

      if(item.str==" "){
      
      }
      else{
      const text = new fabric.IText(item.str, {
        left: x,
        top: y-(transform[0]-1)*scalefactor+2,
        fontSize: (transform[0]-1)*scalefactor, // Approximate font size
        fontFamily: fontFamily,
        fontWeight: fontWeight,
        fontStyle: fontStyle,
        fill: 'black',
        hasControls: true,
        lockMovementY:true,
        lockRotation:true,
        // lockScalingFlip: true,
        // originX: "left", // Horizontal center alignment
        // originY: "bottom",
        // backgroundColor: "white",
      });
      fabricCanvas.add(text);
      firstPage.drawRectangle({
        x: x, // X-coordinate
        y: transform[5]-2, // Y-coordinate (from the bottom of the page)
        width: item.width, // Width of the rectangle
        height: item.height, // Height of the rectangle
        color: rgb(1, 1, 1), // Color (red in this case)
      });
      // console.log(item.width, item.height,x,y);
    }
    
    // item.str = ""
      setpdffile(pdfDoc);
    })

    

    setisediting(true);

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    setcurrentfile(URL.createObjectURL(blob));
    // setEditedFile(URL.createObjectURL(blob));
    setpdffile(pdfDoc);

    // const objects = fabricCanvas.getObjects();

    // // const rectObjects = objects.filter(obj => obj.type === 'rect');
    // console.log(objects);
  };

  const handlepageno=(e)=>{
    if(e.target.value>totalpages || e.target.value<=0){
      setpageno(1);
      setpageno(1);
    }
    else{
    setpageno(e.target.value);
    setpageno(e.target.value);}
  }

  const pageZoomin = async ()=>{
    zoom+= 0.1;
    setzoom(zoom);
  }

  const pageZoomOut = async ()=>{
    zoom-= 0.1;
    setzoom(zoom);
  }

  const handleClear=()=>{
    // const fabricCanvas = fabricCanvasInstanceRef.current;
    // fabricCanvas.clear();

    const fabricCanvas = fabricCanvasInstanceRef.current;
    const activeObject = fabricCanvas.getActiveObject();
  if (activeObject) {
    fabricCanvas.remove(activeObject);
    fabricCanvas.discardActiveObject(); // Clear the selection
    fabricCanvas.renderAll();}
  }


  

  const handleEdit = async (type) => {
    // console.log(width,height);
    const response = await fetch(currentfile);
    const existingPdfBytes = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[Number(pageno)-1];
    const fabricCanvas = fabricCanvasInstanceRef.current;

    fabricCanvas.setZoom(2);

      switch (type) {
        case "text":
        const text = new fabric.IText("Enter text here", {
         left: 100,
         top:100,
         fontFamily: "Arial",
         fill: color,
         fontSize: 20,
         hasControls: true,
         lockRotation:true,
        //  lockScalingY: true,
        // lockScalingX: true,
        // lockScaling: false,
        // lockMovementY:true,
         lockScalingFlip: true,
        //  selectable: true,
        });
        fabricCanvas.add(text);
          break;
      
        case "strike line":
          const strikeLine = new fabric.Rect(
            {
            left: 100,
            top: 100,
            width: 100,
            height: 3,
            fill: color,
            hasControls: true,
            lockScalingFlip: true,
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
            hasControls: true,
            lockScalingFlip: true,
          });
          fabricCanvas.add(highlight);
          break;
      
        default:
          
          break;
      }

    // fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas);
    // fabricCanvas.freeDrawingBrush.width = 5; // Stroke width
    // fabricCanvas.freeDrawingBrush.color = 'rgba(0, 0, 255, 0.7)';

    // fabricCanvas.sendToBack(highlight);

    setisediting(true);

    // const pdfBytes = await pdfDoc.save();
    // const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    // setcurrentfile(URL.createObjectURL(blob));

    setpdffile(pdfDoc);

  };

  const saveEdit= async ()=>{
    const fabricCanvas = fabricCanvasInstanceRef.current;
    const dataUrl = fabricCanvas.toDataURL({ format: 'png' });
    const pngImage = await pdffile.embedPng(dataUrl);
    const imageDims = pngImage.scaleToFit(width, height);

    const response = await fetch(currentfile);
    const existingPdfBytes = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[Number(pageno)-1];

    const objects = fabricCanvas.getObjects();

    // console.log(objects);

    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // fabricCanvas.on('object:scaling', (event) => {
  //   const obj = event.target;
  //   // console.log(`Width: ${obj.width * obj.scaleX}, Height: ${obj.height * obj.scaleY}`);
  // });

  // fabricCanvas.on('object:modified', (event) => {
  //   const obj = event.target;
  //   obj.set({
  //     width: obj.width * obj.scaleX,
  //     height: obj.height * obj.scaleY,
  //     scaleX: 1,
  //     scaleY: 1,
  //   });
  //   fabricCanvas.renderAll();
  // });

// Filter for text objects
const textObjects = objects.filter(obj => obj.type === 'text' || obj.type === 'i-text');

const rectObjects = objects.filter(obj => obj.type === 'rect');

// const lineObjects = objects.filter(obj => obj.type === 'line');




function parseColorToRgb(color) {
  let rgb = [0, 0, 0]; // Default to black
  
  if (color.startsWith('#')) {
    // Hexadecimal color
    let hex = color.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map(h => h + h).join(''); // Expand shorthand (#rgb to #rrggbb)
    }
    rgb = [
      parseInt(hex.substring(0, 2), 16),
      parseInt(hex.substring(2, 4), 16),
      parseInt(hex.substring(4, 6), 16)
    ];
  } else if (color.startsWith('rgb')) {
    // RGB or RGBA color
    const match = color.match(/rgba?\((\d+), (\d+), (\d+)/);
    if (match) {
      rgb = match.slice(1, 4).map(Number);
    }
  }

  return rgb.map(value => value / 255);
}

// Extract text and their properties
const textData = textObjects.map(textObj => ({
  text:textObj.text,
  left: textObj.left,
  top: textObj.top-2*textObj.scaleY,
  fontSize: textObj.fontSize* Math.min(textObj.scaleX, textObj.scaleY),
  fontFamily: textObj.fontFamily,
  fontStyle:textObj.fontStyle,
  fontWeight:textObj.fontWeight,
  fill: textObj.fill,
  // scaleX: textObj.scaleX,
  // scaleY: textObj.scaleY,
  // originY: "bottom",
}));

const rectData = rectObjects.map(rectObj => ({
  left: rectObj.left,
  top: rectObj.top,
  width: rectObj.width*rectObj.scaleX,
  height: rectObj.height*rectObj.scaleY,
  fill: rectObj.fill,
  opacity: rectObj.opacity,
  // scaleX: rectObj.scaleX,
  // scaleY: rectObj.scaleY,
}));

// const lineData = lineObjects.map(lineObj => ({
//   start: { x: lineObj.x1, y:height/2-lineObj.y1 },
//     end: { x: lineObj.x2, y:height/2-lineObj.y2 },
//     thickness: lineObj.strokeWidth, // Line thickness
//     color: lineObj.stroke, // Line color (red in this case) 
// }));



// console.log(textData);

textData.forEach(item => {
  if(item.fontWeight=='bold'){
  firstPage.drawText(item.text, {
    x: item.left,
    y: height/2-item.top-item.fontSize,
    size: item.fontSize,
    font: boldFont,
    color: rgb(parseColorToRgb(item.fill)[0],parseColorToRgb(item.fill)[1],parseColorToRgb(item.fill)[2]), // Black text
  });}
  if(item.fontStyle=='italic'){
    firstPage.drawText(item.text, {
      x: item.left,
      y: height/2-item.top-item.fontSize,
      size: item.fontSize,
      font: italicFont,
      color: rgb(parseColorToRgb(item.fill)[0],parseColorToRgb(item.fill)[1],parseColorToRgb(item.fill)[2]), // Black text
    });}
    if(item.fontStyle=='normal'&&item.fontWeight!='bold'){
      firstPage.drawText(item.text, {
        x: item.left,
        y: height/2-item.top-item.fontSize,
        size: item.fontSize,
        font: regularFont,
        color: rgb(parseColorToRgb(item.fill)[0],parseColorToRgb(item.fill)[1],parseColorToRgb(item.fill)[2]), // Black text
      });}

});

rectData.forEach(item => {

  firstPage.drawRectangle({
    x: item.left,
    y: height/2-item.top-item.height,
    width: item.width,
    height: item.height,
    opacity:item.opacity,
    color: rgb(parseColorToRgb(item.fill)[0],parseColorToRgb(item.fill)[1],parseColorToRgb(item.fill)[2]),
  });

});

// lineData.forEach(item => {

//   firstPage.drawLine({
//     start: { x: item.start.x, y: item.start.y},
//     end: { x: item.end.x, y: item.end.y},
//     thickness: item.thickness, // Line thickness
//     color: rgb(parseColorToRgb(item.color)[0],parseColorToRgb(item.color)[1],parseColorToRgb(item.color)[2]), // Line color (red in this case) 
//   });

// });


  
    // firstPage.drawImage(pngImage, {
    //   x: 0,
    //   y: 0,
    //   width: imageDims.width,
    //   height: imageDims.height,
    // });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    setcurrentfile(URL.createObjectURL(blob));
    setEditedFile(URL.createObjectURL(blob));

    fabricCanvas.clear();
  };

  

  useEffect(() => {
    const loadPdf = async () => {
      if(isediting==false){
      setcurrentfile(`https://pdf-editor-backend-mgej.onrender.com/${filePathnew}`);}

      // console.log(filePathnew);
      if (!filePathnew) return;

      // Get the PDF document
      const pdf = await pdfjs.getDocument(currentfile).promise;

      settotalpages(pdf.numPages);

      // Get the first page of the PDF
      const page = await pdf.getPage(Number(pageno));

      const contents = await page.getTextContent();
      const operatorlist = await page.getOperatorList();


      

      // const commonObjs = page.commonObjs;
      // const fontkey=operatorlist.argsArray[6][0].slice(0,5);
      // const font = commonObjs.get(`${fontkey}f1`);
      // console.log(fontkey, font.name);
      // console.log(commonObjs, operatorlist, page.objs);


      
      // setpdffile(pdf);
      setcurrentpage(page);
      setpagecontent(contents);
      setoperatorlist(operatorlist);


      // Set up the canvas for rendering the page
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      const viewport = page.getViewport({ scale: pagesize });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      // console.log(viewport.height,viewport.width, pagesize);
      setheight(viewport.height);
      setwidth(viewport.width);
      

      // Render the page into the canvas
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      page.render(renderContext);

      // const imagedata = canvas.toDataURL();
      // // console.log(imagedata);

      // const img = new Image();
      // img.src = imagedata;
      // setimg(imagedata);


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
  fabricCanvasInstance.fabric.dispose();
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
      <input type="color" value={color} onChange={(e)=>settextcolor(e)} />
      <p style={{color:"#4245a8",fontWeight:"bold",cursor:"pointer"}} onClick={()=>handleEditContent()}><i class="fa fa-edit" style={{color:"#4245a8", fontSize:"25px", position:"relative",top:"3px"}}></i> Edit pdf text</p>


      <p onClick={()=>handleEdit("text")}><i style={{color:"#4245a8", fontSize:"25px",cursor:"pointer"}} class="fa fa-text-width"></i></p>
      <p onClick={()=>handleEdit("strike line")}><i style={{color:"#4245a8", fontSize:"23px",cursor:"pointer"}} class="fa fa-strikethrough"></i></p>
      <p onClick={()=>handleEdit("highlight")}><LiaMarkerSolid  style={{color:"#4245a8", fontSize:"23px",cursor:"pointer"}}/></p>
      <p onClick={()=>handleClear()}><i style={{color:"#4245a8", fontSize:"23px",cursor:"pointer"}} class="fa fa-eraser"></i></p>
      <div style={{display:"flex", alignItems:"center", gap:"5px"}}><input style={{border:"2px solid #4245a8", width:"30px",height:"25px"}} type="number" value={pageno} onChange={(e) => handlepageno(e)}/><p style={{color:"#4245a8",fontWeight:"bold",cursor:"pointer"}}>/{totalpages}</p></div>
      <p onClick={()=>pageZoomin()}><i style={{color:"#4245a8", fontSize:"23px",cursor:"pointer"}} class="fa fa-search-plus"></i></p>
      <p onClick={()=>pageZoomOut()}><i style={{color:"#4245a8", fontSize:"23px",cursor:"pointer"}} class="fa fa-search-minus"></i></p>
      {/* <p onClick={()=>undoAction()}><i style={{color:"#4245a8", fontSize:"23px",cursor:"pointer"}} class="fa fa-undo"></i></p>
      <p onClick={()=>redoAction()}><i style={{color:"#4245a8", fontSize:"23px",cursor:"pointer"}} class="fa fa-repeat"></i></p> */}
      <p onClick={()=>saveEdit()}><i style={{color:"#4245a8", fontSize:"23px",cursor:"pointer"}} class="fa fa-save"></i></p>
      {<Download editedFile={editedFile}/>}
    </div>



      <>
      {filePathnew ? (<>
        <div style={{position:"relative", display:"flex", justifyContent:"center",marginTop:"0px",marginBottom:"50px",padding:"0px"}}>
        <canvas ref={canvasRef} style={{border:"2px solid #4245a8",position:"absolute",transform:`scale(${zoom})`,marginTop:"100px",marginBottom:"100px"}} />
        <canvas id="fabcanvas" height={792*2} width={612*2} ref={fabricCanvasInstanceRef} style={{zIndex: 1, position:"absolute",transform:`scale(${zoom})`,marginTop:"100px",marginBottom:"100px"}}/>
        </div>
        </>
      ) : (
        
        <>
        {isuploading===false ? 
        (
          <>
          <div style={{position:"relative", display:"flex", justifyContent:"center"}}>
          <div style={{position:"absolute",border:"2px solid #4245a8", height:"430px", width:"1220px",display:"flex",justifyContent:"center", alignItems:"center",zIndex: 1,marginLeft:"auto",marginTop:"90px",marginRight:"auto"}}>
          {<Upload isUploading={setisuploading} onUpload={setFilePathnew} />}
          </div></div>

          </>
        ):(
          <>
          <div style={{position:"relative", display:"flex", justifyContent:"center"}}>
          <div style={{position:"absolute",border:"2px solid #4245a8", height:"430px", width:"1220px",display:"flex",justifyContent:"center", alignItems:"center",zIndex: 1,marginLeft:"auto",marginTop:"90px",marginRight:"auto"}}>
          Loading....
          </div></div>

          </>
        )
      }
    
    </>
      
    )}
        
        </>

  </>
  );
}

export default Editor;
