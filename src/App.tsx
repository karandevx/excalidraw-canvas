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
// This is so that we use the bundled excalidraw.development.js file instead
// of the actual source code

const COMMENT_ICON_DIMENSION = 32;
const COMMENT_INPUT_HEIGHT = 50;
const COMMENT_INPUT_WIDTH = 150;

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
  const [comment, setComment] = useState<Comment | null>(null);

  const initialStatePromiseRef = useRef<{
    promise: ResolvablePromise<ExcalidrawInitialDataState | null>;
  }>({ promise: null! });
  if (!initialStatePromiseRef.current.promise) {
    initialStatePromiseRef.current.promise = resolvablePromise();
  }

  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);

  useHandleLibrary({ excalidrawAPI });

  const fetchData = async (imagesrc:any) => {
    console.log("imagesrc f",imagesrc)
    const res = await fetch(imagesrc.length>0 ?imagesrc:"/rocket.jpeg");
    console.log("fetch",res)
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
      console.log("initialStatePromiseRef",initialStatePromiseRef)
      excalidrawAPI?.addFiles(imagesArray);
    };
  };
  useEffect(() => {
    if (!excalidrawAPI) {
      return;
    }

    fetchData("");
   
  }, [excalidrawAPI]);

  const renderTopRightUI = (isMobile: boolean) => {
    return (
      <>
        {!isMobile && (
          <LiveCollaborationTrigger
            isCollaborating={isCollaborating}
            onSelect={() => {
              window.alert("Collab dialog clicked");
            }}
          />
        )}
        <button
          onClick={() => alert("This is dummy top right UI")}
          style={{ height: "2.5rem" }}
        >
          {" "}
          Click me{" "}
        </button>
      </>
    );
  };

  const updateScene = () => {
    // const sceneData = {
    //   // elements: restoreElements([], null),
    //   appState: {
    //       viewBackgroundColor: "./rocket.jpeg"
    //   },
    // };
    const backgroundImageElement = [{
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
    }];
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
        // ...
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
  const [textElement, setTextElement] = useState<Comment | null>(null);

  // ... (existing code)

  const addTextElement = () => {
   console.log("called")
      const newTextElement: any =   [ {
        id: "MB9CSH621UdIKH8MEgOhaM",
        type: "text",
        x: 331.83412499999997,
        y: -441.984625,
        width: 153,
        height: 165,
        angle: 0,
        strokeColor: "#000000",
        backgroundColor: "#e64980",
        fillStyle: "solid",
        strokeWidth: 1,
        strokeStyle: "solid",
        roughness: 1,
        opacity: 100,
        groupIds: [],
        strokeSharpness: "sharp",
        seed: 802336758,
        version: 77,
        versionNonce: 227885290,
        isDeleted: false,
        boundElements: null,
        updated: 1639729535736,
        text: "Hellllllo \nWorld!!!\n\nSticky \nnotes :)",
        fontSize: 20,
        fontFamily: 1,
        textAlign: "center",
        verticalAlign: "middle",
        baseline: 118,
        containerId: "6sVDp9mCGQTomD9nCg5w1b",
        originalText: "Helllllo World!!!\n\nSticky notes :)",
        customData: {
          id: "text-1",
          version: "1"
        }
      }]
      const sceneData = {
        elements: restoreElements(newTextElement,null),
      };
      console.log("sceneData",sceneData)
  
      excalidrawAPI?.updateScene(sceneData as any);
    
  };
  const [pointerData, setPointerData] = useState<{
    pointer: { x: number; y: number };
    button: "down" | "up";
    pointersMap: Gesture["pointers"];
  } | null>(null);

  const onPointerDown = (
    activeTool: AppState["activeTool"],
    pointerDownState: ExcalidrawPointerDownState
  ) => {
    if (activeTool.type === "custom" && activeTool.customType === "comment") {
      const { x, y } = pointerDownState.origin;
      setComment({ x, y, value: "" });
    }
  };

  const rerenderCommentIcons = () => {
    if (!excalidrawAPI) {
      return false;
    }
    const commentIconsElements = appRef.current.querySelectorAll(
      ".comment-icon"
    ) as HTMLElement[];
    commentIconsElements.forEach((ele) => {
      const id = ele.id;
      const appstate = excalidrawAPI.getAppState();
      const { x, y } = sceneCoordsToViewportCoords(
        { sceneX: commentIcons[id].x, sceneY: commentIcons[id].y },
        appstate
      );
      ele.style.left = `${
        x - COMMENT_ICON_DIMENSION / 2 - appstate!.offsetLeft
      }px`;
      ele.style.top = `${
        y - COMMENT_ICON_DIMENSION / 2 - appstate!.offsetTop
      }px`;
    });
  };

  const onPointerMoveFromPointerDownHandler = (
    pointerDownState: PointerDownState
  ) => {
    return withBatchedUpdatesThrottled((event) => {
      if (!excalidrawAPI) {
        return false;
      }
      const { x, y } = viewportCoordsToSceneCoords(
        {
          clientX: event.clientX - pointerDownState.hitElementOffsets.x,
          clientY: event.clientY - pointerDownState.hitElementOffsets.y,
        },
        excalidrawAPI.getAppState()
      );
      setCommentIcons({
        ...commentIcons,
        [pointerDownState.hitElement.id!]: {
          ...commentIcons[pointerDownState.hitElement.id!],
          x,
          y,
        },
      });
    });
  };
  const onPointerUpFromPointerDownHandler = (
    pointerDownState: PointerDownState
  ) => {
    return withBatchedUpdates((event) => {
      window.removeEventListener("pointermove", pointerDownState.onMove);
      window.removeEventListener("pointerup", pointerDownState.onUp);
      excalidrawAPI?.setActiveTool({ type: "selection" });
      const distance = distance2d(
        pointerDownState.x,
        pointerDownState.y,
        event.clientX,
        event.clientY
      );
      if (distance === 0) {
        if (!comment) {
          setComment({
            x: pointerDownState.hitElement.x + 60,
            y: pointerDownState.hitElement.y,
            value: pointerDownState.hitElement.value,
            id: pointerDownState.hitElement.id,
          });
        } else {
          setComment(null);
        }
      }
    });
  };
  const saveComment = () => {
    if (!comment) {
      return;
    }
    if (!comment.id && !comment.value) {
      setComment(null);
      return;
    }
    const id = comment.id || nanoid();
    setCommentIcons({
      ...commentIcons,
      [id]: {
        x: comment.id ? comment.x - 60 : comment.x,
        y: comment.y,
        id,
        value: comment.value,
      },
    });
    setComment(null);
  };

  const renderCommentIcons = () => {
    return Object.values(commentIcons).map((commentIcon) => {
      if (!excalidrawAPI) {
        return false;
      }
      const appState = excalidrawAPI.getAppState();
      const { x, y } = sceneCoordsToViewportCoords(
        { sceneX: commentIcon.x, sceneY: commentIcon.y },
        excalidrawAPI.getAppState()
      );
      return (
        <div
          id={commentIcon.id}
          key={commentIcon.id}
          style={{
            top: `${y - COMMENT_ICON_DIMENSION / 2 - appState!.offsetTop}px`,
            left: `${x - COMMENT_ICON_DIMENSION / 2 - appState!.offsetLeft}px`,
            position: "absolute",
            zIndex: 1,
            width: `${COMMENT_ICON_DIMENSION}px`,
            height: `${COMMENT_ICON_DIMENSION}px`,
            cursor: "pointer",
            touchAction: "none",
          }}
          className="comment-icon"
          onPointerDown={(event) => {
            event.preventDefault();
            if (comment) {
              commentIcon.value = comment.value;
              saveComment();
            }
            const pointerDownState: any = {
              x: event.clientX,
              y: event.clientY,
              hitElement: commentIcon,
              hitElementOffsets: { x: event.clientX - x, y: event.clientY - y },
            };
            const onPointerMove =
              onPointerMoveFromPointerDownHandler(pointerDownState);
            const onPointerUp =
              onPointerUpFromPointerDownHandler(pointerDownState);
            window.addEventListener("pointermove", onPointerMove);
            window.addEventListener("pointerup", onPointerUp);

            pointerDownState.onMove = onPointerMove;
            pointerDownState.onUp = onPointerUp;

            excalidrawAPI?.setActiveTool({
              type: "custom",
              customType: "comment",
            });
          }}
        >
          <div className="comment-avatar">
            <img src="doremon.png" alt="doremon" />
          </div>
        </div>
      );
    });
  };

  const renderComment = () => {
    if (!comment) {
      return null;
    }
    const appState = excalidrawAPI?.getAppState()!;
    const { x, y } = sceneCoordsToViewportCoords(
      { sceneX: comment.x, sceneY: comment.y },
      appState
    );
    let top = y - COMMENT_ICON_DIMENSION / 2 - appState.offsetTop;
    let left = x - COMMENT_ICON_DIMENSION / 2 - appState.offsetLeft;

    if (
      top + COMMENT_INPUT_HEIGHT <
      appState.offsetTop + COMMENT_INPUT_HEIGHT
    ) {
      top = COMMENT_ICON_DIMENSION / 2;
    }
    if (top + COMMENT_INPUT_HEIGHT > appState.height) {
      top = appState.height - COMMENT_INPUT_HEIGHT - COMMENT_ICON_DIMENSION / 2;
    }
    if (
      left + COMMENT_INPUT_WIDTH <
      appState.offsetLeft + COMMENT_INPUT_WIDTH
    ) {
      left = COMMENT_ICON_DIMENSION / 2;
    }
    if (left + COMMENT_INPUT_WIDTH > appState.width) {
      left = appState.width - COMMENT_INPUT_WIDTH - COMMENT_ICON_DIMENSION / 2;
    }

    return (
      <textarea
        className="comment"
        style={{
          top: `${top}px`,
          left: `${left}px`,
          position: "absolute",
          zIndex: 1,
          height: `${COMMENT_INPUT_HEIGHT}px`,
          width: `${COMMENT_INPUT_WIDTH}px`,
        }}
        ref={(ref) => {
          setTimeout(() => ref?.focus());
        }}
        placeholder={comment.value ? "Reply" : "Comment"}
        value={comment.value}
        onChange={(event) => {
          setComment({ ...comment, value: event.target.value });
        }}
        onBlur={saveComment}
        onKeyDown={(event) => {
          if (!event.shiftKey && event.key === "Enter") {
            event.preventDefault();
            saveComment();
          }
        }}
      />
    );
  };

  const renderSidebar = () => {
    return (
      <></>
      // <Sidebar>
      //   <Sidebar.Header>Custom header!</Sidebar.Header>
      //   Custom sidebar!
      // </Sidebar>
    );
  };

//   const handleDrop = useCallback(
    
//     async (event: React.DragEvent<HTMLDivElement>) => {
//       event.preventDefault();
//       console.log("func call");
//       const files = event.dataTransfer.files;
//       console.log("func files",files);
//       if (files.length > 0) {
//         const file = files[0];

//         if (file.type.startsWith("image/")) {
//           const reader = new FileReader();
//           reader.readAsDataURL(file);

//           reader.onload = function () {
//             const imagesArray: BinaryFileData[] = [
//               {
//                 id: file.name as any, // Type assertion here
//                 dataURL: reader.result as BinaryFileData["dataURL"],
//                 mimeType: file.type as any,
//                 created: Date.now(),
//                 lastRetrieved: Date.now(),
//               },
//             ];
// console.log("imagesArray",imagesArray)
//             // Add the image to the Excalidraw canvas
//             excalidrawAPI?.addFiles(imagesArray);
//           };
//         }
//       }
//     },
//     [excalidrawAPI,drop]
//   );

//   useEffect(() => {
//     const canvasWrapper = appRef.current.querySelector(".excalidraw-wrapper");
//     console.log("effect");
//     // Listen for drop events on the canvas
//     canvasWrapper.addEventListener("drop", handleDrop);

//     // Prevent default behavior for drag-and-drop to allow dropping files
//     canvasWrapper.addEventListener("dragover", (event: any) => {
//       event.preventDefault();
//     });

//     // Cleanup event listeners on component unmount
//     return () => {
//       canvasWrapper.removeEventListener("drop", handleDrop);
//       canvasWrapper.removeEventListener("dragover", (event: any) => {
//         event.preventDefault();
//       });
//     };
//   }, [handleDrop]);
  const handleImageDragStart = (event: React.DragEvent<HTMLImageElement>) => {
    // Customize the drag data to include necessary information
    const imageSrc = event.currentTarget.src;
    console.log("imageSrc",imageSrc);
    event.dataTransfer.setData("text/plain", imageSrc);
    fetchData(imageSrc);
    setDrop(true)
  };
  const handleRightSideDivDrop = async (imageSrc:any) => {
   // event.preventDefault();
    //const imageSrc = event.dataTransfer.getData("text/plain");
    
    const response = await fetch(imageSrc);
  const blob = await response.blob();

    console.log("imageSrcc drag",blob);
    const reader = new FileReader();
          reader.readAsDataURL(blob);

          reader.onload = function () {
            const imagesArray: BinaryFileData[] = [
              {
                id: `image_${Date.now()}` as any,
                dataURL: reader.result as BinaryFileData["dataURL"],
                mimeType: "image/png",
                created: Date.now(),
                lastRetrieved: Date.now(),
              },
            ];
            console.log("imagesArraydrag",imagesArray)
            console.log("Elements before adding file:", excalidrawAPI?.getSceneElements());

            excalidrawAPI?.addFiles(imagesArray);
            console.log("Elements after adding file:", excalidrawAPI?.getSceneElements());

            //setDrop(false)
          }

  };
  // ... (rest of the existing code)

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
          <button onClick={onCopy.bind(null, "svg")}>
            Copy to Clipboard as SVG
          </button>
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
        <div className="parentDiv">
          <div
            className="excalidraw-wrapper"
            onDrop={(event) => {
             // handleDrop(event);

              console.log("droppp");
            }}
            onDragOver={(event) => event.preventDefault()}
          >
            <div
              style={{
                position: "absolute",
                left: "50%",
                bottom: "20px",
                display: "flex",
                zIndex: 9999999999999999,
                padding: "5px 10px",
                transform: "translateX(-50%)",
                background: "rgba(255, 255, 255, 0.8)",
                gap: "1rem",
              }}
            ></div>
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
              // renderTopRightUI={renderTopRightUI}
              onLinkOpen={onLinkOpen}
              onPointerDown={onPointerDown}
              onScrollChange={rerenderCommentIcons}
              // renderSidebar={renderSidebar}
            >
              {/* {excalidrawAPI && (
              <Footer>
                <CustomFooter excalidrawAPI={excalidrawAPI} />
              </Footer>
            )}
            {renderMenu()} */}
              <img
          src="messi.png"
          alt="background"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none", // Make sure the image doesn't interfere with interactions
          }}
        />
            </Excalidraw>
            <img
          src="messi.png"
          alt="background"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none", // Make sure the image doesn't interfere with interactions
          }}
        />

            {Object.keys(commentIcons || []).length > 0 && renderCommentIcons()}
            {comment && renderComment()}
          </div>
          <div    onDrop={handleRightSideDivDrop} onDragOver={(event) => event.preventDefault()}>
            {" "}
            <img onDragStart={handleImageDragStart}
              src="messi.png"
              alt="messi"
              style={{
                height: "200px",
                width: "240px",
              }}
            />
          </div>
        </div>
        <button style={{background:"/rocket.jpeg"}} onClick={addTextElement}>Add Text Element</button>
        {/* <div className="export-wrapper button-wrapper">
          <label className="export-wrapper__checkbox">
            <input
              type="checkbox"
              checked={exportWithDarkMode}
              onChange={() => setExportWithDarkMode(!exportWithDarkMode)}
            />
            Export with dark mode
          </label>
          <label className="export-wrapper__checkbox">
            <input
              type="checkbox"
              checked={exportEmbedScene}
              onChange={() => setExportEmbedScene(!exportEmbedScene)}
            />
            Export with embed scene
          </label>
          <button
            onClick={async () => {
              if (!excalidrawAPI) {
                return;
              }
              const svg = await exportToSvg({
                elements: excalidrawAPI?.getSceneElements(),
                appState: {
                  ...initialData.appState,
                  exportWithDarkMode,
                  exportEmbedScene,
                  width: 300,
                  height: 100
                },
                files: excalidrawAPI?.getFiles()
              });
              appRef.current.querySelector(".export-svg").innerHTML =
                svg.outerHTML;
            }}
          >
            Export to SVG
          </button>
          <div className="export export-svg"></div>

          <button
            onClick={async () => {
              if (!excalidrawAPI) {
                return;
              }
              const blob = await exportToBlob({
                elements: excalidrawAPI?.getSceneElements(),
                mimeType: "image/png",
                appState: {
                  ...initialData.appState,
                  exportEmbedScene,
                  exportWithDarkMode
                },
                files: excalidrawAPI?.getFiles()
              });
              setBlobUrl(window.URL.createObjectURL(blob));
            }}
          >
            Export to Blob
          </button>
          <div className="export export-blob">
            <img src={blobUrl} alt="" />
          </div>

          <button
            onClick={async () => {
              if (!excalidrawAPI) {
                return;
              }
              const canvas = await exportToCanvas({
                elements: excalidrawAPI.getSceneElements(),
                appState: {
                  ...initialData.appState,
                  exportWithDarkMode
                },
                files: excalidrawAPI.getFiles()
              });
              const ctx = canvas.getContext("2d")!;
              ctx.font = "30px Virgil";
              ctx.strokeText("My custom text", 50, 60);
              setCanvasUrl(canvas.toDataURL());
            }}
          >
            Export to Canvas
          </button>
          <div className="export export-canvas">
            <img src={canvasUrl} alt="" />
          </div>
        </div> */}
      </ExampleSidebar>
    </div>
  );
}
