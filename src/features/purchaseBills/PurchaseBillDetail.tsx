import React, { useEffect, type JSX } from "react";
import { useParams, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";

// --- Redux Imports ---
import {
  fetchPurchaseBillById,
  updateGrnForItem,
  updateGrnHardcopy,
  selectCurrentPurchaseBill,
  selectCurrentPurchaseBillStatus,
  selectCurrentPurchaseBillError,
  clearSelectedPurchaseBill,
  selectGrnItemUpdateStatus,
  selectGrnHeaderUpdateStatus,
  type BillItem_Ref, // Assuming this type is exported from your slice
} from "./purchaseBillsSlice";

// --- Icon Imports ---
import { FiArrowLeft } from "react-icons/fi";

function PurchaseBillDetail(): JSX.Element {
  const { billId } = useParams<{ billId: string }>();
  const dispatch = useAppDispatch();

  // --- Redux Selectors ---
  const bill = useAppSelector(selectCurrentPurchaseBill);
  const billFetchStatus = useAppSelector(selectCurrentPurchaseBillStatus);
  const billFetchError = useAppSelector(selectCurrentPurchaseBillError);
  const grnItemUpdateInProgress =
    useAppSelector(selectGrnItemUpdateStatus) === "loading";
  const grnHeaderUpdateInProgress =
    useAppSelector(selectGrnHeaderUpdateStatus) === "loading";

  // --- Effects ---
  useEffect(() => {
    if (billId) {
      const numericBillId = parseInt(billId, 10);
      if (!isNaN(numericBillId)) {
        dispatch(fetchPurchaseBillById(numericBillId));
      }
    }
    // Cleanup function to clear the selected bill when the component unmounts
    return () => {
      dispatch(clearSelectedPurchaseBill());
    };
  }, [billId, dispatch]);

  // --- Event Handlers (no changes to logic) ---
  const handleGrnItemChange = (
    itemId: number,
    currentReceivedStatus: boolean
  ) => {
    if (grnItemUpdateInProgress) return;
    dispatch(
      updateGrnForItem({ billItemId: itemId, received: !currentReceivedStatus })
    );
  };

  const handleGrnHardcopyChange = (
    // The field name corresponds to the property on the `bill` object
    field: "grnHardcopyReceivedByPurchaser" | "grnHardcopyHandedToAccountant",
    currentValue: boolean
  ) => {
    if (bill && !grnHeaderUpdateInProgress) {
      // First, create a payload that matches the expected UpdateGrnHardcopyPayload
      const payload = {
        billId: bill.id,
        receivedByPurchaser: bill.grnHardcopyReceivedByPurchaser,
        handedToAccountant: bill.grnHardcopyHandedToAccountant,
      };

      // Then, use an if/else if block to modify the correct property on the payload
      if (field === "grnHardcopyReceivedByPurchaser") {
        payload.receivedByPurchaser = !currentValue;
      } else if (field === "grnHardcopyHandedToAccountant") {
        payload.handedToAccountant = !currentValue;
      }

      // Dispatch the correctly typed payload
      dispatch(updateGrnHardcopy(payload));
    }
  };

  if (billFetchError) {
    return (
      <div className="alert alert-error">
        <div>
          <span>Error loading purchase bill: {billFetchError}</span>
        </div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold">Purchase Bill Not Found</h2>
        <Link to="/purchase-bills" className="btn btn-primary mt-4">
          Return to List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link to="/purchase-bills" className="btn btn-ghost btn-square">
          <FiArrowLeft className="text-xl" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Purchase Bill Details</h1>
          <div className="text-sm breadcrumbs">
            <ul>
              <li>
                <Link to="/purchase-bills">Purchase Bills</Link>
              </li>
              <li>{bill.billNumber}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bill Header Info Card */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-primary">Bill #{bill.billNumber}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 mt-4">
            <div>
              <strong>Supplier:</strong> {bill.supplier.name}
            </div>
            <div>
              <strong>Site:</strong> {bill.site.name}
            </div>
            <div>
              <strong>Bill Date:</strong>{" "}
              {new Date(bill.billDate).toLocaleDateString()}
            </div>
            <div>
              <strong>Total Amount:</strong>{" "}
              <span className="font-semibold">
                {bill.totalAmount.toLocaleString(undefined, {
                  style: "currency",
                  currency: "LKR",
                })}
              </span>
            </div>
            <div>
              <strong>Overall GRN Status:</strong>{" "}
              <span className="badge badge-lg">{bill.overallGrnStatus}</span>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={bill.grnHardcopyReceivedByPurchaser}
                  onChange={() =>
                    handleGrnHardcopyChange(
                      "grnHardcopyReceivedByPurchaser",
                      bill.grnHardcopyReceivedByPurchaser
                    )
                  }
                  disabled={grnHeaderUpdateInProgress}
                />
                <span className="label-text">GRN Hardcopy Received</span>
              </label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={bill.grnHardcopyHandedToAccountant}
                  onChange={() =>
                    handleGrnHardcopyChange(
                      "grnHardcopyHandedToAccountant",
                      bill.grnHardcopyHandedToAccountant
                    )
                  }
                  disabled={grnHeaderUpdateInProgress}
                />
                <span className="label-text">Handed to Accountant</span>
              </label>
            </div>
            {grnHeaderUpdateInProgress && (
              <div className="text-sm italic text-info col-span-full">
                Updating status...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bill Items Card */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Bill Items ({bill.billItems.length})</h2>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Material Name</th>
                  <th>Category</th>
                  <th className="text-right">Qty</th>
                  <th>Unit</th>
                  <th className="text-right">Unit Price</th>
                  <th className="text-right">Total Price</th>
                  <th className="text-center">GRN Received</th>
                </tr>
              </thead>
              <tbody>
                {bill.billItems.map((item: BillItem_Ref) => (
                  <tr key={item.id} className="hover">
                    <td>{item.masterMaterialName}</td>
                    <td>{item.itemCategoryName}</td>
                    <td className="text-right">
                      {item.quantity.toLocaleString()}
                    </td>
                    <td>{item.unit}</td>
                    <td className="text-right">
                      {item.unitPrice.toLocaleString(undefined, {
                        style: "currency",
                        currency: "LKR",
                      })}
                    </td>
                    <td className="text-right font-semibold">
                      {item.itemTotalPrice.toLocaleString(undefined, {
                        style: "currency",
                        currency: "LKR",
                      })}
                    </td>
                    <td className="text-center">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-accent"
                        checked={item.grnReceivedForItem}
                        onChange={() =>
                          handleGrnItemChange(item.id, item.grnReceivedForItem)
                        }
                        disabled={grnItemUpdateInProgress}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {grnItemUpdateInProgress && (
              <div className="text-sm italic text-info text-center mt-2">
                Updating item GRN status...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PurchaseBillDetail;
