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

export default function App() {
  const appRef = useRef<any>(null);
  const [viewModeEnabled, setViewModeEnabled] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [drop, setDrop] = useState(false);
  const [zenModeEnabled, setZenModeEnabled] = useState(false);
  const [gridModeEnabled, setGridModeEnabled] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string>("");
  const [canvasUrl, setCanvasUrl] = useState<string>("");
  const [exportWithDarkMode, setExportWithDarkMode] = useState(false);
  const [exportEmbedScene, setExportEmbedScene] = useState(false);
  const [theme, setTheme] = useState("light");
  const initialStatePromiseRef = useRef<{
    promise: ResolvablePromise<ExcalidrawInitialDataState | null>;
  }>({ promise: null! });
  if (!initialStatePromiseRef.current.promise) {
    initialStatePromiseRef.current.promise = resolvablePromise();
  }

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
  };

  const changeBgColor = () => {
    const currentEle = excalidrawAPI?.getSceneElements();
    const sceneData = {
      elements: restoreElements(currentEle, null),
      appState: {
        viewBackgroundColor: selectedColor,
      },
    };
    excalidrawAPI?.updateScene(sceneData as any);
  };

  useEffect(() => {
    changeBgColor();
  }, [selectedColor]);
  const [contentType, setContentType] = useState<string>('image'); 
  const handleContentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setContentType(e.target.value);
  };
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);

  useHandleLibrary({ excalidrawAPI });

  const fetchData = async () => {
    // const res = await fetch(imagesrc.length > 0 ? imagesrc : "");
    // const imageData = await res.blob();
    // const reader = new FileReader();
    // reader.readAsDataURL(imageData);
    // reader.onload = function () {
    //   const imagesArray: BinaryFileData[] = [
    //     {
    //       id: "test" as BinaryFileData["id"],
    //       dataURL: reader.result as BinaryFileData["dataURL"],
    //       mimeType: MIME_TYPES.jpg,
    //       created: 1644915140367,
    //       lastRetrieved: 1644915140367,
    //     },
    //   ];
    initialStatePromiseRef.current.promise.resolve(initialData);
    // excalidrawAPI?.addFiles(imagesArray);
  };

  useEffect(() => {
    if (!excalidrawAPI) {
      return;
    }

    fetchData();
  }, [excalidrawAPI]);

  const updateScene = () => {
    // const sceneData = {
    //   // elements: restoreElements([], null),
    //   appState: {
    //       viewBackgroundColor: "./rocket.jpeg"
    //   },
    // };
    // const backgroundImageElement = [
    //   {
    //     type: "image",
    //     id: "backgroundImage",
    //     x: 100,
    //     y: 100,
    //     width: 200,
    //     height: 200,
    //     image: {
    //       src: "https://idsb.tmgrup.com.tr/ly/uploads/images/2022/12/19/thumbs/800x531/247181.jpg?v=1671435583",
    //       crossOrigin: "anonymous", // If your image is hosted on a different domain
    //     },
    //   },
    // ];
    // const sceneData = {
    //   elements: restoreElements(backgroundImageElement as any, null),
    // };
    // excalidrawAPI?.updateScene(sceneData as any);
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

  const addTextElement = async () => {
    console.log("called");
    //const newTextElement: any =  [
      // {
      //   type: "rectangle",
      //   x: 100,
      //   y: 100, width: 200,
      //   height: 105,
      //   strokeWidth: 2,
      //   id: "1"
      // },
      // {
      //   type: "diamond",
      //   x: 120,
      //   y: 120,
      //   width: 200,
      //   height: 105,
      //   backgroundColor: "#fff3bf",
      //   strokeWidth: 2,
       
      //   label: {
      //     text: "HELLO EXCALIDRAW",
      //     strokeColor: "black",
      //     fontSize: 30
      //   },
      //   id: "2"
      // },
      // {
      //   type: "frame",
      //   children: [1, 2],
      //   name: "My frame"
      // }
    //   {
    //   id: "MB9CSH621UdIKH8MEgOhaM",
    //   type: "text",
    //   x: 331.83412499999997,
    //   y: 141.984625,
    //   width: 200,
    //   height: 105,
    //   angle: 0,
    //   strokeColor: "#000000",
    //   backgroundColor: "transparent",
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
    //   text: "Item Name: soup \n Description: soup descrption \nPrice: $XX.XX",
    //   fontSize: 20,
    //   fontFamily: 2,
    //   textAlign: "left",
    //   verticalAlign: "middle",
    //   baseline: 118,
    //   // containerId: "6sVDp9mCGQTomD9nCg5w1b",
    //   originalText: "Helllllo World!!!\nSticky notes :)",

    // }
  //];
  const headerText :any=[{
    id: 'header',
    type: 'text',
    x: 331.83412499999997,
    y: 100,
    width: 200,
    height: 35,
    angle: 0,
    strokeColor: '#000000',
    backgroundColor: 'transparent',
    fillStyle: 'solid',
    strokeWidth: 1,
    strokeStyle: 'solid',
    roughness: 1,
    opacity: 100,
    groupIds: [],
    strokeSharpness: 'sharp',
    seed: 802336758,
    version: 77,
    versionNonce: 227885290,
    isDeleted: false,
    boundElements: null,
    updated: 1639729535736,
    text: 'Menu Header',
    fontSize: 24,
    fontFamily: 2,
    textAlign: 'center',
    verticalAlign: 'middle',
    baseline: 118,
  }];
  const newTextElement: any = [{
    id: "frame1",
    type: "rectangle",
    x: 331.83412499999997,
    y: 141.984625,
    width: 200,
    height: 105,
    angle: 0,
    strokeColor: "#000000",
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 1,
    strokeStyle: "solid",
    roughness: 1,
    opacity: 100,
    groupIds: ["itemName"],
    strokeSharpness: "sharp",
    seed: 802336758,
    version: 77,
    versionNonce: 227885290,
    isDeleted: false,
    boundElements: null,
    updated: 1639729535736,
    children:["itemName"]
  }];
  const createMenuItem = (name:any, description:any, price:any, x:any, y:any,index:any,length:any) => {
    const frameId = `frame`;

    const frame = {
      id: frameId,
      type: 'frame',
      x,
      y,
      width: 210,
      height: y+ length*5,
      angle: 0,
      strokeColor: 'transparent',
      backgroundColor: 'transparent',
      fillStyle: 'transparent',
      strokeWidth: 0, 
      strokeStyle: 'transparent',
      roughness: 1,
      opacity: 100,
      groupIds: [],
      strokeSharpness: '',
      seed: 802336758,
      version: 662,
      versionNonce: 227885290,
      isDeleted: false,
      boundElements: null,
      updated: 1639729535736,
      name: " ",
     // children: [`${frameId}_name`, `${frameId}_description`, `${frameId}_price`],
    };

    const itemNameText = createFrameElements(`${frameId}`, name, x+10, y + index*10, 100, 35, 20);
    const descriptionText = createFrameElements(`${frameId}`, description, x+10, y + 20 + index*10, 100, 35, 12);
    const priceText = createFrameElements(`${frameId}`, price, x+100+10, y+ index*10 , 100, 35, 18);

    return [frame, itemNameText, descriptionText, priceText];
  };

  const createFrameElements = (id:any, text:any, x:any, y:any, width:any, height:any, fontSize:any) => ({
    id,
    type: 'text',
    frameId:id,
    x,
    y,
    width,
    height,
    angle: 0,
    strokeColor: '#000000',
    backgroundColor: 'transparent',
    fillStyle: 'solid',
    strokeWidth: 1,
    strokeStyle: 'solid',
    roughness: 1,
    opacity: 100,
    groupIds: [],
    strokeSharpness: 'sharp',
    seed: 802336758,
    version: 77,
    versionNonce: 227885290,
    isDeleted: false,
    boundElements: null,
    updated: 1639729535736,
    text,
    fontSize,
    fontFamily: 2,
    textAlign: 'left',
    verticalAlign: 'middle',
    baseline: 118,
  });

  const createTextElements = (id:any, text:any, x:any, y:any, width:any, height:any, fontSize:any) => ({
    id,
    type: 'text',
    x,
    y,
    width,
    height,
    angle: 0,
    strokeColor: '#000000',
    backgroundColor: 'transparent',
    fillStyle: 'solid',
    strokeWidth: 1,
    strokeStyle: 'solid',
    roughness: 1,
    opacity: 100,
    groupIds: [],
    strokeSharpness: 'sharp',
    seed: 802336758,
    version: 77,
    versionNonce: 227885290,
    isDeleted: false,
    boundElements: null,
    updated: 1639729535736,
    text,
    fontSize,
    fontFamily: 2,
    textAlign: 'left',
    verticalAlign: 'middle',
    baseline: 118,
  });
  const menuItems = [
    createMenuItem('Item 1', 'Description 1', '$10.99', 200, 150,1,2),
    createMenuItem('Item 2', 'Description 2', '$15.99', 200, 200,1,2),
    createMenuItem('Item 3', 'Description 3', '$17.99', 200, 250,1,2),
  ];
console.log("menus",headerText,menuItems[0])
  const currentEle = excalidrawAPI?.getSceneElements();
  // const updated = [...(currentEle || []), ...(newTextElement || [])];
  
  const updatedElements = ([] as any[]).concat(...menuItems);
  const frames = updatedElements.filter(element => element.type === 'frame');

  const filteredElements = frames.length > 1
  ? updatedElements.filter((element, index) => index === 0 || element.type !== 'frame')
  : updatedElements;
  console.log("updatedElements",menuItems,updatedElements,currentEle,filteredElements)
  const sceneData = {
    elements: restoreElements(filteredElements as any, null),
  };
  excalidrawAPI?.updateScene(sceneData as any);
    // const newBackgroundElement: any = [
    //   {
    //     fileId: "background",
    //     id: "6-AIA3cpXH6jwqerbF6rp",
    //     type: "image",
    //     x: 237.33333121405704,
    //     y: -37.819445356910634,
    //     width: 349.3333333333333,
    //     height: 262,
    //     angle: 0,
    //     strokeColor: "transparent",
    //     backgroundColor: "transparent",
    //     fillStyle: "hachure",
    //     strokeWidth: 1,
    //     strokeStyle: "solid",
    //     roughness: 1,
    //     opacity: 100,
    //     groupIds: [],
    //     frameId: null,
    //     roundness: null,
    //     seed: 795684509,
    //     version: 4,
    //     versionNonce: 916617149,
    //     isDeleted: false,
    //     boundElements: null,
    //     updated: 1699879238757,
    //     link: null,
    //     locked: false,
    //     // status: "pending",
    //     // fileId: "793a93d9ebb97ed53759a2678c4c936b5202dc64",
    //     scale: [1, 1],
    //   },
    // ];

 // const sceneData = {
    //   elements: [...(currentEle || []), ...(newTextElement || [])],
    // };

    // const res = await fetch("/rocket.jpeg");
    // const imageData = await res.blob();
    // const reader = new FileReader();
    // reader.readAsDataURL(imageData);

    // reader.onload = function () {
    //   const imagesArray: BinaryFileData[] = [
    //     {
    //       id: "background" as BinaryFileData["id"],
    //       dataURL: reader.result as BinaryFileData["dataURL"],
    //       mimeType: MIME_TYPES.jpg,
    //       created: 1644915140367,
    //       lastRetrieved: 1644915140367,
    //     },
    //   ];

    //   excalidrawAPI?.addFiles(imagesArray);
    // };
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
  const handleImageDragStart = (
    event: React.DragEvent<HTMLImageElement>,
    type: string
  ) => {
    const imageSrc = event.currentTarget.src;
    if (type == "bg") handlebackgroundImageDivDrop(imageSrc);
    else if (type == "imgdrop") {
      handleRightSideDivDrop(imageSrc);
    }
  };
  const handleRightSideDivDrop = async (imageSrc: any) => {
    const canvas = document.querySelector(
      ".excalidraw__canvas"
    ) as HTMLCanvasElement;
    const width = canvas?.width;
    const height = canvas?.height;
    const id: string = nanoid();
    const newTextElement: any = [
      {
        fileId: id,
        id: "6-AIA3cpXH6jwqerbF6rp",
        type: "image",
        x: 300.33333121405704,
        y: 90.819445356910634,
        width: 100,
        height: 100,
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
        locked: false,zIndex: 999999,
        // status: "pending",
        // fileId: "793a93d9ebb97ed53759a2678c4c936b5202dc64",
        scale: [1, 1],
      },
    ];
    const currentEle = excalidrawAPI?.getSceneElements();
    console.log("currentele", currentEle);
    const filteredCurrentEle = currentEle?.filter(
      (element: any) => element?.fileId !== newTextElement[0]?.fileId
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
          id: id as BinaryFileData["id"],
          dataURL: reader.result as BinaryFileData["dataURL"],
          mimeType: MIME_TYPES.jpg,
          created: 1644915140367,
          lastRetrieved: 1644915140367,
        },
      ];

      excalidrawAPI?.addFiles(imagesArray);
    };
  };

  const handlebackgroundImageDivDrop = async (imageSrc: any) => {
    const canvas = document.querySelector(
      ".excalidraw__canvas"
    ) as HTMLCanvasElement;
    const width = canvas?.width;
    const height = canvas?.height;
    const newTextElement: any = [
      {
        fileId: "background",
        id: "6-AIA3cpXH6jwqerbF6rp",
        type: "image",
        x: 0.33333121405704,
        y: 0.819445356910634,
        width: width / 1.8,
        height: height / 1.8,
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
        zIndex: 1,
      },
    ];
    const currentEle = excalidrawAPI?.getSceneElements();
    console.log("currentele", currentEle);
    const filteredCurrentEle = currentEle?.filter(
      (element: any) => element?.fileId !== newTextElement[0]?.fileId
    );

    const updated = [...(newTextElement || []), ...(filteredCurrentEle || [])];
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
          id: "background" as BinaryFileData["id"],
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
       <h1>HTML canvas</h1>
      <div className="navbar">
        <div className="dropdown">
          <button className="dropbtn">Select Background</button>
          <div className="dropdown-content">
            <span>Select Background color </span>
            <div style={{ display: "flex", columnGap: "12px" }}>
              <div
                className="color-option"
                style={{ backgroundColor: "#ff0000" }}
                onClick={() => handleColorChange("#ff0000")}
              ></div>
              <div
                className="color-option"
                style={{ backgroundColor: "#00ff00" }}
                onClick={() => handleColorChange("#00ff00")}
              ></div>
              <div
                className="color-option"
                style={{ backgroundColor: "#0000ff" }}
                onClick={() => handleColorChange("#0000ff")}
              ></div>
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => handleColorChange(e.target.value)}
              />
            </div>
            <span> Select Background Image</span>
            <div>
              <img
                src="messi.png"
                onClick={(event) => {
                  event.preventDefault();
                  handleImageDragStart(event as any, "bg");
                }}
                alt="Image 1"
              />
              <img
                src="pika.jpeg"
                onClick={(event) => {
                  event.preventDefault();
                  handleImageDragStart(event as any, "bg");
                }}
                alt="Image 2"
              />
              <img
                src="rocket.jpeg"
                onClick={(event) => {
                  event.preventDefault();
                  handleImageDragStart(event as any, "bg");
                }}
                alt="Image 3"
              />
            </div>
          </div>
        </div>
      </div>

      <ExampleSidebar>
        <div className="button-wrapper">
          {/* <button className="update-scene" onClick={updateScene}>
            Update Canvas
          </button> */}
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
              <h4>Advance setting</h4>
            </div>
            <select value={contentType} onChange={handleContentTypeChange}>
        <option value="image">Images</option>
        <option value="rowStyle">rowStyle</option>
      </select>

      <div
        className="image-list"
        onDrop={handleRightSideDivDrop}
        onDragOver={(event) => event.preventDefault()}
      >{contentType}
        {/* Display list based on selected content type */}
        {contentType === 'image' && (
          <>
            <img
              src="doremon.png"
              onDragStart={(e) => handleImageDragStart(e as any, 'imgdrop')}
              alt="Image 1"
            />
            <img
              src="pika.jpeg"
              onDragStart={(e) => handleImageDragStart(e as any, 'imgdrop')}
              alt="Image 2"
            />
            <img
              src="messi.png"
              onDragStart={(e) => handleImageDragStart(e as any, 'imgdrop')}
              alt="Image 3"
            />
            <img
              src="rocket.jpeg"
              onDragStart={(e) => handleImageDragStart(e as any, 'imgdrop')}
              alt="Image 3"
            />
          </>
        )}

        {contentType === 'rowStyle' && (
          <>
            {/* Add your SVG components here */}
            <svg width="100" height="100">
              <circle cx="50" cy="50" r="40" stroke="black" strokeWidth="3" fill="red" />
            </svg>
            {/* Add more SVG components as needed */}
          </>
        )}
 </div>
          </div>
        </div>
        <button style={{ background: "/rocket.jpeg" }} onClick={addTextElement}>
          Add Text Element
        </button>
      </ExampleSidebar>
    </div>
  );
}
