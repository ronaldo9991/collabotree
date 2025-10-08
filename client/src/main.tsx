import { createRoot } from "react-dom/client";
import App from "./App";

// Try to load CSS, but don't let it break the app
try {
  import("./index.css");
} catch (error) {
  console.warn('CSS could not be loaded:', error);
}

// Add error boundary
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found!");
}

try {
  const root = createRoot(rootElement);
  root.render(<App />);
} catch (error) {
  console.error("React app failed to render:", error);
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif; text-align: center;">
      <h1>App Loading Error</h1>
      <p>Error: ${error}</p>
      <p>Please check the console for more details.</p>
    </div>
  `;
}