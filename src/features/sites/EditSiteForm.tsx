import React, { useState, useEffect, type JSX } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  updateSite,
  selectSiteById,
  // Corrected: Using unified status selectors and actions
  selectSiteOperationStatus,
  selectSiteOperationError,
  resetOperationStatus,
  // Still needed for the initial data fetch
  fetchSites,
  selectSitesStatus,
} from './sitesSlice';
import type { RootState } from '../../app/store';

// This interface is fine as is
interface SiteFormData {
  name: string;
  location: string; // Changed to non-optional for easier state management
}

function EditSiteForm(): JSX.Element {
  const { siteId } = useParams<{ siteId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // --- State and Selectors ---
  const numericSiteId = siteId ? parseInt(siteId, 10) : undefined;

  // Select the specific site from the store
  const siteToEdit = useAppSelector((state: RootState) =>
    numericSiteId ? selectSiteById(state, numericSiteId) : undefined
  );
  
  // Select status for the list fetch and the CUD operations
  const sitesFetchStatus = useAppSelector(selectSitesStatus);
  const operationStatus = useAppSelector(selectSiteOperationStatus);
  const operationError = useAppSelector(selectSiteOperationError);

  // Local form state
  const [formData, setFormData] = useState<SiteFormData>({ name: '', location: '' });

  // --- Effects ---

  // Effect to fetch sites if needed and populate the form
  useEffect(() => {
    // If we don't have the site data, and the sites haven't been fetched yet,
    // dispatch the fetch action. This handles direct navigation to the edit page.
    if (!siteToEdit && sitesFetchStatus === 'idle' && numericSiteId) {
      dispatch(fetchSites());
    }

    // When the site data becomes available, populate the form
    if (siteToEdit) {
      setFormData({
        name: siteToEdit.name,
        location: siteToEdit.location || '', // Ensure location is always a string
      });
    }
  }, [siteToEdit, sitesFetchStatus, numericSiteId, dispatch]);

  // Effect to reset the operation status when the component unmounts
  useEffect(() => {
    return () => {
      dispatch(resetOperationStatus());
    };
  }, [dispatch]);


  // --- Event Handlers ---

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const canSave = formData.name.trim() !== '' && operationStatus !== 'loading';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSave && numericSiteId) {
      try {
        await dispatch(updateSite({ id: numericSiteId, ...formData })).unwrap();
        // On success, navigate back to the list. The cleanup effect will reset the status.
        navigate('/sites');
      } catch (err) {
        console.error('Failed to update the site:', err);
        // The UI will display the operationError from the Redux state
      }
    }
  };


  // --- Render Logic ---

  // Show loading indicator while the initial site data is being fetched
  if (sitesFetchStatus === 'loading') {
    return <p>Loading site data...</p>;
  }
  
  // Show "Not Found" message if the fetch succeeded but the site doesn't exist.
  // This is a robust way to handle invalid IDs.
  if (sitesFetchStatus === 'succeeded' && !siteToEdit) {
    return (
      <div>
        <h2>Site Not Found</h2>
        <p>The site you are trying to edit could not be found.</p>
        <button onClick={() => navigate('/sites')}>Return to List</button>
      </div>
    );
  }

  // Render the form once the site data is available
  return (
    <div>
      <h2>Edit Site</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Site Name:</label>
          <input
            type="text"
            id="name"
            name="name" // The 'name' attribute must match the key in the formData state
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="location">Location:</label>
          <input
            type="text"
            id="location"
            name="location" // The 'name' attribute must match the key in the formData state
            value={formData.location}
            onChange={handleChange}
          />
        </div>
        <button type="submit" disabled={!canSave}>
          {operationStatus === 'loading' ? 'Saving...' : 'Update Site'}
        </button>
        <button type="button" onClick={() => navigate('/sites')} style={{ marginLeft: '10px' }} disabled={operationStatus === 'loading'}>
          Cancel
        </button>
        {operationStatus === 'failed' && operationError && (
          <p style={{ color: 'red' }}>Error: {operationError}</p>
        )}
      </form>
    </div>
  );
}

export default EditSiteForm;