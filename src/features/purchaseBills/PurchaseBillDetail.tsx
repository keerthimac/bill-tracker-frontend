import React, { useEffect, type JSX } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchPurchaseBillById,
  selectCurrentPurchaseBill,
  selectCurrentPurchaseBillStatus,
  selectCurrentPurchaseBillError,
  clearSelectedPurchaseBill,
  updateGrnForItem,
  updateGrnHardcopy,
  selectGrnItemUpdateStatus,
  selectGrnHeaderUpdateStatus,
  // Make sure PurchaseBill and BillItem_Ref types are exported from your slice or defined/imported
} from "./purchaseBillsSlice";
import type { PurchaseBill, BillItem_Ref } from "./purchaseBillsSlice";

// Basic styling (can be moved to a CSS file or styled components)
const detailContainerStyle: React.CSSProperties = {
  padding: "20px",
  border: "1px solid #ccc",
  borderRadius: "8px",
  backgroundColor: "#f9f9f9",
  maxWidth: "900px", // Increased width for more details
  margin: "20px auto",
};

const headerStyle: React.CSSProperties = {
  borderBottom: "2px solid #eee",
  paddingBottom: "10px",
  marginBottom: "15px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const sectionTitleStyle: React.CSSProperties = {
  marginTop: "20px",
  marginBottom: "10px",
  fontSize: "1.3em",
  color: "#333",
  borderBottom: "1px solid #ddd",
  paddingBottom: "5px",
};

const detailItemStyle: React.CSSProperties = {
  marginBottom: "10px", // Increased spacing
  display: "flex",
  alignItems: "center", // Align items vertically
  flexWrap: "wrap", // Allow wrapping for smaller screens
};
const detailLabelStyle: React.CSSProperties = {
  fontWeight: "bold",
  minWidth: "230px", // Adjusted for longer labels
  marginRight: "10px",
};

const itemsTableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "10px",
};

const thTdStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  padding: "10px", // Increased padding
  textAlign: "left",
  verticalAlign: "top", // Align content to the top
};

const thStyle: React.CSSProperties = {
  ...thTdStyle,
  backgroundColor: "#f0f0f0",
  fontWeight: "bold",
};

const checkboxStyle: React.CSSProperties = {
  marginRight: "5px",
  transform: "scale(1.2)", // Slightly larger checkbox
};

