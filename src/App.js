import React, { useEffect, useState } from "react";
import { gapi } from "gapi-script";
import { GoogleLogin } from "react-google-login";

const SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

const App = () => {
  const [sheetData, setSheetData] = useState([]);
  const [userEmail, setUserEmail] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const loadGoogleAPI = () => {
      const script = document.createElement("script");
      script.src = "https://apis.google.com/js/api.js";
      script.onload = initializeGoogleAPI;
      document.head.appendChild(script);
    };

    const initializeGoogleAPI = () => {
      window.gapi.load("client:auth2", initClient);
    };

    const initClient = () => {
      window.gapi.client
        .init({
          apiKey: "AIzaSyAz1z7QqYvovxmnO-lvzoORcMC1UZzXNRE",
          clientId:
            "183989250797-3891nl9n8vj69r8ju7lmh3s5n307ma04.apps.googleusercontent.com",
          scope: SCOPES,
          discoveryDocs: [
            "https://sheets.googleapis.com/$discovery/rest?version=v4",
          ],
        })
        .then(() => {
          console.log("Google API client initialized");
          const authInstance = window.gapi.auth2.getAuthInstance();
          setIsSignedIn(authInstance.isSignedIn.get());
          authInstance.isSignedIn.listen(updateSignInStatus);

          getUserEmail();
        })
        .catch((error) => {
          console.error("Error initializing Google API client", error);
        });
    };

    const updateSignInStatus = (isUserSignedIn) => {
      setIsSignedIn(isUserSignedIn);
      if (isUserSignedIn) {
        getUserEmail();
      } else {
        setUserEmail("");
      }
    };

    const executeRequest = () => {
      if (isSignedIn) return; // Don't execute if user is not signed in
      window.gapi.client.sheets.spreadsheets.values
        .get({
          spreadsheetId: "1uQOpLEqx6WpzCUNcQwtuwxJ1kIHHUmNiTcsBtCXkKeE",
          range: "Quiz_Result",
        })
        .then((response) => {
          setSheetData(response.result.values || []);
        })
        .catch((error) => {
          console.error("Error executing request", error);
        });
    };

    const getUserEmail = () => {
      const authInstance = window.gapi.auth2.getAuthInstance();
      if (authInstance.isSignedIn.get()) {
        const currentUser = authInstance.currentUser.get();
        const basicProfile = currentUser.getBasicProfile();
        const email = basicProfile.getEmail();

        setUserEmail(email);
        executeRequest();
      }
    };

    loadGoogleAPI();
  }, []);

  const handleSignIn = () => {
    const authInstance = window.gapi.auth2.getAuthInstance();
    authInstance.signIn();
  };

  const handleSignOut = () => {
    const authInstance = window.gapi.auth2.getAuthInstance();
    authInstance.signOut();
  };

  return (
    <div>
      {console.log(sheetData)}
      <h2>Google Sheet API Example</h2>
      <p>
        {isSignedIn ? (
          <span>
            Logged in as: {userEmail} |{" "}
            <button onClick={handleSignOut}>Sign Out</button>
          </span>
        ) : (
          <button onClick={handleSignIn}>Sign In with Google</button>
        )}
      </p>
      {isSignedIn && (
        <ul>
          {sheetData.map((row, index) => (
            <li key={index}>{row.join(" | ")}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default App;
