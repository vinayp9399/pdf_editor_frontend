import React, { useState, useEffect, useRef } from 'react';
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import * as pdfjsLib from 'pdfjs-dist';
import { getDocument, OPS } from 'pdfjs-dist';
import * as fabric from 'fabric'
import Upload from '../components/Upload';
import Download from '../components/Download';
import fontkit from '@pdf-lib/fontkit';



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
  const [pageviewport, setpageviewport]=useState();
  const [isediting, setisediting] = useState(false);
  const [fontlist, setfontlist] =useState();

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
    fabricCanvas.setZoom(2);
    let textend = 0;

    const response = await fetch(currentfile);
    const existingPdfBytes = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const pages = pdfDoc.getPages();
    const firstPage = pages[Number(pageno)-1];


          
    pagecontents.items.forEach((item) => {
      const transform = item.transform;
      const [a, b, c, d, e, f] = transform;
      const fontSize = Math.sqrt(transform[0] ** 2 + transform[1] ** 2);

      // const scaleX = Math.sqrt(a * a + b * b);
      // const scaleY = Math.sqrt(c * c + d * d);
      // const scale =  Math.sqrt(scaleX * scaleX + scaleY * scaleY);
      // console.log(scaleX, scaleY);
      const x = transform[4]; // X position
      const y = (height/2) - transform[5]; // Adjust Y for Fabric.js
      const fontName = item.fontName || 'Unknown';
      console.log(item);

      const commonObjs = currentpage.commonObjs;

      const font = commonObjs.get(fontName);
      console.log(font);
      const fontMatrix =font.fontMatrix;
      // console.log(fontMatrix[0],fontMatrix[3]);

      const fontsliced = font.name.split(',');
      console.log(fontsliced[0]);

      const fontFamily = fontsliced[0].slice(7,);
     
      
      let fontWeight = 'normal';
      let fontStyle = 'normal';

      const isBold = font.name && font.name.toLowerCase().includes('bold');
    const isItalic = font.name && font.name.toLowerCase().includes('italic');

    if (isBold) {
      fontWeight = 'bold';

  }
  if (isItalic) {
      fontStyle = 'italic';
  }

  // if(item.width>300){
  //   scalefactor=0.9;
  // }

  const skewX = Math.atan2(transform[1], transform[0]) * (180 / Math.PI); // Convert radians to degrees
    const skewY = Math.atan2(transform[2], transform[3]) * (180 / Math.PI);

      if(item.str==" "){
      
      }

    else {
      const text = new fabric.IText(item.str, {
        left: x,
        // width:item.width,
        top: y-fontSize+2,
        fontSize: fontSize, // Approximate font size
        fontFamily: fontFamily,
        fontWeight: fontWeight,
        fontStyle: fontStyle,
        skewX: skewX,
        skewY: skewY,
        // backgroundColor:rgb(1,1,1),
        // opacity:0.5,
        // scaleX:item.width/10,
        // charSpacing:25,
        fill: 'black',
        // scaleX:Math.sqrt(transform[0]),
        // scaleY:Math.sqrt(transform[3]),
        // width:item.width,
        // scaleX: fontMatrix[0]*1050,
        // scaleY:fontMatrix[3]*1000,
        // scaleX:1.05,
        hasControls: false,
        lockMovementY:true,
        lockMovementX:true,
        lockRotation:true,
      });
      // text.set({
      //   width:item.width,
      //   height:item.height
      // });
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
    // textend = x + item.width;
    
    // item.str = ""
      setpdffile(pdfDoc);
    })
    

    setisediting(true);

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    setcurrentfile(URL.createObjectURL(blob));
    // setEditedFile(URL.createObjectURL(blob));
    setpdffile(pdfDoc);
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

  const pageZoomin = ()=>{
    zoom+= 0.1;
    setzoom(zoom);
  }

  const pageZoomOut = ()=>{
    zoom-= 0.1;
    setzoom(zoom);
  }

  const handleClear=()=>{

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
         lockScalingFlip: true,
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

    setisediting(true);

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

  //   const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  // const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  // const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);


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
  fontSize: textObj.fontSize,
  fontFamily: textObj.fontFamily,
  fontStyle:textObj.fontStyle,
  fontWeight:textObj.fontWeight,
  fill: textObj.fill,
}));

