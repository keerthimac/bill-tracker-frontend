import React, { useEffect, type JSX } from "react";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import {
  fetchPurchaseBills,
  selectAllPurchaseBills,
  selectPurchaseBillsStatus,
  selectPurchaseBillsError,
} from "./purchaseBillsSlice";
import { Link } from "react-router-dom";
// import { Link } from 'react-router-dom'; // For later when we add "View Details" links

// Basic styling (can be moved to a CSS file or styled components)
const listStyle: React.CSSProperties = {
  listStyleType: "none",
  padding: 0,
};

const listItemStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  padding: "15px",
  marginBottom: "10px",
  borderRadius: "5px",
  backgroundColor: "#f9f9f9",
};

const billHeaderStyle: React.CSSProperties = {
  fontSize: "1.2em",
  fontWeight: "bold",
  marginBottom: "5px",
};

const detailStyle: React.CSSProperties = {
  fontSize: "0.9em",
  color: "#555",
  marginBottom: "3px",
};

function PurchaseBillList(): JSX.Element {
  const dispatch = useAppDispatch();
  const bills = useAppSelector(selectAllPurchaseBills);
  const status = useAppSelector(selectPurchaseBillsStatus);
  const error = useAppSelector(selectPurchaseBillsError);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchPurchaseBills());
    }
  }, [status, dispatch]);

  let content;

  if (status === "loading") {
    content = <p>"Loading purchase bills..."</p>;
  } else if (status === "succeeded") {
    if (!bills || bills.length === 0) {
      content = <p>No purchase bills found.</p>;
    } else {
      content = (
        <ul style={listStyle}>
          {bills.map((bill) => (
            <li key={bill.id} style={listItemStyle}>
              <div style={billHeaderStyle}>
                <Link
                  to={`/purchase-bills/${bill.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  {" "}
                  {/* <<< Link on Bill Number */}
                  Bill #: {bill.billNumber}
                </Link>
              </div>
              <div style={detailStyle}>
                Date: {new Date(bill.billDate).toLocaleDateString()}
              </div>
              <div style={detailStyle}>Supplier: {bill.supplier.name}</div>
              <div style={detailStyle}>Site: {bill.site.name}</div>
              <div style={detailStyle}>
                Total Amount:{" "}
                {bill.totalAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <div style={detailStyle}>GRN Status: {bill.overallGrnStatus}</div>
              <div style={detailStyle}>Items: {bill.billItems.length}</div>
              {/* Later, add links/buttons for actions:
                            <Link to={`/purchase-bills/${bill.id}`}>View Details</Link> |
                            <Link to={`/purchase-bills/edit/${bill.id}`}>Edit</Link> |
                            <button>Update GRN</button>
                            */}
            </li>
          ))}
        </ul>
      );
    }
  } else if (status === "failed") {
    content = (
      <p style={{ color: "red" }}>Error loading purchase bills: {error}</p>
    );
  }

  return (
    <div>
      <h2>Purchase Bills</h2>
      {content}
    </div>
  );
}

export default PurchaseBillList;
