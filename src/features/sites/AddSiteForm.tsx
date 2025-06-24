import React, { useState, useEffect, type JSX } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  createSite,
  // Corrected: Using the unified status selectors from the slice
  selectSiteOperationStatus,
  selectSiteOperationError,
  // Corrected: Using the unified reset action
  resetOperationStatus,
} from "./sitesSlice";
import type { NewSiteData } from "./sitesSlice";

function AddSiteForm(): JSX.Element {
  const dispatch = useAppDispatch();

  // --- Component State ---
  const [name, setName] = useState<string>("");
  const [location, setLocation] = useState<string>("");

  // --- Redux State ---
  // Corrected: Selecting the unified status and error from the Redux store
  const operationStatus = useAppSelector(selectSiteOperationStatus);
  const operationError = useAppSelector(selectSiteOperationError);

  // --- Derived State & Event Handlers ---
  const canSave = name.trim() !== "";

  // Effect to reset the operation status when the component unmounts
  // This prevents showing stale "Success" or "Error" messages if the user navigates away and back
  useEffect(() => {
    return () => {
      dispatch(resetOperationStatus());
    };
  }, [dispatch]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSave) {
      try {
        // The data to be sent, conforming to the NewSiteData interface
        const newSite: NewSiteData = { name, location };

        await dispatch(createSite(newSite)).unwrap();

        // --- Success Case ---
        // Clear the form fields after a successful submission
        setName("");
        setLocation("");
        // Note: We don't need to dispatch reset here because the success message
        // is useful. The useEffect cleanup will handle resetting when leaving the page.
      } catch (err: any) {
        // --- Error Case ---
        // The .unwrap() utility re-throws the error from the rejected thunk
        console.error("Failed to save the site: ", err);
        // The UI will display the `operationError` from the Redux state
      }
    }
  };

  // --- Render Logic ---
  return (
    <div>
      <h3>Add New Site</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="siteName">Site Name:</label>
          <input
            type="text"
            id="siteName"
            name="siteName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required // Use browser-based validation for the required field
          />
        </div>
        <div>
          <label htmlFor="siteLocation">Location:</label>
          <input
            type="text"
            id="siteLocation"
            name="siteLocation"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={!canSave || operationStatus === "loading"}
        >
          {operationStatus === "loading" ? "Saving..." : "Add Site"}
        </button>

        {/* --- Feedback Messages --- */}
        {operationStatus === "succeeded" && (
            <p style={{ color: "green" }}>Site created successfully!</p>
        )}
        {operationStatus === "failed" && operationError && (
          <p style={{ color: "red" }}>Error: {operationError}</p>
        )}
      </form>
    </div>
  );
}

export default AddSiteForm;