import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { AppRouter } from "@/router/AppRouter";
import { useAuthStore } from "@/features/auth/store/auth.store";

function App() {
  const loadUser = useAuthStore((state) => state.loadUser);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;