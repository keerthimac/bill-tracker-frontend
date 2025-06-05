import { type JSX } from 'react';
import ItemCategoryList from '../features/itemCategories/ItemCategoryList';
import AddItemCategoryForm from '../features/itemCategories/AddItemCategoryForm';

function ItemCategoriesPage(): JSX.Element {
    return (
        <div>
            <h2>Manage Item Categories</h2>
            <AddItemCategoryForm />
            <hr style={{ margin: '20px 0' }} />
            <ItemCategoryList />
        </div>
    );
}
export default ItemCategoriesPage;