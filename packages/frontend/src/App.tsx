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

  async function onLoad() {
    try {
      const session = await Auth.currentSession();
      const user = await Auth.currentAuthenticatedUser();
      userHasAuthenticated(true);
      
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
      if (!isAuthenticated) {
        setUserInfo({
          email: "demo.user@kpers.gov",
          firstName: "Demo",
          lastName: "User",
          role: "Editor"
        });
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
