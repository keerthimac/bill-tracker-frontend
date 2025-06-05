import React, { useState, useEffect, type JSX } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
    updateSupplier,
    selectSupplierById,
    selectUpdateSupplierStatus,
    selectUpdateSupplierError,
    resetUpdateSupplierStatus,
    fetchSuppliers, // To ensure list is loaded for direct navigation
    selectSuppliersStatus
} from './suppliersSlice';
import type { RootState } from '../../app/store';

// This interface should match the fields you allow to be updated
// and the NewSupplierData interface in your slice.
interface SupplierFormData {
    name: string;
    contactPerson?: string;
    contactNumber?: string;
    email?: string;
    address?: string;
}

function EditSupplierForm(): JSX.Element {
    const { supplierId } = useParams<{ supplierId: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const numericSupplierId = supplierId ? parseInt(supplierId, 10) : undefined;

    const supplierToEdit = useAppSelector((state: RootState) =>
        numericSupplierId ? selectSupplierById(state, numericSupplierId) : undefined
    );
    const suppliersFetchStatus = useAppSelector(selectSuppliersStatus);
    const updateStatus = useAppSelector(selectUpdateSupplierStatus);
    const updateError = useAppSelector(selectUpdateSupplierError);

    const [formData, setFormData] = useState<SupplierFormData>({
        name: '',
        contactPerson: '',
        contactNumber: '',
        email: '',
        address: '',
    });
    const [initialLoad, setInitialLoad] = useState(true);

    useEffect(() => {
        if (suppliersFetchStatus === 'idle' && numericSupplierId) {
            dispatch(fetchSuppliers());
        }
        if (supplierToEdit) {
            setFormData({
                name: supplierToEdit.name,
                contactPerson: supplierToEdit.contactPerson || '',
                contactNumber: supplierToEdit.contactNumber || '',
                email: supplierToEdit.email || '',
                address: supplierToEdit.address || '',
            });
            setInitialLoad(false);
        } else if (suppliersFetchStatus === 'succeeded' && !supplierToEdit && numericSupplierId) {
             setInitialLoad(false);
        }
    }, [supplierToEdit, suppliersFetchStatus, numericSupplierId, dispatch]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const canSave = formData.name.trim() !== '' && updateStatus !== 'loading';

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (canSave && numericSupplierId && supplierToEdit) {
            try {
                await dispatch(updateSupplier({ id: numericSupplierId, ...formData })).unwrap();
                dispatch(resetUpdateSupplierStatus());
                navigate('/suppliers');
            } catch (err) {
                console.error('Failed to update supplier:', err);
            }
        }
    };

    if (initialLoad && suppliersFetchStatus === 'loading') {
        return <p>Loading supplier data...</p>;
    }

    if (!numericSupplierId || (!supplierToEdit && !initialLoad && suppliersFetchStatus !== 'loading')) {
        return (
            <div>
                <h2>Edit Supplier</h2>
                <p>Supplier not found.</p>
                <button onClick={() => navigate('/suppliers')}>Go to Suppliers List</button>
            </div>
        );
    }

    return (
        <div style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '20px' }}>
            <h2>Edit Supplier (ID: {numericSupplierId})</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="supplierNameEdit">Supplier Name:</label>
                    <input type="text" id="supplierNameEdit" name="name" value={formData.name} onChange={handleChange} required style={{ width: '90%', padding: '8px' }}/>
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="contactPersonEdit">Contact Person:</label>
                    <input type="text" id="contactPersonEdit" name="contactPerson" value={formData.contactPerson} onChange={handleChange} style={{ width: '90%', padding: '8px' }}/>
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="contactNumberEdit">Contact Number:</label>
                    <input type="text" id="contactNumberEdit" name="contactNumber" value={formData.contactNumber} onChange={handleChange} style={{ width: '90%', padding: '8px' }}/>
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="emailEdit">Email:</label>
                    <input type="email" id="emailEdit" name="email" value={formData.email} onChange={handleChange} style={{ width: '90%', padding: '8px' }}/>
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="addressEdit">Address:</label>
                    <textarea id="addressEdit" name="address" value={formData.address} onChange={handleChange} rows={3} style={{ width: '90%', padding: '8px' }}/>
                </div>
                <button type="submit" disabled={!canSave} style={{ padding: '10px 15px' }}>
                    {updateStatus === 'loading' ? 'Saving...' : 'Update Supplier'}
                </button>
                <button type="button" onClick={() => navigate('/suppliers')} style={{ marginLeft: '10px' }} disabled={updateStatus === 'loading'}>
                    Cancel
                </button>
                {updateStatus === 'failed' && updateError && (
                    <p style={{ color: 'red', marginTop: '10px' }}>Error: {updateError}</p>
                )}
            </form>
        </div>
    );
}

export default EditSupplierForm;