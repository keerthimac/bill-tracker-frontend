import React, { useState, useEffect, type JSX } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
    updateSite,
    selectSiteById, // To get the site data
    selectUpdateSiteStatus,
    selectUpdateSiteError,
    resetUpdateSiteStatus, // Optional: to reset status
    fetchSites, // To fetch all sites if the specific site isn't found and list is not loaded
    selectSitesStatus
} from './sitesSlice';
import type { RootState } from '../../app/store'; // To use with selectSiteById type

// Interface for the form data, similar to NewSiteData but id is handled by useParams
interface SiteFormData {
    name: string;
    location?: string;
}

function EditSiteForm(): JSX.Element {
    const { siteId } = useParams<{ siteId: string }>(); // Get siteId from URL
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    // Convert siteId to number, handle potential undefined case
    const numericSiteId = siteId ? parseInt(siteId, 10) : undefined;

    // Select the site from the Redux store
    // Note: The state passed to selectSiteById is the RootState, and then the siteId
    const siteToEdit = useAppSelector((state: RootState) =>
        numericSiteId ? selectSiteById(state, numericSiteId) : undefined
    );
    
    const sitesFetchStatus = useAppSelector(selectSitesStatus);
    const updateStatus = useAppSelector(selectUpdateSiteStatus);
    const updateError = useAppSelector(selectUpdateSiteError);

    const [formData, setFormData] = useState<SiteFormData>({ name: '', location: '' });
    const [initialLoad, setInitialLoad] = useState(true); // To prevent premature "not found"

    useEffect(() => {
        // If sites haven't been fetched yet, and we are trying to edit, fetch them.
        // This handles direct navigation to the edit page.
        if (sitesFetchStatus === 'idle' && numericSiteId) {
            dispatch(fetchSites());
        }

        // Once siteToEdit is available (either from already fetched list or after fetchSites)
        if (siteToEdit) {
            setFormData({
                name: siteToEdit.name,
                location: siteToEdit.location || '',
            });
            setInitialLoad(false);
        } else if (sitesFetchStatus === 'succeeded' && !siteToEdit && numericSiteId) {
            // Sites fetched, but this specific site ID not found in the list
            console.error("Site not found for editing!");
            setInitialLoad(false); 
            // Optionally navigate away or show a more prominent "not found" message
        }
    }, [siteToEdit, sitesFetchStatus, numericSiteId, dispatch]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const canSave = formData.name.trim() !== '' && updateStatus !== 'loading';

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (canSave && numericSiteId && siteToEdit) { // Ensure siteToEdit and numericSiteId are valid
            try {
                await dispatch(updateSite({ id: numericSiteId, ...formData })).unwrap();
                // Reset status and navigate back on success
                dispatch(resetUpdateSiteStatus()); // Optional: if you want to clear status immediately
                navigate('/sites'); // Navigate back to the sites list
            } catch (err: any) {
                console.error('Failed to update the site: ', err);
                // Error is already in updateError from the slice
            }
        }
    };

    // Handle cases where siteId is invalid or site not found after initial attempts
    if (initialLoad && sitesFetchStatus === 'loading') {
        return <p>Loading site data...</p>;
    }
    
    if (!numericSiteId || (!siteToEdit && !initialLoad && sitesFetchStatus !== 'loading')) {
        return (
            <div>
                <h2>Edit Site</h2>
                <p>Site not found. It might have been deleted or the ID is incorrect.</p>
                <button onClick={() => navigate('/sites')}>Go to Sites List</button>
            </div>
        );
    }


    return (
        <div>
            <h2>Edit Site (ID: {numericSiteId})</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="siteName">Site Name:</label>
                    <input
                        type="text"
                        id="siteName"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="siteLocation">Location:</label>
                    <input
                        type="text"
                        id="siteLocation"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit" disabled={!canSave}>
                    {updateStatus === 'loading' ? 'Saving...' : 'Update Site'}
                </button>
                <button type="button" onClick={() => navigate('/sites')} style={{ marginLeft: '10px' }} disabled={updateStatus === 'loading'}>
                    Cancel
                </button>
                {updateStatus === 'failed' && updateError && (
                    <p style={{ color: 'red' }}>Error: {updateError}</p>
                )}
            </form>
        </div>
    );
}

export default EditSiteForm;