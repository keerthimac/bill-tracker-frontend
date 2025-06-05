import { useEffect, type JSX } from "react";
import { Link } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import {
  fetchSites,
  selectAllSites,
  selectSitesStatus,
  selectSitesError,
  deleteSite, // <<< IMPORT deleteSite thunk
} from "./sitesSlice";

function SiteList(): JSX.Element {
  const dispatch = useAppDispatch();
  const sites = useAppSelector(selectAllSites);
  const sitesStatus = useAppSelector(selectSitesStatus);
  const error = useAppSelector(selectSitesError);
  // Optionally, you can select deleteStatus and deleteError if you want to show specific feedback
  // const deleteStatus = useAppSelector(selectDeleteSiteStatus); // Assuming you add these selectors
  // const deleteError = useAppSelector(selectDeleteSiteError); // Assuming you add these selectors

  useEffect(() => {
    if (sitesStatus === "idle") {
      dispatch(fetchSites());
    }
  }, [sitesStatus, dispatch]);

  const handleDeleteSite = (siteId: number, siteName: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete the site "${siteName}"? This action cannot be undone.`
      )
    ) {
      dispatch(deleteSite(siteId))
        .unwrap()
        .catch((err) => {
          // The slice already logs this, but you can add specific UI error handling here if needed
          console.error("Failed to delete site from component:", err);
          alert(`Error deleting site: ${err.message || "Unknown error"}`);
        });
    }
  };

  let content;

  if (sitesStatus === "loading") {
    content = <p>"Loading sites..."</p>;
  } else if (sitesStatus === "succeeded") {
    if (sites.length === 0) {
      content = <p>No sites found.</p>;
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
                paddingBottom: "5px",
                borderBottom: "1px solid #eee",
              }}
            >
              <span>
                <strong>{site.name}</strong> (
                {site.location || "No location specified"})
              </span>
              <span>
                <Link
                  to={`/sites/edit/${site.id}`}
                  style={{
                    marginRight: "10px",
                    textDecoration: "none",
                    color: "blue",
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
                  // disabled={deleteStatus === 'loading'} // If tracking delete status
                >
                  Delete
                </button>
              </span>
            </li>
          ))}
        </ul>
      );
    }
  } else if (sitesStatus === "failed") {
    content = <p>Error loading sites: {error}</p>;
  }

  return (
    <div>
      {/* Title might be better in SitesPage.tsx */}
      {content}
    </div>
  );
}

export default SiteList;
