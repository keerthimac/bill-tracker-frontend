// In src/pages/PurchaseBillsPage.tsx
import { type JSX } from "react";
import PurchaseBillList from "../features/purchaseBills/PurchaseBillList";
import { Link } from "react-router-dom"; // <<< IMPORT Link

function PurchaseBillsPage(): JSX.Element {
  return (
    <div>
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Purchase Bills Management</h2>{" "}
        {/* Moved title here from PurchaseBillList */}
        <Link
          to="/purchase-bills/add"
          style={{
            padding: "10px 15px",
            backgroundColor: "#28a745",
            color: "white",
            textDecoration: "none",
            borderRadius: "5px",
          }}
        >
          Add New Purchase Bill
        </Link>
      </div>
      <PurchaseBillList />
    </div>
  );
}
export default PurchaseBillsPage;