function PurchaseBillDetail(): JSX.Element {
  const { billId } = useParams<{ billId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const bill = useAppSelector(selectCurrentPurchaseBill);
  const billFetchStatus = useAppSelector(selectCurrentPurchaseBillStatus);
  const billFetchError = useAppSelector(selectCurrentPurchaseBillError);

  const grnItemUpdateInProgress =
    useAppSelector(selectGrnItemUpdateStatus) === "loading";
  const grnHeaderUpdateInProgress =
    useAppSelector(selectGrnHeaderUpdateStatus) === "loading";
  // You can also get grnItemUpdateError and grnHeaderUpdateError to display specific errors

  // Effect for fetching data based on billId
  useEffect(() => {
    const numericBillId = billId ? parseInt(billId, 10) : undefined;
    if (numericBillId && !isNaN(numericBillId)) {
      if (
        billFetchStatus !== "loading" &&
        (!bill || bill.id !== numericBillId)
      ) {
        dispatch(fetchPurchaseBillById(numericBillId));
      }
    } else {
      dispatch(clearSelectedPurchaseBill());
    }
  }, [billId, dispatch, bill, billFetchStatus]);

  // Effect for cleanup ONLY when the component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearSelectedPurchaseBill());
    };
  }, [dispatch]);

  const handleGrnItemChange = (
    itemId: number,
    currentReceivedStatus: boolean
  ) => {
    if (grnItemUpdateInProgress) return; // Prevent multiple dispatches
    // For now, we'll just toggle the status. Remarks can be a separate input/modal.
    dispatch(
      updateGrnForItem({
        billItemId: itemId,
        received: !currentReceivedStatus,
        // remarks: currentRemarks // If you have a way to get remarks
      })
    );
  };

  const handleGrnHardcopyChange = (
    field: "grnHardcopyReceivedByPurchaser" | "grnHardcopyHandedToAccountant",
    currentValue: boolean
  ) => {
    if (bill && !grnHeaderUpdateInProgress) {
      // Ensure bill is loaded and not already updating
      const payload = {
        billId: bill.id,
        receivedByPurchaser: bill.grnHardcopyReceivedByPurchaser,
        handedToAccountant: bill.grnHardcopyHandedToAccountant,
      };
      if (field === "grnHardcopyReceivedByPurchaser") {
        payload.receivedByPurchaser = !currentValue;
      } else if (field === "grnHardcopyHandedToAccountant") {
        payload.handedToAccountant = !currentValue;
      }
      dispatch(updateGrnHardcopy(payload));
    }
  };

  if (billFetchStatus === "loading" || (billFetchStatus === "idle" && billId)) {
    return <p style={{ padding: "20px" }}>Loading purchase bill details...</p>;
  }

  if (billFetchError) {
    return (
      <div style={{ color: "red", padding: "20px" }}>
        <p>Error loading purchase bill: {billFetchError}</p>
        <Link to="/purchase-bills">Back to Purchase Bills List</Link>
      </div>
    );
  }

  if (!bill && billFetchStatus === "succeeded") {
    return (
      <div style={{ padding: "20px" }}>
        <p>Purchase bill not found.</p>
        <Link to="/purchase-bills">Back to Purchase Bills List</Link>
      </div>
    );
  }

  if (!bill) {
    return (
      <div style={{ padding: "20px" }}>
        <p>No bill selected or invalid ID.</p>
        <Link to="/purchase-bills">Back to Purchase Bills List</Link>
      </div>
    );
  }

  return (
    <div style={detailContainerStyle}>
      <div style={headerStyle}>
        <h1>Bill Details: #{bill.billNumber}</h1>
        <Link to="/purchase-bills" style={{ marginRight: "10px" }}>
          Back to List
        </Link>
      </div>
      <div style={sectionTitleStyle}>Header Information</div>
      <div style={detailItemStyle}>
        <span style={detailLabelStyle}>Bill Date:</span>{" "}
        {new Date(bill.billDate).toLocaleDateString()}
      </div>
      <div style={detailItemStyle}>
        <span style={detailLabelStyle}>Supplier:</span> {bill.supplier.name}
      </div>
      <div style={detailItemStyle}>
        <span style={detailLabelStyle}>Site:</span> {bill.site.name}
      </div>
      <div style={detailItemStyle}>
        <span style={detailLabelStyle}>Total Amount:</span>{" "}
        {bill.totalAmount.toLocaleString(undefined, {
          style: "currency",
          currency: "LKR",
        })}
      </div>{" "}
      {/* Example currency */}
      <div style={detailItemStyle}>
        <span style={detailLabelStyle}>Overall GRN Status:</span>{" "}
        <strong>{bill.overallGrnStatus}</strong>
      </div>
      <div style={detailItemStyle}>
        <span style={detailLabelStyle}>GRN Hardcopy Received (Purchaser):</span>
        <input
          type="checkbox"
          style={checkboxStyle}
          checked={bill.grnHardcopyReceivedByPurchaser}
          onChange={() =>
            handleGrnHardcopyChange(
              "grnHardcopyReceivedByPurchaser",
              bill.grnHardcopyReceivedByPurchaser
            )
          }
          disabled={grnHeaderUpdateInProgress}
        />
        {grnHeaderUpdateInProgress && (
          <span style={{ marginLeft: "5px", fontStyle: "italic" }}>
            Updating...
          </span>
        )}
      </div>
      <div style={detailItemStyle}>
        <span style={detailLabelStyle}>GRN Hardcopy to Accountant:</span>
        <input
          type="checkbox"
          style={checkboxStyle}
          checked={bill.grnHardcopyHandedToAccountant}
          onChange={() =>
            handleGrnHardcopyChange(
              "grnHardcopyHandedToAccountant",
              bill.grnHardcopyHandedToAccountant
            )
          }
          disabled={grnHeaderUpdateInProgress}
        />
      </div>
      {bill.billImagePath && (
        <div style={detailItemStyle}>
          <span style={detailLabelStyle}>Bill Image:</span>{" "}
          <a
            href={bill.billImagePath}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Image
          </a>
        </div>
      )}
      <div style={detailItemStyle}>
        <span style={detailLabelStyle}>Created At:</span>{" "}
        {new Date(bill.createdAt).toLocaleString()}
      </div>
      <div style={detailItemStyle}>
        <span style={detailLabelStyle}>Last Updated:</span>{" "}
        {new Date(bill.updatedAt).toLocaleString()}
      </div>
      <div style={sectionTitleStyle}>Bill Items ({bill.billItems.length})</div>
      <table style={itemsTableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Material Name</th>
            <th style={thStyle}>Category</th>
            <th style={thStyle}>Qty</th>
            <th style={thStyle}>Unit</th>
            <th style={thStyle}>Unit Price</th>
            <th style={thStyle}>Total Price</th>
            <th style={thStyle}>GRN Received</th>
            <th style={thStyle}>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {bill.billItems.map((item: BillItem_Ref) => (
            <tr key={item.id}>
              <td style={thTdStyle}>{item.masterMaterialName}</td>
              {/* Use masterMaterialName */}
              {/* --- THIS IS THE FIX --- */}
              <td style={thTdStyle}>{item.itemCategoryName}</td>
              {/* Change this from item.itemCategory.name */}
              {/* --- END OF FIX --- */}
              <td style={thTdStyle}>{item.quantity.toLocaleString()}</td>
              <td style={thTdStyle}>{item.unit}</td>
              <td style={thTdStyle}>
                {item.unitPrice.toLocaleString(undefined, {
                  style: "currency",
                  currency: "LKR",
                })}
              </td>
              <td style={thTdStyle}>
                {item.itemTotalPrice.toLocaleString(undefined, {
                  style: "currency",
                  currency: "LKR",
                })}
              </td>
              <td style={thTdStyle}>
                <input
                  type="checkbox"
                  style={checkboxStyle}
                  checked={item.grnReceivedForItem}
                  onChange={() =>
                    handleGrnItemChange(item.id, item.grnReceivedForItem)
                  }
                  disabled={grnItemUpdateInProgress}
                />
              </td>
              <td style={thTdStyle}>{item.remarks || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {grnItemUpdateInProgress && (
        <p style={{ fontStyle: "italic", marginTop: "10px" }}>
          Updating item GRN status...
        </p>
      )}
    </div>
  );
}

export default PurchaseBillDetail;
