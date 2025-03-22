interface GoogleTranslateElement {
  new (options: {
    pageLanguage?: string;
    includedLanguages?: string;
    layout?: google.translate.TranslateElementLayout;
    autoDisplay?: boolean;
    multilanguagePage?: boolean;
  }, element: string): void;
}

interface GoogleTranslateElementInit {
  new(): void;
  getInstance(): any;
  translate: {
    TranslateElement: GoogleTranslateElement;
    TranslateElementLayout: {
      SIMPLE: number;
      TOP_LEFT: number;
      TOP_RIGHT: number;
    };
  };
}

declare global {
  interface Window {
    google: {
      translate: {
        TranslateElement: GoogleTranslateElement;
        TranslateElementLayout: {
          SIMPLE: number;
          TOP_LEFT: number;
          TOP_RIGHT: number;
        };
      };
    };
    googleTranslateElementInit: () => void;
  }
} 