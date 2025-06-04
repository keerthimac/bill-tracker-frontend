import React, { useState, useEffect, type JSX } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  createSite,
  selectCreateSiteStatus,
  selectCreateSiteError,
  resetCreateSiteStatus,
} from "./sitesSlice"; // Assuming NewSiteData is defined in sitesSlice or imported separately

// If NewSiteData is not exported from sitesSlice, you might need to define it here or import it.
// For simplicity, let's assume it's implicitly handled or you'd define:
// interface NewSiteData { name: string; location?: string; }

function AddSiteForm(): JSX.Element {
  const dispatch = useAppDispatch();

  const [name, setName] = useState<string>("");
  const [location, setLocation] = useState<string>("");

  const createStatus = useAppSelector(selectCreateSiteStatus);
  const createError = useAppSelector(selectCreateSiteError);

  const canSave = name.trim() !== ""; // Basic client-side check

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSave) {
      try {
        // The type for createSite thunk argument is NewSiteData
        // { name: string, location?: string }
        await dispatch(createSite({ name, location })).unwrap(); // .unwrap() will throw error if rejected
        // Clear form on success
        setName("");
        setLocation("");
        // Optionally dispatch resetCreateSiteStatus after a short delay or based on user action
        // dispatch(resetCreateSiteStatus());
        // alert('Site created successfully!'); // Or use a more sophisticated notification
      } catch (err: any) {
        // Error is already handled by the slice and set in createError
        // unwrap() re-throws the error payload from rejectWithValue or a generic error
        console.error("Failed to save the site: ", err);
        // The createError from the slice will be displayed below
      }
    }
  };

  // Effect to reset status when component unmounts or on success/failure if needed
  useEffect(() => {
    // Optionally reset status when form is shown again after a submission attempt
    // This ensures that if the user navigates away and back, or after an error,
    // the form isn't stuck in a 'failed' or 'succeeded' state visually
    // if createStatus === 'failed' or createStatus === 'succeeded'
    // return () => {
    // dispatch(resetCreateSiteStatus());
    // }
  }, [dispatch, createStatus]);

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
            required // HTML5 validation
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
        <button type="submit" disabled={!canSave || createStatus === "loading"}>
          {createStatus === "loading" ? "Saving..." : "Add Site"}
        </button>
        {createStatus === "failed" && createError && (
          <p style={{ color: "red" }}>Error: {createError}</p>
        )}
        {/* You could also show a success message here based on createStatus === 'succeeded' */}
      </form>
    </div>
  );
}

export default AddSiteForm;
