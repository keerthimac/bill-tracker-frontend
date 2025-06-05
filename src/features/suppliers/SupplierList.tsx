import { useEffect, type JSX } from 'react';
import { Link } from 'react-router-dom'; // <<< IMPORT Link
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import {
    fetchSuppliers,
    selectAllSuppliers,
    selectSuppliersStatus,
    selectSuppliersError
} from './suppliersSlice';

function SupplierList(): JSX.Element {
    const dispatch = useAppDispatch();
    const suppliers = useAppSelector(selectAllSuppliers);
    const status = useAppSelector(selectSuppliersStatus);
    const error = useAppSelector(selectSuppliersError);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchSuppliers());
        }
    }, [status, dispatch]);

    let content;
    if (status === 'loading') { /* ... */ content = <p>"Loading suppliers..."</p>; }
    else if (status === 'succeeded') {
        if (suppliers.length === 0) { content = <p>No suppliers found.</p>; }
        else {
            content = (
                <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                    {suppliers.map(supplier => (
                        <li key={supplier.id} style={{ marginBottom: '10px', paddingBottom: '5px', borderBottom: '1px solid #eee' }}>
                            <strong>{supplier.name}</strong>
                            {supplier.contactPerson && ` (Contact: ${supplier.contactPerson})`}
                            {/* Could add more details here if needed */}
                            <Link
                                to={`/suppliers/edit/${supplier.id}`} // <<< ADD EDIT LINK
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
export default SupplierList;