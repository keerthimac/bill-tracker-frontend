import React, { useState, type JSX } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  createSupplier,
  selectCreateSupplierStatus,
  selectCreateSupplierError,
} from "./suppliersSlice";

interface NewSupplierData {
  // Mirroring the slice's input type
  name: string;
  contactPerson?: string;
  contactNumber?: string;
  email?: string;
  address?: string;
}

function AddSupplierForm(): JSX.Element {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState<NewSupplierData>({
    name: "",
    contactPerson: "",
    contactNumber: "",
    email: "",
    address: "",
  });
  const createStatus = useAppSelector(selectCreateSupplierStatus);
  const createError = useAppSelector(selectCreateSupplierError);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const canSave = formData.name.trim() !== "";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSave) {
      try {
        await dispatch(createSupplier(formData)).unwrap();
        setFormData({
          name: "",
          contactPerson: "",
          contactNumber: "",
          email: "",
          address: "",
        }); // Clear form
        // alert('Supplier created successfully!');
      } catch (err) {
        console.error("Failed to save the supplier: ", err);
      }
    }
  };

  return (
    <div>
      <h3>Add New Supplier</h3>
      <form onSubmit={handleSubmit}>
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
        <button type="submit" disabled={!canSave || createStatus === "loading"}>
          {createStatus === "loading" ? "Saving..." : "Add Supplier"}
        </button>
        {createStatus === "failed" && createError && (
          <p style={{ color: "red" }}>Error: {createError}</p>
        )}
      </form>
    </div>
  );
}

export default AddSupplierForm;
