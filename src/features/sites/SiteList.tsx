import { useEffect, type JSX } from "react";
import { Link } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import {
  fetchSites,
  selectAllSites,
  selectSitesStatus,
  selectSitesError,
  deleteSite,
  // Corrected: Import the unified status selectors for operations
  selectSiteOperationStatus,
  selectSiteOperationError,
} from "./sitesSlice";

function SiteList(): JSX.Element {
  const dispatch = useAppDispatch();

  // --- Redux State ---
  const sites = useAppSelector(selectAllSites);
  const sitesFetchStatus = useAppSelector(selectSitesStatus);
  const fetchError = useAppSelector(selectSitesError);
  
  // Use the unified status for delete operations to provide UI feedback
  const operationStatus = useAppSelector(selectSiteOperationStatus);
  const operationError = useAppSelector(selectSiteOperationError);

  // --- Effects ---

  // Effect to fetch the list of sites if it hasn't been fetched yet
  useEffect(() => {
    if (sitesFetchStatus === "idle") {
      dispatch(fetchSites());
    }
  }, [sitesFetchStatus, dispatch]);

  // --- Event Handlers ---

  const handleDeleteSite = (siteId: number, siteName: string) => {
    // Confirm before dispatching the delete action
    if (
      window.confirm(
        `Are you sure you want to delete the site "${siteName}"? This action cannot be undone.`
      )
    ) {
      dispatch(deleteSite(siteId))
        .unwrap()
        .catch((err) => {
          // The slice will set the error state. We can log it here for debugging.
          console.error("Failed to delete the site from component:", err);
          // The UI will display the operationError from the Redux state, so an alert is not needed.
        });
    }
  };

  // --- Render Logic ---

  let content;

  if (sitesFetchStatus === "loading") {
    content = <p>"Loading sites..."</p>;
  } else if (sitesFetchStatus === "succeeded") {
    if (sites.length === 0) {
      content = <p>No sites found. Add one to get started!</p>;
    } else {
      content = (
        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          {sites.map((site) => (
            <li
              key={site.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
                padding: "10px",
                border: "1px solid #eee",
                borderRadius: "4px",
                // Visually indicate when an item is being processed
                opacity: operationStatus === "loading" ? 0.6 : 1,
              }}
            >
              <span>
                <strong>{site.name}</strong>
                <br />
                <small style={{ color: "#555" }}>
                  {site.location || "No location specified"}
                </small>
              </span>
              <span>
                <Link
                  to={`/sites/edit/${site.id}`}
                  style={{
                    marginRight: "10px",
                    textDecoration: "none",
                    color: "blue",
                    // Prevent navigation while an operation is in progress
                    pointerEvents: operationStatus === "loading" ? "none" : "auto",
                  }}
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDeleteSite(site.id, site.name)}
                  style={{
                    color: "red",
                    background: "none",
                    border: "1px solid red",
                    padding: "3px 6px",
                    cursor: "pointer",
                  }}
                  // Disable all delete buttons while any operation is loading
                  disabled={operationStatus === "loading"}
                >
                  Delete
                </button>
              </span>
            </li>
          ))}
        </ul>
      );
    }
  } else if (sitesFetchStatus === "failed") {
    content = <p>Error loading sites: {fetchError}</p>;
  }

  return (
    <div>
      {/* Display a global error message for failed operations like delete */}
      {operationStatus === "failed" && operationError && (
        <p style={{ color: "red", border: "1px solid red", padding: "10px" }}>
          <strong>Operation Failed:</strong> {operationError}
        </p>
      )}
      {/* Display a global loading message for CUD operations */}
      {operationStatus === 'loading' && <p>Processing...</p>}
      
      {content}
    </div>
  );
}

export default SiteList;