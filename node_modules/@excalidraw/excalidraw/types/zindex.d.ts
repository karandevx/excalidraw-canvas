import { ExcalidrawElement } from "./element/types";
import { AppState } from "./types";
export declare const moveOneLeft: (elements: readonly ExcalidrawElement[], appState: AppState, elementsToBeMoved?: readonly ExcalidrawElement[]) => ExcalidrawElement[];
export declare const moveOneRight: (elements: readonly ExcalidrawElement[], appState: AppState, elementsToBeMoved?: readonly ExcalidrawElement[]) => ExcalidrawElement[];
export declare const moveAllLeft: (elements: readonly ExcalidrawElement[], appState: AppState, elementsToBeMoved?: readonly ExcalidrawElement[]) => ExcalidrawElement[];
export declare const moveAllRight: (elements: readonly ExcalidrawElement[], appState: AppState, elementsToBeMoved?: readonly ExcalidrawElement[]) => ExcalidrawElement[];
