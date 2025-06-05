import { useEffect, type JSX } from 'react';
import { Link } from 'react-router-dom'; // <<< IMPORT Link
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { fetchSites, selectAllSites, selectSitesStatus, selectSitesError } from './sitesSlice';

function SiteList(): JSX.Element {
    const dispatch = useAppDispatch();
    const sites = useAppSelector(selectAllSites);
    const sitesStatus = useAppSelector(selectSitesStatus);
    const error = useAppSelector(selectSitesError);

    useEffect(() => {
        if (sitesStatus === 'idle') {
            dispatch(fetchSites());
        }
    }, [sitesStatus, dispatch]);

    let content;

    if (sitesStatus === 'loading') {
        content = <p>"Loading sites..."</p>;
    } else if (sitesStatus === 'succeeded') {
        if (sites.length === 0) {
            content = <p>No sites found.</p>;
        } else {
            content = (
                <ul style={{ listStyle: 'none', paddingLeft: 0 }}> {/* Basic styling */}
                    {sites.map(site => (
                        <li key={site.id} style={{ marginBottom: '10px', paddingBottom: '5px', borderBottom: '1px solid #eee' }}>
                            <strong>{site.name}</strong> ({site.location || 'No location specified'})
                            <Link 
                                to={`/sites/edit/${site.id}`} // <<< ADD EDIT LINK
                                style={{ marginLeft: '10px', textDecoration: 'none', color: 'blue' }}
                            >
                                Edit
                            </Link>
                            {/* We'll add a Delete button here later */}
                        </li>
                    ))}
                </ul>
            );
        }
    } else if (sitesStatus === 'failed') {
        content = <p>Error loading sites: {error}</p>;
    }

    return (
        <div>
            {/* The <h2>Sites</h2> title might be better in SitesPage.tsx */}
            {/* For now, keeping it here if SiteList is directly used and needs a title */}
            {/* <h2>Sites</h2> */}
            {content}
        </div>
    );
}

export default SiteList;