import { useState, useEffect } from "react";
import { Auth } from "aws-amplify";
import { onError } from "./lib/errorLib";
import { useNavigate } from "react-router-dom";
import AppShell from "./app/AppShell";
import { AppContext, AppContextType, UserInfo } from "./lib/contextLib";
import Routes from "./Routes.tsx";
import "./App.css";

function App() {
  const nav = useNavigate();

  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isAuthenticated, userHasAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>(undefined);

  useEffect(() => {
    onLoad();
  }, []);

  // Fetch user info whenever authentication status changes
  useEffect(() => {
    if (isAuthenticated) {
      loadUserInfo();
    }
  }, [isAuthenticated]);

  async function loadUserInfo() {
    try {
      const user = await Auth.currentAuthenticatedUser();
      
      // Extract user information from Cognito
      setUserInfo({
        email: user.attributes?.email || "user@kpers.gov",
        firstName: user.attributes?.given_name || "John",
        lastName: user.attributes?.family_name || "Doe",
        role: user.attributes?.["custom:role"] || "Editor"
      });
    } catch (error) {
      if (error !== "No current user") {
        onError(error);
      }
      // Set mock user info for development
      setUserInfo({
        email: "demo.user@kpers.gov",
        firstName: "Demo",
        lastName: "User",
        role: "Editor"
      });
    }
  }

  async function onLoad() {
    try {
      await Auth.currentSession();
      userHasAuthenticated(true);
      // User info will be loaded by the useEffect hook
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
    setUserInfo(undefined);

    nav("/login");
  }

  return (
    !isAuthenticating && (
      <AppContext.Provider
        value={{ 
          isAuthenticated, 
          userHasAuthenticated, 
          userInfo,
          handleLogout 
        } as AppContextType}
      >
        <AppShell>
          <Routes />
        </AppShell>
      </AppContext.Provider>
    )
  );
}

export default App;
