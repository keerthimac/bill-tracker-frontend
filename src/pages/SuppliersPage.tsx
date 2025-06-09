import React, { useState, useEffect, type JSX } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import Modal from "../components/common/Modal";

// --- Redux & Icon Imports ---
import {
  fetchSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  selectAllSuppliers,
  selectSuppliersStatus,
  selectSupplierOperationStatus,
  selectSupplierOperationError,
  resetOperationStatus,
  type Supplier,
} from "../features/suppliers/suppliersSlice";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";

// --- Type for Form Data ---
interface SupplierFormData {
  name: string;
  contactPerson: string;
  contactNumber: string;
  email: string;
  address: string;
}

const initialFormData: SupplierFormData = {
  name: "",
  contactPerson: "",
  contactNumber: "",
  email: "",
  address: "",
};

function SuppliersPage(): JSX.Element {
  const dispatch = useAppDispatch();

  // --- Local State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState<SupplierFormData>(initialFormData);

  // --- Redux Selectors ---
  const suppliers = useAppSelector(selectAllSuppliers);
  const fetchStatus = useAppSelector(selectSuppliersStatus);
  const operationStatus = useAppSelector(selectSupplierOperationStatus);
  const operationError = useAppSelector(selectSupplierOperationError);

  // --- Effects ---
  useEffect(() => {
    if (fetchStatus === "idle") {
      dispatch(fetchSuppliers());
    }
  }, [fetchStatus, dispatch]);

  useEffect(() => {
    // Close modal and reset status after a successful operation
    if (operationStatus === "succeeded") {
      setIsModalOpen(false);
      dispatch(resetOperationStatus());
    }
  }, [operationStatus, dispatch]);

  useEffect(() => {
    // Pre-populate the form when editing a supplier
    if (supplierToEdit) {
      setFormData({
        name: supplierToEdit.name,
        contactPerson: supplierToEdit.contactPerson || "",
        contactNumber: supplierToEdit.contactNumber || "",
        email: supplierToEdit.email || "",
        address: supplierToEdit.address || "",
      });
    } else {
      // Reset form when adding a new supplier
      setFormData(initialFormData);
    }
  }, [supplierToEdit]);

  // --- Event Handlers ---
  const handleAddNewClick = () => {
    setSupplierToEdit(null);
    dispatch(resetOperationStatus());
    setIsModalOpen(true);
  };

  const handleEditClick = (supplier: Supplier) => {
    setSupplierToEdit(supplier);
    dispatch(resetOperationStatus());
    setIsModalOpen(true);
  };

  const handleDeleteClick = (supplier: Supplier) => {
    if (
      window.confirm(
        `Are you sure you want to delete supplier "${supplier.name}"?`
      )
    ) {
      dispatch(deleteSupplier(supplier.id))
        .unwrap()
        .catch((err) => {
          // Display error from backend (e.g., if supplier is in use)
          alert(`Error: ${err}`);
        });
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = { ...formData };
    if (supplierToEdit) {
      await dispatch(updateSupplier({ id: supplierToEdit.id, ...payload }));
    } else {
      await dispatch(createSupplier(payload));
    }
  };

  // --- Render Logic ---
  let tableContent;
  if (fetchStatus === "loading") {
    tableContent = (
      <tr>
        <td colSpan={5} className="text-center">
          <span className="loading loading-lg"></span>
        </td>
      </tr>
    );
  } else if (fetchStatus === "succeeded") {
    tableContent = suppliers.map((supplier) => (
      <tr key={supplier.id} className="hover">
        <td className="font-bold">{supplier.name}</td>
        <td>{supplier.contactPerson || "-"}</td>
        <td>{supplier.contactNumber || "-"}</td>
        <td>{supplier.email || "-"}</td>
        <td className="space-x-2">
          <button
            className="btn btn-ghost btn-xs"
            onClick={() => handleEditClick(supplier)}
          >
            <FiEdit /> Edit
          </button>
          <button
            className="btn btn-ghost btn-xs text-error"
            onClick={() => handleDeleteClick(supplier)}
          >
            <FiTrash2 /> Delete
          </button>
        </td>
      </tr>
    ));
  } else {
    tableContent = (
      <tr>
        <td colSpan={5} className="text-center text-error">
          Failed to load suppliers.
        </td>
      </tr>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Suppliers</h1>
        <button className="btn btn-primary" onClick={handleAddNewClick}>
          <FiPlus /> Add New Supplier
        </button>
      </div>

      <div className="overflow-x-auto bg-base-100 shadow-xl rounded-lg">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact Person</th>
              <th>Contact Number</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>{tableContent}</tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={supplierToEdit ? "Edit Supplier" : "Add New Supplier"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Supplier Name</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Contact Person</span>
            </label>
            <input
              type="text"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleFormChange}
              className="input input-bordered w-full"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Contact Number</span>
            </label>
            <input
              type="text"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleFormChange}
              className="input input-bordered w-full"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleFormChange}
              className="input input-bordered w-full"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Address</span>
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleFormChange}
              className="textarea textarea-bordered h-24 w-full"
            ></textarea>
          </div>

          {operationStatus === "failed" && (
            <p className="text-error mt-2">{operationError}</p>
          )}

          <div className="modal-action mt-6 pt-4 border-t">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setIsModalOpen(false)}
              disabled={operationStatus === "loading"}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={operationStatus === "loading"}
            >
              {operationStatus === "loading" && (
                <span className="loading loading-spinner"></span>
              )}{" "}
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default SuppliersPage;
