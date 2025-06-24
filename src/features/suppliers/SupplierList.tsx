import { useEffect, type JSX } from "react";
import { Link } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import {
  fetchSuppliers,
  selectAllSuppliers,
  selectSuppliersStatus,
  selectSuppliersError,
  deleteSupplier,
  selectSupplierOperationStatus,
  selectSupplierOperationError,
} from "./suppliersSlice";

function SupplierList(): JSX.Element {
  const dispatch = useAppDispatch();

  // --- Redux State ---
  const suppliers = useAppSelector(selectAllSuppliers);
  const fetchStatus = useAppSelector(selectSuppliersStatus);
  const fetchError = useAppSelector(selectSuppliersError);

  const operationStatus = useAppSelector(selectSupplierOperationStatus);
  const operationError = useAppSelector(selectSupplierOperationError);

  // --- Effects ---
  useEffect(() => {
    if (fetchStatus === "idle") {
      dispatch(fetchSuppliers());
    }
  }, [fetchStatus, dispatch]);

  // --- Event Handlers ---
  const handleDeleteSupplier = (supplierId: number, supplierName: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete the supplier "${supplierName}"?`
      )
    ) {
      dispatch(deleteSupplier(supplierId))
        .unwrap()
        .catch((err) => {
          console.error("Failed to delete the supplier from component:", err);
        });
    }
  };

  // --- Render Logic ---
  let content;

  if (fetchStatus === "loading") {
    content = <p>"Loading suppliers..."</p>;
  } else if (fetchStatus === "succeeded") {
    if (suppliers.length === 0) {
      content = <p>No suppliers found. Add one to get started!</p>;
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
                padding: "10px",
                border: "1px solid #eee",
                borderRadius: "4px",
                opacity: operationStatus === "loading" ? 0.6 : 1,
              }}
            >
              <span>
                <strong>{supplier.name}</strong>
                <br />
                <small style={{ color: "#555" }}>
                  {supplier.contactPerson || "No contact person"}
                </small>
              </span>
              <span>
                <Link
                  to={`/suppliers/edit/${supplier.id}`}
                  style={{
                    marginRight: "10px",
                    textDecoration: "none",
                    color: "blue",
                    pointerEvents: operationStatus === "loading" ? "none" : "auto",
                  }}
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDeleteSupplier(supplier.id, supplier.name)}
                  style={{
                    color: "red",
                    background: "none",
                    border: "1px solid red",
                    padding: "3px 6px",
                    cursor: "pointer",
                  }}
                  disabled={operationStatus === "loading"}
                >
                  Delete
                </button>
              </span>
            </li>
          ))}
        </ul>
      );
    }
  } else if (fetchStatus === "failed") {
    content = <p>Error loading suppliers: {fetchError}</p>;
  }

  return (
    <div>
      <h2>Suppliers</h2>
      {operationStatus === "failed" && operationError && (
        <p style={{ color: "red", border: "1px solid red", padding: "10px" }}>
          <strong>Operation Failed:</strong> {operationError}
        </p>
      )}
      {operationStatus === 'loading' && <p>Processing...</p>}
      
      {content}
    </div>
  );
}

export default SupplierList;