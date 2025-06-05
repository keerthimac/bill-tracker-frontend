import { useEffect, type JSX } from 'react';
import { Link } from 'react-router-dom'; // <<< IMPORT Link
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import {
    fetchItemCategories,
    selectAllItemCategories,
    selectItemCategoriesStatus,
    selectItemCategoriesError
} from './itemCategoriesSlice';

function ItemCategoryList(): JSX.Element {
    const dispatch = useAppDispatch();
    const categories = useAppSelector(selectAllItemCategories);
    const status = useAppSelector(selectItemCategoriesStatus);
    const error = useAppSelector(selectItemCategoriesError);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchItemCategories());
        }
    }, [status, dispatch]);

    let content;
    if (status === 'loading') { /* ... */ content = <p>"Loading item categories..."</p>; }
    else if (status === 'succeeded') {
        if (categories.length === 0) { content = <p>No item categories found.</p>; }
        else {
            content = (
                <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                    {categories.map(category => (
                        <li key={category.id} style={{ marginBottom: '10px', paddingBottom: '5px', borderBottom: '1px solid #eee' }}>
                            {category.name}
                            <Link
                                to={`/item-categories/edit/${category.id}`} // <<< ADD EDIT LINK
                                style={{ marginLeft: '10px', textDecoration: 'none', color: 'blue' }}
                            >
                                Edit
                            </Link>
                        </li>
                    ))}
                </ul>
            );
        }
    } else if (status === 'failed') { /* ... */ content = <p>Error: {error}</p>; }

    return <div>{content}</div>; // Simplified wrapping div
}
export default ItemCategoryList;