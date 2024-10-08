import { AppUiProvider } from "@canva/app-ui-kit";
import { createRoot } from "react-dom/client";
import { App } from "./app";
import "@canva/app-ui-kit/styles.css";
import { AuthProvider } from "./components/useContext";
const root = createRoot(document.getElementById("root")!);
function render() {
  root.render(
    <AppUiProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </AppUiProvider>
  );
}

render();

if (module.hot) {
  module.hot.accept("./app", render);
}
