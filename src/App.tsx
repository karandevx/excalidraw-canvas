import React, { useEffect, useState, useRef, useCallback } from "react";
import dore from "../public/doremon.png";
import {
  exportToCanvas,
  exportToSvg,
  exportToBlob,
  exportToClipboard,
  Excalidraw,
  useHandleLibrary,
  MIME_TYPES,
  sceneCoordsToViewportCoords,
  viewportCoordsToSceneCoords,
  restoreElements,
  LiveCollaborationTrigger,
  MainMenu,
  Footer,
  Sidebar,
} from "@excalidraw/excalidraw";
import {
  AppState,
  BinaryFileData,
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
  Gesture,
  LibraryItems,
  PointerDownState as ExcalidrawPointerDownState,
} from "@excalidraw/excalidraw/types/types";

import ExampleSidebar from "./sidebar/ExampleSidebar";

import "./App.scss";
import initialData from "./initialData";

import { NonDeletedExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { nanoid } from "nanoid";
import CustomFooter from "./CustomFooter";
import MobileFooter from "./MobileFooter";
import {
  resolvablePromise,
  withBatchedUpdates,
  withBatchedUpdatesThrottled,
  distance2d,
} from "./utils";
import { ResolvablePromise } from "@excalidraw/excalidraw/types/utils";

declare global {
  interface Window {
    ExcalidrawLib: any;
  }
}

type Comment = {
  x: number;
  y: number;
  value: string;
  id?: string;
};

type PointerDownState = {
  x: number;
  y: number;
  hitElement: Comment;
  onMove: any;
  onUp: any;
  hitElementOffsets: {
    x: number;
    y: number;
  };
};

export default function App() {
  const appRef = useRef<any>(null);
  const [viewModeEnabled, setViewModeEnabled] = useState(false);
  const [drop, setDrop] = useState(false);
  const [zenModeEnabled, setZenModeEnabled] = useState(false);
  const [gridModeEnabled, setGridModeEnabled] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string>("");
  const [canvasUrl, setCanvasUrl] = useState<string>("");
  const [exportWithDarkMode, setExportWithDarkMode] = useState(false);
  const [exportEmbedScene, setExportEmbedScene] = useState(false);
  const [theme, setTheme] = useState("light");
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [commentIcons, setCommentIcons] = useState<{ [id: string]: Comment }>(
    {}
  );
  const initialStatePromiseRef = useRef<{
    promise: ResolvablePromise<ExcalidrawInitialDataState | null>;
  }>({ promise: null! });
  if (!initialStatePromiseRef.current.promise) {
    initialStatePromiseRef.current.promise = resolvablePromise();
  }

  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);

  useHandleLibrary({ excalidrawAPI });

  const fetchData = async (imagesrc: any) => {
    console.log("imagesrc f", imagesrc);
    const res = await fetch(imagesrc.length > 0 ? imagesrc : "/rocket.jpeg");
    console.log("fetch", res);
    const imageData = await res.blob();
    const reader = new FileReader();
    reader.readAsDataURL(imageData);

    reader.onload = function () {
      const imagesArray: BinaryFileData[] = [
        {
          id: "rockettt" as BinaryFileData["id"],
          dataURL: reader.result as BinaryFileData["dataURL"],
          mimeType: MIME_TYPES.jpg,
          created: 1644915140367,
          lastRetrieved: 1644915140367,
        },
      ];

      //@ts-ignore
      // initialStatePromiseRef.current.promise.resolve(initialData);
      initialStatePromiseRef.current.promise.resolve(initialData);
      console.log("initialStatePromiseRef", initialStatePromiseRef);
      excalidrawAPI?.addFiles(imagesArray);
    };
  };
  useEffect(() => {
    if (!excalidrawAPI) {
      return;
    }
  
    fetchData("");
  }, [excalidrawAPI]);

  const updateScene = () => {
    // const sceneData = {
    //   // elements: restoreElements([], null),
    //   appState: {
    //       viewBackgroundColor: "./rocket.jpeg"
    //   },
    // };
    const backgroundImageElement = [
      {
        type: "image",
        id: "backgroundImage",
        x: 100,
        y: 100,
        width: 200,
        height: 200,
        image: {
          src: "https://idsb.tmgrup.com.tr/ly/uploads/images/2022/12/19/thumbs/800x531/247181.jpg?v=1671435583",
          crossOrigin: "anonymous", // If your image is hosted on a different domain
        },
      },
    ];
    const sceneData = {
      elements: restoreElements(backgroundImageElement as any, null),
    };

    excalidrawAPI?.updateScene(sceneData as any);
  };

  const onLinkOpen = useCallback(
    (
      element: NonDeletedExcalidrawElement,
      event: CustomEvent<{
        nativeEvent: MouseEvent | React.PointerEvent<HTMLCanvasElement>;
      }>
    ) => {
      const link = element.link!;
      const { nativeEvent } = event.detail;
      const isNewTab = nativeEvent.ctrlKey || nativeEvent.metaKey;
      const isNewWindow = nativeEvent.shiftKey;
      const isInternalLink =
        link.startsWith("/") || link.includes(window.location.origin);
      if (isInternalLink && !isNewTab && !isNewWindow) {
        // signal that we're handling the redirect ourselves
        event.preventDefault();
        // do a custom redirect, such as passing to react-router
       
      }
    },
    []
  );

  const onCopy = async (type: "png" | "svg" | "json") => {
    if (!excalidrawAPI) {
      return false;
    }
    await exportToClipboard({
      elements: excalidrawAPI.getSceneElements(),
      appState: excalidrawAPI.getAppState(),
      files: excalidrawAPI.getFiles(),
      type,
    });
    window.alert(`Copied to clipboard as ${type} successfully`);
  };

  const addTextElement = async() => {
    console.log("called");
    // const newTextElement: any =  [{
    //   id: "MB9CSH621UdIKH8MEgOhaM",
    //   type: "text",
    //   x: 331.83412499999997,
    //   y: 141.984625,
    //   width: 153,
    //   height: 165,
    //   angle: 0,
    //   strokeColor: "#000000",
    //   backgroundColor: "#e64980",
    //   fillStyle: "solid",
    //   strokeWidth: 1,
    //   strokeStyle: "solid",
    //   roughness: 1,
    //   opacity: 100,
    //   groupIds: [],
    //   strokeSharpness: "sharp",
    //   seed: 802336758,
    //   version: 77,
    //   versionNonce: 227885290,
    //   isDeleted: false,
    //   boundElements: null,
    //   updated: 1639729535736,
    //   text: "Hellllllo World!!!\nSticky \nnotes :)",
    //   fontSize: 20,
    //   fontFamily: 2,
    //   textAlign: "center",
    //   verticalAlign: "middle",
    //   baseline: 118,
    //   // containerId: "6sVDp9mCGQTomD9nCg5w1b",
    //   originalText: "Helllllo World!!!\n\nSticky notes :)",

    // }];

    const newTextElement: any = [
      {
        fileId: "rocket",
        id: "6-AIA3cpXH6jwqerbF6rp",
        type: "image",
        x: 237.33333121405704,
        y: -37.819445356910634,
        width: 349.3333333333333,
        height: 262,
        angle: 0,
        strokeColor: "transparent",
        backgroundColor: "transparent",
        fillStyle: "hachure",
        strokeWidth: 1,
        strokeStyle: "solid",
        roughness: 1,
        opacity: 100,
        groupIds: [],
        frameId: null,
        roundness: null,
        seed: 795684509,
        version: 4,
        versionNonce: 916617149,
        isDeleted: false,
        boundElements: null,
        updated: 1699879238757,
        link: null,
        locked: false,
        // status: "pending",
        // fileId: "793a93d9ebb97ed53759a2678c4c936b5202dc64",
        scale: [1, 1],
      },
    ];
    const currentEle = excalidrawAPI?.getSceneElements();
    console.log("currentele", currentEle);
    const updated = [...(currentEle || []), ...(newTextElement || [])];
    // const sceneData = {
    //   elements: [...(currentEle || []), ...(newTextElement || [])],
    // };
    const sceneData = {
      elements: restoreElements(updated, null),
    };
    console.log("sceneData", sceneData);

    excalidrawAPI?.updateScene(sceneData as any);
    const res = await fetch("/rocket.jpeg");
    console.log("fetch", res);
    const imageData = await res.blob();
    const reader = new FileReader();
    reader.readAsDataURL(imageData);

    reader.onload = function () {
      const imagesArray: BinaryFileData[] = [
        {
          id: "rocket" as BinaryFileData["id"],
          dataURL: reader.result as BinaryFileData["dataURL"],
          mimeType: MIME_TYPES.jpg,
          created: 1644915140367,
          lastRetrieved: 1644915140367,
        },
      ];

    
      excalidrawAPI?.addFiles(imagesArray);
    };
  };
  const [pointerData, setPointerData] = useState<{
    pointer: { x: number; y: number };
    button: "down" | "up";
    pointersMap: Gesture["pointers"];
  } | null>(null);

  const renderSidebar = () => {
    return (
      <></>
      // <Sidebar>
      //   <Sidebar.Header>Custom header!</Sidebar.Header>
      //   Custom sidebar!
      // </Sidebar>
    );
  };
  const handleImageDragStart = (event: React.DragEvent<HTMLImageElement>) => {
    // Customize the drag data to include necessary information
    console.log("srcc",event)
    const imageSrc = event.currentTarget.src;
    console.log("imageSrc", imageSrc);
    // event.dataTransfer.setData("text/plain", imageSrc);
    // fetchData(imageSrc);
    handleRightSideDivDrop(imageSrc)
    setDrop(true);
  };
  const handleRightSideDivDrop = async (imageSrc: any) => {
    // event.preventDefault();
    //const imageSrc = event.dataTransfer.getData("text/plain");
    var canvas = document.querySelector('.excalidraw__canvas') as HTMLCanvasElement;
    var width = canvas?.width;
    var height = canvas?.height;
console.log("class e",canvas,width,height)


    const newTextElement: any = [
      {
        fileId: "rocket",
        id: "6-AIA3cpXH6jwqerbF6rp",
        type: "image",
        x:0.33333121405704,
        y: 0.819445356910634,
        width: width/1.80,
        height:height/1.80,
        angle: 0,
        strokeColor: "transparent",
        backgroundColor: "transparent",
        fillStyle: "hachure",
        strokeWidth: 1,
        strokeStyle: "solid",
        roughness: 1,
        opacity: 100,
        groupIds: [],
        frameId: null,
        roundness: null,
        seed: 795684509,
        version: 4,
        versionNonce: 916617149,
        isDeleted: false,
        boundElements: null,
        updated: 1699879238757,
        link: null,
        locked: false,
        // status: "pending",
        // fileId: "793a93d9ebb97ed53759a2678c4c936b5202dc64",
        scale: [1,1],
      },
    ];
    const currentEle = excalidrawAPI?.getSceneElements();
    console.log("currentele", currentEle);
    const filteredCurrentEle = currentEle?.filter(
      (element:any) => element?.fileId !== newTextElement[0]?.fileId
    );
    
    const updated = [...(filteredCurrentEle || []), ...(newTextElement || [])];
    // const sceneData = {
    //   elements: [...(currentEle || []), ...(newTextElement || [])],
    // };
    const sceneData = {
      elements: restoreElements(updated, null),
    };
    console.log("sceneData", sceneData);

    excalidrawAPI?.updateScene(sceneData as any);
    const res = await fetch(imageSrc);
    console.log("fetch", res);
    const imageData = await res.blob();
    const reader = new FileReader();
    reader.readAsDataURL(imageData);

    reader.onload = function () {
      const imagesArray: BinaryFileData[] = [
        {
          id: "rocket" as BinaryFileData["id"],
          dataURL: reader.result as BinaryFileData["dataURL"],
          mimeType: MIME_TYPES.jpg,
          created: 1644915140367,
          lastRetrieved: 1644915140367,
        },
      ];

    
      excalidrawAPI?.addFiles(imagesArray);
    };
   
  };
  

  const renderMenu = () => {
    return (
      <MainMenu>
        <MainMenu.DefaultItems.SaveAsImage />
        <MainMenu.DefaultItems.Export />
        <MainMenu.Separator />
        {/* <MainMenu.DefaultItems.LiveCollaborationTrigger
          isCollaborating={isCollaborating}
          onSelect={() => window.alert("You clicked on collab button")}
        /> */}
        <MainMenu.Group title="Excalidraw links">
          <MainMenu.DefaultItems.Socials />
        </MainMenu.Group>
        <MainMenu.Separator />
        <MainMenu.ItemCustom>
          <button
            style={{ height: "2rem" }}
            onClick={() => window.alert("custom menu item")}
          >
            custom item
          </button>
        </MainMenu.ItemCustom>
        <MainMenu.DefaultItems.Help />

        {excalidrawAPI && <MobileFooter excalidrawAPI={excalidrawAPI} />}
      </MainMenu>
    );
  };
  return (
    <div className="App" ref={appRef}>
        <div className="navbar">
    <div className="dropdown">
      <button className="dropbtn">Select Background</button>
      <div className="dropdown-content">
        <img src="messi.png"   onClick={(event)=>{  event.preventDefault();
                handleImageDragStart(event as any)}} alt="Image 1"/>
        <img src="pika.jpeg"   onClick={(event)=>{  event.preventDefault();
                handleImageDragStart(event as any)}} alt="Image 2"/>
        <img src="rocket.jpeg"   onClick={(event)=>{  event.preventDefault();
                handleImageDragStart(event as any)}} alt="Image 3"/>
     
      </div>
    </div>
  </div>
      <h1>HTML canvas</h1>
      <ExampleSidebar>
        <div className="button-wrapper">
          <button className="update-scene" onClick={updateScene}>
            Update Canvas
          </button>
          <button
            className="reset-scene"
            onClick={() => {
              excalidrawAPI?.resetScene();
            }}
          >
            Reset Canvas
          </button>

          <label>
            <input
              type="checkbox"
              checked={viewModeEnabled}
              onChange={() => setViewModeEnabled(!viewModeEnabled)}
            />
            View mode
          </label>
          {/* <label>
            <input
              type="checkbox"
              checked={zenModeEnabled}
              onChange={() => setZenModeEnabled(!zenModeEnabled)}
            />
            Zen mode
          </label> */}
          <label>
            <input
              type="checkbox"
              checked={gridModeEnabled}
              onChange={() => setGridModeEnabled(!gridModeEnabled)}
            />
            Grid mode
          </label>
          <label>
            <input
              type="checkbox"
              checked={theme === "dark"}
              onChange={() => {
                let newTheme = "light";
                if (theme === "light") {
                  newTheme = "dark";
                }
                setTheme(newTheme);
              }}
            />
            Switch to Dark Theme
          </label>

          <button onClick={onCopy.bind(null, "png")}>
            Copy to Clipboard as PNG
          </button>
          {/* <button onClick={onCopy.bind(null, "svg")}>
            Copy to Clipboard as SVG
          </button> */}
          <button onClick={onCopy.bind(null, "json")}>
            Copy to Clipboard as JSON
          </button>

          <div
            style={{
              display: "flex",
              gap: "1em",
              justifyContent: "center",
              marginTop: "1em",
            }}
          >
            <div>x: {pointerData?.pointer.x ?? 0}</div>
            <div>y: {pointerData?.pointer.y ?? 0}</div>
          </div>
        </div>

      
        {/* <div
            onClick={(event)=>{
              event.preventDefault();
             // handleRightSideDivDrop(event)
            }
            }
           
          >
            {" "}
            <img
              onClick={(event)=>{  event.preventDefault();
                handleImageDragStart(event as any)}}
             // src="messi.png"
              alt="messi"
              style={{
                height: "200px",
                width: "240px",
              }}
            />
          </div> */}
        <div className="parentDiv">
          <div
            className="excalidraw-wrapper"
            onDrop={(event) => {
              // handleDrop(event);
              console.log("droppp");
            }}
            onDragOver={(event) => event.preventDefault()}
          >
            {/* <div
              style={{
                position: "absolute",
                left: "50%",
                bottom: "20px",
                display: "flex",
                zIndex: 999999,
                padding: "5px 10px",
                transform: "translateX(-50%)",
                background: "rgba(255, 255, 255, 0.8)",
                gap: "1rem",
              }}
            ></div> */}
            <Excalidraw
              ref={(api: ExcalidrawImperativeAPI) => setExcalidrawAPI(api)}
              initialData={initialStatePromiseRef.current.promise}
              onChange={(elements, state) => {
                console.info("Elements :", elements, "State : ", state);
              }}
              onPointerUpdate={(payload: {
                pointer: { x: number; y: number };
                button: "down" | "up";
                pointersMap: Gesture["pointers"];
              }) => setPointerData(payload)}
              viewModeEnabled={viewModeEnabled}
              zenModeEnabled={zenModeEnabled}
              gridModeEnabled={gridModeEnabled}
              theme={theme as any}
              name="Custom name of drawing"
              UIOptions={{ canvasActions: { loadScene: false } }}
              onLinkOpen={onLinkOpen}
              detectScroll={true}
              // onPointerDown={onPointerDown}
            
              // renderSidebar={renderSidebar}
            >
              {/* {excalidrawAPI && (
              <Footer>
                <CustomFooter excalidrawAPI={excalidrawAPI} />
              </Footer>
            )}
            {renderMenu()} */}
            </Excalidraw>
            {/* <img
              src="messi.png"
              alt="background"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
              }}
            /> */}
          </div>
          <div className="sidebarr">
    <div className="sidebarr-header">
      <h2>Image Collection</h2>
    </div>
    <div className="image-list"
      onDrop={handleRightSideDivDrop}
      onDragOver={(event) => event.preventDefault()}
      >
      <img src="doremon.png"   onDragStart={handleImageDragStart} alt="Image 1"/>
      <img src="pika.jpeg"   onDragStart={handleImageDragStart} alt="Image 2"/>
      <img src="messi.png"  onDragStart={handleImageDragStart} alt="Image 3"/>
      <img src="rocket.jpeg"  onDragStart={handleImageDragStart} alt="Image 3"/>
    </div>
  </div>
          {/* <div
            onDrop={handleRightSideDivDrop}
            onDragOver={(event) => event.preventDefault()}
          >
            {" "}
            <img
              onDragStart={handleImageDragStart}
              src="messi.png"
              alt="messi"
              style={{
                height: "200px",
                width: "240px",
              }}
            />
          </div> */}
        </div>
        <button style={{ background: "/rocket.jpeg" }} onClick={addTextElement}>
          Add Text Element
        </button>
      </ExampleSidebar>
    </div> 
  );
}
