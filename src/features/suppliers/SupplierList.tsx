import { useEffect, type JSX } from "react";
import { useAppSelector, useAppDispatch } from "../../app/hooks"; // Your typed hooks
import {
  fetchSuppliers,
  selectAllSuppliers,
  selectSuppliersStatus,
  selectSuppliersError,
} from "./suppliersSlice";

function SupplierList(): JSX.Element {
  const dispatch = useAppDispatch();
  const suppliers = useAppSelector(selectAllSuppliers);
  const status = useAppSelector(selectSuppliersStatus);
  const error = useAppSelector(selectSuppliersError);

  useEffect(() => {
    if (status === "idle") {
      // Fetch only if they haven't been fetched or an attempt isn't in progress
      dispatch(fetchSuppliers());
    }
  }, [status, dispatch]);

  let content;

  if (status === "loading") {
    content = <p>"Loading suppliers..."</p>;
  } else if (status === "succeeded") {
    if (suppliers.length === 0) {
      content = <p>No suppliers found.</p>;
    } else {
      content = (
        <ul>
          {suppliers.map((supplier) => (
            <li key={supplier.id}>
              <strong>{supplier.name}</strong>
              {supplier.contactPerson &&
                ` (Contact: ${supplier.contactPerson})`}
              {supplier.email && ` - Email: ${supplier.email}`}
              {supplier.contactNumber && ` - Phone: ${supplier.contactNumber}`}
              {supplier.address && (
                <div style={{ marginLeft: "20px" }}>
                  Address: {supplier.address}
                </div>
              )}
            </li>
          ))}
        </ul>
      );
    }
  } else if (status === "failed") {
    content = <p>Error loading suppliers: {error}</p>;
  }

  return (
    <div>
      <h2>Suppliers</h2>
      {content}
    </div>
  );
}

export default SupplierList;
