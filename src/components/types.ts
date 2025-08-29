// Google Picker APIの型定義
declare global {
  interface Window {
    gapi: {
      load: (api: string, callback: () => void) => void;
      client: {
        init: (config: object) => Promise<void>;
        request: (args: object) => Promise<unknown>;
        [key: string]: unknown;
      };
    };
    google: {
      picker: {
        PickerBuilder: new () => GooglePickerBuilder;
        Action: {
          PICKED: string;
          CANCEL: string;
          LOADED: string;
        };
        ViewId: {
          DOCS: string;
          FOLDERS: string;
          DOCS_IMAGES: string;
        };
        DocsView: new () => GoogleDocsView;
        Response: {
          ACTION: string;
          DOCUMENTS: string;
          PARENTS: string;
        };
        Feature: GooglePickerFeature;
      };
    };
  }
}

// Google Picker関連の型定義
export interface GooglePickerBuilder {
  addView(view: GoogleDocsView): GooglePickerBuilder;
  setOAuthToken(token: string): GooglePickerBuilder;
  setDeveloperKey(key: string | undefined): GooglePickerBuilder;
  setCallback(callback: (data: GooglePickerResponse) => void): GooglePickerBuilder;
  setTitle(title: string): GooglePickerBuilder;
  setSize(width: number, height: number): GooglePickerBuilder;
  setOrigin(origin: string): GooglePickerBuilder;
  enableFeature(feature: string, enabled: boolean): GooglePickerBuilder;
  build(): GooglePicker;
}

// Google Pickerの機能定義
export interface GooglePickerFeature {
  NAV_HIDDEN: string;
  MINE_ONLY: string;
  MULTISELECT_ENABLED: string;
}

export interface GoogleDocsView {
  setIncludeFolders(include: boolean): GoogleDocsView;
  setSelectFolderEnabled(enabled: boolean): GoogleDocsView;
  setMimeTypes(mimeTypes: string): GoogleDocsView;
}

export interface GooglePicker {
  setVisible(visible: boolean): void;
}

export interface GooglePickerResponse {
  action: string;
  docs?: {
    id: string;
    name: string;
    mimeType: string;
    [key: string]: unknown;
  }[];
  [key: string]: unknown;
}