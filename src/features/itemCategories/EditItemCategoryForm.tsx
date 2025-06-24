import React, { useState, useEffect, type JSX } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
    updateItemCategory,
    selectItemCategoryById,
    // Corrected: Using the unified operation selectors and reset action
    selectItemCategoryOperationStatus,
    selectItemCategoryOperationError,
    resetOperationStatus,
    // Still needed for fetching the list on direct navigation
    fetchItemCategories,
    selectItemCategoriesStatus
} from './itemCategoriesSlice';
import type { RootState } from '../../app/store';

// The CategoryFormData interface was removed as it was unused.

function EditItemCategoryForm(): JSX.Element {
    const { categoryId } = useParams<{ categoryId: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    // --- State and Selectors ---
    const numericCategoryId = categoryId ? parseInt(categoryId, 10) : undefined;

    const categoryToEdit = useAppSelector((state: RootState) =>
        numericCategoryId ? selectItemCategoryById(state, numericCategoryId) : undefined
    );
    const categoriesFetchStatus = useAppSelector(selectItemCategoriesStatus);
    const operationStatus = useAppSelector(selectItemCategoryOperationStatus);
    const operationError = useAppSelector(selectItemCategoryOperationError);

    // Using a simple string state is perfect for a one-field form.
    const [name, setName] = useState<string>('');

    // --- Effects ---

    // Simplified effect for fetching and populating data
    useEffect(() => {
        // If the category list hasn't been fetched, get it.
        if (categoriesFetchStatus === 'idle' && numericCategoryId) {
            dispatch(fetchItemCategories());
        }
        // When the category data is available, populate the form field.
        if (categoryToEdit) {
            setName(categoryToEdit.name);
        }
    }, [categoryToEdit, categoriesFetchStatus, numericCategoryId, dispatch]);

    // Effect to reset the operation status when the component unmounts
    useEffect(() => {
        return () => {
            dispatch(resetOperationStatus());
        };
    }, [dispatch]);

    // --- Event Handlers ---
    const canSave = name.trim() !== '' && operationStatus !== 'loading';

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (canSave && numericCategoryId) {
            try {
                await dispatch(updateItemCategory({ id: numericCategoryId, name })).unwrap();
                // On success, navigate away. The unmount cleanup will reset the status.
                navigate('/item-categories');
            } catch (err) {
                console.error('Failed to update item category:', err);
                // The UI will show the `operationError` from the Redux state.
            }
        }
    };
    
    // --- Render Logic ---

    // 1. Show loading state while fetching initial data
    if (categoriesFetchStatus === 'loading') {
        return <p>Loading category data...</p>;
    }

    // 2. Show "Not Found" if fetch is done but the category doesn't exist
    if (categoriesFetchStatus === 'succeeded' && !categoryToEdit) {
        return (
            <div>
                <h2>Edit Item Category</h2>
                <p>Item Category not found.</p>
                <button onClick={() => navigate('/item-categories')}>Go to List</button>
            </div>
        );
    }

    // 3. Render the form
    return (
        <div>
            <h2>Edit Item Category (ID: {numericCategoryId})</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="categoryName">Category Name:</label>
                    <input
                        type="text"
                        id="categoryName"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={!canSave}>
                    {operationStatus === 'loading' ? 'Saving...' : 'Update Category'}
                </button>
                <button type="button" onClick={() => navigate('/item-categories')} style={{ marginLeft: '10px' }} disabled={operationStatus === 'loading'}>
                    Cancel
                </button>
                {operationStatus === 'failed' && operationError && (
                    <p style={{ color: 'red' }}>Error: {operationError}</p>
                )}
            </form>
        </div>
    );
}

export default EditItemCategoryForm;