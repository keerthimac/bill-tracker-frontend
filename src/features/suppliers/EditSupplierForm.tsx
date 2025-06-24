import React, { useState, useEffect, type JSX } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
    updateSupplier,
    selectSupplierById,
    // Corrected: Using unified status selectors and actions
    selectSupplierOperationStatus,
    selectSupplierOperationError,
    resetOperationStatus,
    // Still needed for the initial data fetch
    fetchSuppliers,
    selectSuppliersStatus,
} from './suppliersSlice';
import type { RootState } from '../../app/store';

// This interface defines the shape of our form's data
interface SupplierFormData {
    name: string;
    contactPerson: string;
    contactNumber: string;
    email: string;
    address: string;
}

function EditSupplierForm(): JSX.Element {
    const { supplierId } = useParams<{ supplierId: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    // --- State and Selectors ---
    const numericSupplierId = supplierId ? parseInt(supplierId, 10) : undefined;

    // Select the specific supplier and the relevant statuses from the store
    const supplierToEdit = useAppSelector((state: RootState) =>
        numericSupplierId ? selectSupplierById(state, numericSupplierId) : undefined
    );
    const suppliersFetchStatus = useAppSelector(selectSuppliersStatus);
    const operationStatus = useAppSelector(selectSupplierOperationStatus);
    const operationError = useAppSelector(selectSupplierOperationError);

    // Local form state
    const [formData, setFormData] = useState<SupplierFormData>({
        name: '',
        contactPerson: '',
        contactNumber: '',
        email: '',
        address: '',
    });

    // --- Effects ---

    // Simplified effect to fetch data and populate the form
    useEffect(() => {
        // If we don't have the supplier's data yet and the list hasn't been fetched, dispatch the fetch action.
        // This robustly handles navigating directly to the edit page.
        if (!supplierToEdit && suppliersFetchStatus === 'idle' && numericSupplierId) {
            dispatch(fetchSuppliers());
        }

        // When the supplier data becomes available, populate the form state.
        if (supplierToEdit) {
            setFormData({
                name: supplierToEdit.name,
                contactPerson: supplierToEdit.contactPerson || '',
                contactNumber: supplierToEdit.contactNumber || '',
                email: supplierToEdit.email || '',
                address: supplierToEdit.address || '',
            });
        }
    }, [supplierToEdit, suppliersFetchStatus, numericSupplierId, dispatch]);

    // Effect to reset the operation status when the component unmounts
    useEffect(() => {
        return () => {
            dispatch(resetOperationStatus());
        };
    }, [dispatch]);

    // --- Event Handlers ---

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const canSave = formData.name.trim() !== '' && operationStatus !== 'loading';

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (canSave && numericSupplierId) {
            try {
                await dispatch(updateSupplier({ id: numericSupplierId, ...formData })).unwrap();
                // On success, navigate away. The cleanup effect will handle resetting the status.
                navigate('/suppliers');
            } catch (err) {
                console.error('Failed to update supplier:', err);
                // The UI will display the operationError from the Redux state.
            }
        }
    };

    // --- Render Logic ---

    // 1. Show a loading indicator while the initial supplier list is being fetched.
    if (suppliersFetchStatus === 'loading') {
        return <p>Loading supplier data...</p>;
    }

    // 2. If fetching is done but the supplier isn't found, show a "Not Found" message.
    if (suppliersFetchStatus === 'succeeded' && !supplierToEdit) {
        return (
            <div>
                <h2>Supplier Not Found</h2>
                <p>The supplier you are trying to edit could not be found.</p>
                <button onClick={() => navigate('/suppliers')}>Return to List</button>
            </div>
        );
    }

    // 3. Once data is available, render the form.
    return (
        <div>
            <h2>Edit Supplier</h2>
            <form onSubmit={handleSubmit}>
                {/* Form fields... */}
                 <div>
          <label htmlFor="name">Supplier Name:</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="contactPerson">Contact Person:</label>
          <input type="text" id="contactPerson" name="contactPerson" value={formData.contactPerson} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="contactNumber">Contact Number:</label>
          <input type="text" id="contactNumber" name="contactNumber" value={formData.contactNumber} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="address">Address:</label>
          <textarea id="address" name="address" value={formData.address} onChange={handleChange} />
        </div>
                
                <button type="submit" disabled={!canSave}>
                    {operationStatus === 'loading' ? 'Saving...' : 'Update Supplier'}
                </button>
                <button type="button" onClick={() => navigate('/suppliers')} style={{ marginLeft: '10px' }} disabled={operationStatus === 'loading'}>
                    Cancel
                </button>
                
                {operationStatus === 'failed' && operationError && (
                    <p style={{ color: 'red' }}>Error: {operationError}</p>
                )}
            </form>
        </div>
    );
}

export default EditSupplierForm;