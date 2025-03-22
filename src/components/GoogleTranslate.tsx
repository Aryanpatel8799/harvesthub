import { useEffect, useRef } from "react";

const GoogleTranslate = () => {
  const scriptLoaded = useRef(false);

  useEffect(() => {
    // Only load the script once
    if (scriptLoaded.current) return;
    
    // Add Google Translate script to the page
    const addScript = () => {
      const script = document.createElement("script");
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
      scriptLoaded.current = true;
    };

    // Define the initialization function on the window object
    // @ts-ignore - Adding to window
    window.googleTranslateElementInit = function() {
      // @ts-ignore - Google translate object will exist after script loads
      new google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,hi,pa,gu,bn,mr,te,ta,kn,ml,or,as",
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };
    

    addScript();

    // Cleanup function
    return () => {
      const script = document.querySelector(
        'script[src*="translate.google.com"]'
      );
      if (script) {
        document.body.removeChild(script);
      }
      // @ts-ignore - Remove from window
      if (window.googleTranslateElementInit) {
        // @ts-ignore - Delete from window
        delete window.googleTranslateElementInit;
      }
    };
  }, []);

  return (
    <div 
      id="google_translate_element" 
      className="translate-container" 
      style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}
    ></div>
  );
};

export default GoogleTranslate;