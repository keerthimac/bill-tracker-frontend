import React, { useState, useEffect, type JSX } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
    updateItemCategory,
    selectItemCategoryById,
    selectUpdateItemCategoryStatus,
    selectUpdateItemCategoryError,
    resetUpdateItemCategoryStatus,
    fetchItemCategories, // To ensure list is loaded for direct navigation
    selectItemCategoriesStatus
} from './itemCategoriesSlice';
import type { RootState } from '../../app/store';

interface CategoryFormData {
    name: string;
}

function EditItemCategoryForm(): JSX.Element {
    const { categoryId } = useParams<{ categoryId: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const numericCategoryId = categoryId ? parseInt(categoryId, 10) : undefined;

    const categoryToEdit = useAppSelector((state: RootState) =>
        numericCategoryId ? selectItemCategoryById(state, numericCategoryId) : undefined
    );
    const categoriesFetchStatus = useAppSelector(selectItemCategoriesStatus);
    const updateStatus = useAppSelector(selectUpdateItemCategoryStatus);
    const updateError = useAppSelector(selectUpdateItemCategoryError);

    const [name, setName] = useState<string>('');
    const [initialLoad, setInitialLoad] = useState(true);

    useEffect(() => {
        if (categoriesFetchStatus === 'idle' && numericCategoryId) {
            dispatch(fetchItemCategories());
        }
        if (categoryToEdit) {
            setName(categoryToEdit.name);
            setInitialLoad(false);
        } else if (categoriesFetchStatus === 'succeeded' && !categoryToEdit && numericCategoryId) {
            setInitialLoad(false);
        }
    }, [categoryToEdit, categoriesFetchStatus, numericCategoryId, dispatch]);

    const canSave = name.trim() !== '' && updateStatus !== 'loading';

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (canSave && numericCategoryId && categoryToEdit) {
            try {
                await dispatch(updateItemCategory({ id: numericCategoryId, name })).unwrap();
                dispatch(resetUpdateItemCategoryStatus());
                navigate('/item-categories');
            } catch (err) {
                console.error('Failed to update item category:', err);
            }
        }
    };
    
    if (initialLoad && categoriesFetchStatus === 'loading') {
        return <p>Loading category data...</p>;
    }

    if (!numericCategoryId || (!categoryToEdit && !initialLoad && categoriesFetchStatus !== 'loading')) {
        return (
            <div>
                <h2>Edit Item Category</h2>
                <p>Item Category not found.</p>
                <button onClick={() => navigate('/item-categories')}>Go to Item Categories List</button>
            </div>
        );
    }

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
                    {updateStatus === 'loading' ? 'Saving...' : 'Update Category'}
                </button>
                <button type="button" onClick={() => navigate('/item-categories')} style={{ marginLeft: '10px' }} disabled={updateStatus === 'loading'}>
                    Cancel
                </button>
                {updateStatus === 'failed' && updateError && (
                    <p style={{ color: 'red' }}>Error: {updateError}</p>
                )}
            </form>
        </div>
    );
}

export default EditItemCategoryForm;