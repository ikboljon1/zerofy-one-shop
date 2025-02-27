
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { ThemeProvider } from "./hooks/use-theme";
import { Toaster } from "@/components/ui/toaster";
import { StoreProvider } from "@/store";

const App = () => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <StoreProvider>
        <Routes>
          <Route path="/" element={<Index />} />
        </Routes>
        <Toaster />
      </StoreProvider>
    </ThemeProvider>
  );
};

export default App;
