import { useEffect, type JSX } from "react";
import { Link } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import {
  fetchSuppliers,
  selectAllSuppliers,
  selectSuppliersStatus,
  selectSuppliersError,
  deleteSupplier, // <<< IMPORT deleteSupplier thunk
} from "./suppliersSlice";

function SupplierList(): JSX.Element {
  const dispatch = useAppDispatch();
  const suppliers = useAppSelector(selectAllSuppliers);
  const status = useAppSelector(selectSuppliersStatus);
  const error = useAppSelector(selectSuppliersError);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchSuppliers());
    }
  }, [status, dispatch]);

  const handleDeleteSupplier = (supplierId: number, supplierName: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete the supplier "${supplierName}"?`
      )
    ) {
      dispatch(deleteSupplier(supplierId))
        .unwrap()
        .catch((err) => {
          alert(`Error deleting supplier: ${err.message || "Unknown error"}`);
        });
    }
  };

  let content;
  if (status === "loading") {
    content = <p>"Loading suppliers..."</p>;
  } else if (status === "succeeded") {
    if (suppliers.length === 0) {
      content = <p>No suppliers found.</p>;
    } else {
      content = (
        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          {suppliers.map((supplier) => (
            <li
              key={supplier.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
                paddingBottom: "5px",
                borderBottom: "1px solid #eee",
              }}
            >
              <span>
                <strong>{supplier.name}</strong>
                {supplier.contactPerson &&
                  ` (Contact: ${supplier.contactPerson})`}
              </span>
              <span>
                <Link
                  to={`/suppliers/edit/${supplier.id}`}
                  style={{
                    marginRight: "10px",
                    textDecoration: "none",
                    color: "blue",
                  }}
                >
                  Edit
                </Link>
                <button
                  onClick={() =>
                    handleDeleteSupplier(supplier.id, supplier.name)
                  }
                  style={{
                    color: "red",
                    background: "none",
                    border: "1px solid red",
                    padding: "3px 6px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </span>
            </li>
          ))}
        </ul>
      );
    }
  } else if (status === "failed") {
    content = <p>Error: {error}</p>;
  }

  return <div>{content}</div>;
}
export default SupplierList;
