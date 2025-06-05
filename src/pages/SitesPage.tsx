import { type JSX } from 'react';
import SiteList from '../features/sites/SiteList';
import AddSiteForm from '../features/sites/AddSiteForm';

function SitesPage(): JSX.Element {
    return (
        <div>
            <h2>Manage Sites</h2>
            <AddSiteForm />
            <hr style={{ margin: '20px 0' }} />
            <SiteList />
        </div>
    );
}
export default SitesPage;