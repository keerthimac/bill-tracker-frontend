import { type JSX } from "react";
import { Link } from "react-router-dom";
import PurchaseBillList from "../features/purchaseBills/PurchaseBillList";
import { FiPlus } from "react-icons/fi";

function PurchaseBillsPage(): JSX.Element {
  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Purchase Bills</h1>
        <Link to="/purchase-bills/add" className="btn btn-primary">
          <FiPlus /> Add New Bill
        </Link>
      </div>
      <PurchaseBillList />
    </div>
  );
}

export default PurchaseBillsPage;
