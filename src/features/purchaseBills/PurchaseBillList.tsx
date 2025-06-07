import React, { useEffect, type JSX } from "react";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { Link } from "react-router-dom";
import {
  fetchPurchaseBills,
  selectAllPurchaseBills,
  selectPurchaseBillsStatus,
  selectPurchaseBillsError,
} from "./purchaseBillsSlice";

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

  if (status === "loading") {
    return (
      <div className="flex justify-center p-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="alert alert-error">
        <div>
          <span>Error loading purchase bills: {error}</span>
        </div>
      </div>
    );
  }

  if (status === "succeeded" && (!bills || bills.length === 0)) {
    return (
      <div className="text-center p-4 bg-base-200 rounded-md">
        No purchase bills found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-base-100 shadow-xl rounded-lg">
      <table className="table w-full table-zebra">
        <thead>
          <tr>
            <th>Bill Number</th>
            <th>Date</th>
            <th>Supplier</th>
            <th>Site</th>
            <th className="text-right">Total Amount</th>
            <th>GRN Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bills.map((bill) => (
            <tr key={bill.id} className="hover">
              <td className="font-semibold">{bill.billNumber}</td>
              <td>{new Date(bill.billDate).toLocaleDateString()}</td>
              <td>{bill.supplier.name}</td>
              <td>{bill.site.name}</td>
              <td className="text-right">
                {bill.totalAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </td>
              <td>
                <span className="badge badge-ghost badge-sm">
                  {bill.overallGrnStatus}
                </span>
              </td>
              <td>
                <Link
                  to={`/purchase-bills/${bill.id}`}
                  className="btn btn-ghost btn-xs"
                >
                  View Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PurchaseBillList;
