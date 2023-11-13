import React from "react";
import { AppClassProperties, AppState, Device, ExcalidrawProps, UIAppState } from "../types";
import { ActionManager } from "../actions/manager";
import { NonDeletedExcalidrawElement } from "../element/types";
type MobileMenuProps = {
    appState: UIAppState;
    actionManager: ActionManager;
    renderJSONExportDialog: () => React.ReactNode;
    renderImageExportDialog: () => React.ReactNode;
    setAppState: React.Component<any, AppState>["setState"];
    elements: readonly NonDeletedExcalidrawElement[];
    onLockToggle: () => void;
    onHandToolToggle: () => void;
    onPenModeToggle: () => void;
    interactiveCanvas: HTMLCanvasElement | null;
    onImageAction: (data: {
        insertOnCanvasDirectly: boolean;
    }) => void;
    renderTopRightUI?: (isMobile: boolean, appState: UIAppState) => JSX.Element | null;
    renderCustomStats?: ExcalidrawProps["renderCustomStats"];
    renderSidebars: () => JSX.Element | null;
    device: Device;
    renderWelcomeScreen: boolean;
    app: AppClassProperties;
};
export declare const MobileMenu: ({ appState, elements, actionManager, setAppState, onLockToggle, onHandToolToggle, onPenModeToggle, interactiveCanvas, onImageAction, renderTopRightUI, renderCustomStats, renderSidebars, device, renderWelcomeScreen, app, }: MobileMenuProps) => JSX.Element;
export {};