const rectData = rectObjects.map(rectObj => ({
  left: rectObj.left,
  top: rectObj.top,
  width: rectObj.width*rectObj.scaleX,
  height: rectObj.height*rectObj.scaleY,
  fill: rectObj.fill,
  opacity: rectObj.opacity,
}));

pdfDoc.registerFontkit(fontkit);

// let fontlist1 = [];

// textData.forEach(item => {
// fontlist1.append(item.fontFamily);
// })

// let s = new Set(fontlist1);

// let a1 = [...s]
// setfontlist(a1);

// let fonts =[];
  
for(let item of textData){

    console.log(item.fontFamily,item.fontWeight,item.fontStyle);
    if(item.fontFamily=="Calibri"||item.fontFamily=="Arial"||item.fontFamily=="Times New Roman"){
    var fontBytes = await fetch(`https://pdf-editor-backend-mgej.onrender.com/download-font/${item.fontFamily}-${item.fontWeight}-${item.fontStyle}.ttf`).then((res) =>
      res.arrayBuffer()
    ).catch((error)=>{
      console.log(error)
    })

    var font = await pdfDoc.embedFont(fontBytes);
  }
    else{
      var fontBytes = await fetch(`https://pdf-editor-backend-mgej.onrender.com/download-font/Arial-${item.fontWeight}-${item.fontStyle}.ttf`).then((res) =>
        res.arrayBuffer()
      ).catch((error)=>{
        console.log(error)
      })
  
      var font = await pdfDoc.embedFont(fontBytes);
    }

  if(item.fontWeight=='bold'){

  firstPage.drawText(item.text, {
    x: item.left,
    y: height/2-item.top-item.fontSize,
    size: item.fontSize,
    font: font,
    color: rgb(parseColorToRgb(item.fill)[0],parseColorToRgb(item.fill)[1],parseColorToRgb(item.fill)[2]), // Black text
  });}
  if(item.fontStyle=='italic'){

    firstPage.drawText(item.text, {
      x: item.left,
      y: height/2-item.top-item.fontSize,
      size: item.fontSize,
      font: font,
      color: rgb(parseColorToRgb(item.fill)[0],parseColorToRgb(item.fill)[1],parseColorToRgb(item.fill)[2]), // Black text
    });}
    if(item.fontStyle=='normal'&&item.fontWeight!='bold'){

      firstPage.drawText(item.text, {
        x: item.left,
        y: height/2-item.top-item.fontSize,
        size: item.fontSize,
        font: font,
        color: rgb(parseColorToRgb(item.fill)[0],parseColorToRgb(item.fill)[1],parseColorToRgb(item.fill)[2]), // Black text
      });}
    }
  

  

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
      setpageviewport(viewport.scale);
      

      // Render the page into the canvas
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      page.render(renderContext);

      
const fabricCanvasElement = fabricCanvasRef.current;

const fabricCanvasInstance = new fabric.Canvas('fabcanvas');
fabricCanvasInstanceRef.current = fabricCanvasInstance;

const fabricCanvas = fabricCanvasInstanceRef.current;

const handleKeyDown = (e) => {
  const activeObject = fabricCanvas?.getActiveObject(); // Get the currently selected object

  if (activeObject) {
    const moveDistance = 5; // Distance to move the object with each key press

    switch (e.key) {
      case 'ArrowUp':
        activeObject.set({ top: activeObject.top - moveDistance }); // Move up
        break;
      case 'ArrowDown':
        activeObject.set({ top: activeObject.top + moveDistance }); // Move down
        break;
      case 'ArrowLeft':
        activeObject.set({ left: activeObject.left - moveDistance }); // Move left
        break;
      case 'ArrowRight':
        activeObject.set({ left: activeObject.left + moveDistance }); // Move right
        break;
      default:
        return; // Do nothing for other keys
    }

    fabricCanvas.renderAll(); // Re-render the canvas to update the position
  }
};

// Attach the keydown event listener
document.addEventListener('keydown', handleKeyDown);

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
        <div style={{position:"relative", display:"flex", justifyContent:"center",marginTop:"0px",marginBottom:"50px",padding:"0px",transform:`scale(${zoom})`}}>
        <canvas ref={canvasRef} style={{border:"2px solid #4245a8",position:"absolute",marginTop:"100px",marginBottom:"100px"}} />
        <canvas id="fabcanvas" height={792*2} width={612*2} ref={fabricCanvasInstanceRef} style={{zIndex: 1, position:"absolute",marginTop:"100px",marginBottom:"100px"}}/>
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
          <div class="loader">
          </div>
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
