import React, { useState, useEffect, type JSX } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  createSupplier,
  // Corrected: Using the unified status selectors and reset action from the slice
  selectSupplierOperationStatus,
  selectSupplierOperationError,
  resetOperationStatus,
} from "./suppliersSlice";
import type { NewSupplierData } from "./suppliersSlice"; // Good practice to import the type

function AddSupplierForm(): JSX.Element {
  const dispatch = useAppDispatch();

  // --- Component State ---
  const initialFormState: NewSupplierData = {
    name: "",
    contactPerson: "",
    contactNumber: "",
    email: "",
    address: "",
  };
  const [formData, setFormData] = useState<NewSupplierData>(initialFormState);

  // --- Redux State ---
  // Corrected: Selecting the unified status and error from the Redux store
  const operationStatus = useAppSelector(selectSupplierOperationStatus);
  const operationError = useAppSelector(selectSupplierOperationError);

  // --- Derived State & Event Handlers ---
  const canSave = formData.name.trim() !== "";

  // Effect to reset the operation status when the component unmounts.
  // This prevents showing a stale "Success" or "Error" message if the user re-visits the form.
  useEffect(() => {
    return () => {
      dispatch(resetOperationStatus());
    };
  }, [dispatch]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSave) {
      try {
        await dispatch(createSupplier(formData)).unwrap();
        // --- Success Case ---
        setFormData(initialFormState); // Clear form fields
        // The operationStatus is now 'succeeded', which will show the success message.
        // The useEffect cleanup hook will handle resetting the status later.
      } catch (err) {
        // --- Error Case ---
        console.error("Failed to save the supplier: ", err);
        // The UI will automatically display the `operationError` from the Redux state.
      }
    }
  };

  // --- Render Logic ---
  return (
    <div>
      <h3>Add New Supplier</h3>
      <form onSubmit={handleSubmit}>
        {/* Input fields for supplier data */}
        <div>
          <label htmlFor="supplierName">Supplier Name:</label>
          <input
            type="text"
            id="supplierName"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="contactPerson">Contact Person:</label>
          <input
            type="text"
            id="contactPerson"
            name="contactPerson"
            value={formData.contactPerson}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="contactNumber">Contact Number:</label>
          <input
            type="text"
            id="contactNumber"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="address">Address:</label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          disabled={!canSave || operationStatus === "loading"}
        >
          {operationStatus === "loading" ? "Saving..." : "Add Supplier"}
        </button>

        {/* --- Feedback Messages --- */}
        {operationStatus === "succeeded" && (
          <p style={{ color: "green" }}>Supplier added successfully!</p>
        )}
        {operationStatus === "failed" && operationError && (
          <p style={{ color: "red" }}>Error: {operationError}</p>
        )}
      </form>
    </div>
  );
}

export default AddSupplierForm;