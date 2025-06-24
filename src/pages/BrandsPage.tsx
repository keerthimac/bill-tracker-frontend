import React, { useState, useEffect, useRef, type JSX } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  fetchBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  selectAllBrands,
  selectBrandsStatus,
  selectBrandOperationStatus,
  selectBrandOperationError,
  resetOperationStatus,
  type Brand, // Import the Brand type
} from "../features/brands/brandsSlice";

// --- Import Icons ---
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";

// --- Type for Form Data ---
interface BrandFormData {
  name: string;
  description?: string;
  brandImagePath?: string;
}

const initialFormData: BrandFormData = {
  name: "",
  description: "",
  brandImagePath: "",
};

function BrandsPage(): JSX.Element {
  const dispatch = useAppDispatch();
  const modalRef = useRef<HTMLDialogElement>(null); // Ref for the daisyUI modal

  // --- Local State ---
  // The 'isModalOpen' state was removed as it was not being used.
  const [brandToEdit, setBrandToEdit] = useState<Brand | null>(null);
  const [formData, setFormData] = useState<BrandFormData>(initialFormData);

  // --- Redux Selectors ---
  const brands = useAppSelector(selectAllBrands);
  const fetchStatus = useAppSelector(selectBrandsStatus);
  const operationStatus = useAppSelector(selectBrandOperationStatus);
  const operationError = useAppSelector(selectBrandOperationError);

  // --- Effects ---
  // Fetch brands on initial load
  useEffect(() => {
    if (fetchStatus === "idle") {
      dispatch(fetchBrands());
    }
  }, [fetchStatus, dispatch]);

  // Handle closing the modal after a successful operation
  useEffect(() => {
    if (operationStatus === "succeeded") {
      closeModal();
      dispatch(resetOperationStatus());
    }
  }, [operationStatus, dispatch]);

  // --- Modal and Form Handlers ---
  const openModal = () => {
    modalRef.current?.showModal();
  };

  const closeModal = () => {
    modalRef.current?.close();
  };

  const handleAddNewClick = () => {
    setBrandToEdit(null);
    setFormData(initialFormData);
    dispatch(resetOperationStatus());
    openModal();
  };

  const handleEditClick = (brand: Brand) => {
    setBrandToEdit(brand);
    setFormData({
      name: brand.name,
      description: brand.description || "",
      brandImagePath: brand.brandImagePath || "",
    });
    dispatch(resetOperationStatus());
    openModal();
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (brandToEdit) {
      // Update existing brand
      await dispatch(updateBrand({ id: brandToEdit.id, ...formData }));
    } else {
      // Create new brand
      await dispatch(createBrand(formData));
    }
  };

  const handleDeleteClick = (brand: Brand) => {
    if (
      window.confirm(
        `Are you sure you want to delete the brand "${brand.name}"?`
      )
    ) {
      dispatch(deleteBrand(brand.id))
        .unwrap()
        .catch((err) => {
          alert(`Error: ${err.message || "Could not delete brand."}`);
        });
    }
  };

  // --- Render Logic ---
  let content;
  if (fetchStatus === "loading") {
    content = (
      <div className="flex justify-center p-4">
        <span className="loading loading-lg"></span>
      </div>
    );
  } else if (fetchStatus === "succeeded") {
    content = (
      <div className="overflow-x-auto">
        <table className="table w-full">
          {/* head */}
          <thead>
            <tr>
              <th>ID</th>
              <th>Brand Name</th>
              <th>Description</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((brand) => (
              <tr key={brand.id} className="hover">
                <td>{brand.id}</td>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      {/* <div className="mask mask-squircle w-12 h-12"> <img src={brand.brandImagePath} alt={brand.name} /> </div> */}
                    </div>
                    <div>
                      <div className="font-bold">{brand.name}</div>
                      {brand.brandImagePath && (
                        <div className="text-sm opacity-50">
                          {brand.brandImagePath}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td>{brand.description}</td>
                <th className="space-x-2 text-center">
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => handleEditClick(brand)}
                  >
                    <FiEdit /> Edit
                  </button>
                  <button
                    className="btn btn-ghost btn-xs text-error"
                    onClick={() => handleDeleteClick(brand)}
                  >
                    <FiTrash2 /> Delete
                  </button>
                </th>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  } else if (fetchStatus === "failed") {
    content = <p className="text-error">Error loading brands.</p>;
  }

  return (
    <div className="p-4">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manage Brands</h1>
        <button className="btn btn-primary" onClick={handleAddNewClick}>
          <FiPlus /> Add New Brand
        </button>
      </div>

      {/* Main Content (Table) */}
      {content}

      {/* daisyUI Modal for Add/Edit */}
      <dialog id="brand_modal" ref={modalRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">
            {brandToEdit ? "Edit Brand" : "Add New Brand"}
          </h3>
          <form onSubmit={handleFormSubmit} className="py-4">
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Brand Name</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="e.g., Holcim Cement"
                className="input input-bordered w-full"
                required
              />
            </div>
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                className="textarea textarea-bordered h-24 w-full"
                placeholder="Optional description..."
              ></textarea>
            </div>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Image Path/URL</span>
              </label>
              <input
                type="text"
                name="brandImagePath"
                value={formData.brandImagePath}
                onChange={handleFormChange}
                placeholder="/images/brand.png"
                className="input input-bordered w-full"
              />
            </div>

            {operationStatus === "failed" && (
              <p className="text-error mt-2">{operationError}</p>
            )}

            <div className="modal-action mt-6">
              <button
                type="button"
                className="btn"
                onClick={closeModal}
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
                )}
                Save
              </button>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}

export default BrandsPage;