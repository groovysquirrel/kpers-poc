import { useState, useEffect } from "react";
import { Auth } from "aws-amplify";
import { onError } from "./lib/errorLib";
import { useNavigate } from "react-router-dom";
import AppShell from "./app/AppShell";
import { AppContext, AppContextType } from "./lib/contextLib";
import Routes from "./Routes.tsx";
import "./App.css";

function App() {
  const nav = useNavigate();

  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isAuthenticated, userHasAuthenticated] = useState(false);

  useEffect(() => {
    onLoad();
  }, []);

  async function onLoad() {
    try {
      await Auth.currentSession();
      userHasAuthenticated(true);
    } catch (error) {
      if (error !== "No current user") {
        onError(error);
      }
    }

    setIsAuthenticating(false);
  }

  async function handleLogout() {
    await Auth.signOut();

    userHasAuthenticated(false);

    nav("/login");
  }

  return (
    !isAuthenticating && (
      <AppShell>
        <AppContext.Provider
          value={{ isAuthenticated, userHasAuthenticated } as AppContextType}
        >
          <Routes />
        </AppContext.Provider>
      </AppShell>
    )
  );
}

export default App;
