import { useEffect, type JSX } from "react";
import { useAppSelector, useAppDispatch } from "../../app/hooks"; // Typed hooks
import {
  fetchSites,
  selectAllSites,
  selectSitesStatus,
  selectSitesError,
} from "./sitesSlice";

function SiteList(): JSX.Element {
  const dispatch = useAppDispatch();
  const sites = useAppSelector(selectAllSites);
  const sitesStatus = useAppSelector(selectSitesStatus);
  const error = useAppSelector(selectSitesError);

  useEffect(() => {
    if (sitesStatus === "idle") {
      // Fetch sites only if they haven't been fetched yet
      dispatch(fetchSites());
    }
  }, [sitesStatus, dispatch]);

  let content;

  if (sitesStatus === "loading") {
    content = <p>"Loading sites..."</p>;
  } else if (sitesStatus === "succeeded") {
    if (sites.length === 0) {
      content = <p>No sites found.</p>;
    } else {
      content = (
        <ul>
          {sites.map((site) => (
            <li key={site.id}>
              <strong>{site.name}</strong> (
              {site.location || "No location specified"})
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
      <h2>Sites</h2>
      {content}
    </div>
  );
}

export default SiteList;
