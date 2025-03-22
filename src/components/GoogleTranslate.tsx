import { useEffect } from "react";

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

const GoogleTranslate = () => {
  useEffect(() => {
    const addScript = () => {
      const script = document.createElement("script");
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    };

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,hi,pa,gu,bn,mr,te,ta,kn,ml,or,as",
          layout: window.google.translate.TranslateElement.FloatPosition.TOP_LEFT,
          multilanguagePage: true,
          autoDisplay: false,
        },
        "google_translate_element"
      );

      // Add styles to fix layout issues
      const style = document.createElement("style");
      style.textContent = `
        /* Hide Google Translate elements */
        .goog-te-banner-frame,
        .skiptranslate,
        .goog-te-spinner-pos,
        .goog-te-gadget-icon,
        .VIpgJd-ZVi9od-l4eHX-hSRGPd {
          display: none !important;
        }
        
        /* Remove the top margin and fix body positioning */
        body {
          top: 0 !important;
          position: static !important;
        }
        .goog-te-gadget {
          height: 0 !important;
          overflow: hidden !important;
          position: absolute !important;
        }
        
        /* Fix Google Translate dropdown positioning */
        .goog-te-menu-frame {
          box-shadow: none !important;
          margin-top: 0 !important;
        }
        
        /* Additional fixes for mobile */
        @media screen and (max-width: 768px) {
          .goog-te-menu-frame {
            max-width: 100% !important;
          }
        }

        /* Fix any white space issues */
        #goog-gt-tt, 
        .goog-te-balloon-frame {
          display: none !important;
        }
        
        .goog-text-highlight {
          background: none !important;
          box-shadow: none !important;
        }

        /* Hide the top bar completely */
        .goog-te-banner-frame.skiptranslate {
          display: none !important;
        }

        /* Show the select but keep it offscreen */
        .goog-te-combo {
          position: absolute !important;
          top: -9999px !important;
          left: -9999px !important;
        }
      `;
      document.head.appendChild(style);

      // Force remove any added margins
      const removeTopMargin = () => {
        document.body.style.top = '0px';
        document.body.style.position = 'static';
      };

      // Apply immediately and after a short delay to ensure it takes effect
      removeTopMargin();
      setTimeout(removeTopMargin, 500);
    };

    addScript();

    return () => {
      // Cleanup
      const script = document.querySelector('script[src*="translate.google.com"]');
      if (script) script.remove();
      const styles = document.querySelectorAll('style');
      styles.forEach(style => {
        if (style.textContent?.includes('goog-te')) {
          style.remove();
        }
      });
      delete window.googleTranslateElementInit;
      // Reset body styles
      document.body.style.removeProperty('top');
      document.body.style.removeProperty('position');
    };
  }, []);

  return <div id="google_translate_element" />;
};

export default GoogleTranslate;