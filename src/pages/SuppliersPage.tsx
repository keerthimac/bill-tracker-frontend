import { type JSX } from "react";
import SupplierList from "../features/suppliers/SupplierList";
import AddSupplierForm from "../features/suppliers/AddSupplierForm";

function SuppliersPage(): JSX.Element {
  return (
    <div>
      <h2>Manage Suppliers</h2>
      <AddSupplierForm />
      <hr style={{ margin: "20px 0" }} />
      <SupplierList />
    </div>
  );
}
export default SuppliersPage;
