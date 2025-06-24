import React, { useState, useEffect,  type JSX } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";

// --- Redux Imports ---
import {
  fetchMasterMaterials,
  createMasterMaterial,
  updateMasterMaterial,
  deleteMasterMaterial,
  selectAllMasterMaterials,
  selectMasterMaterialsStatus,
  selectMasterMaterialOperationStatus,
  selectMasterMaterialOperationError,
  resetOperationStatus,
  type MasterMaterial,
  type NewMasterMaterialData,
} from "../features/masterMaterials/masterMaterialsSlice";
import {
  fetchItemCategories,
  selectAllItemCategories,
} from "../features/itemCategories/itemCategoriesSlice";
import { fetchBrands, selectAllBrands } from "../features/brands/brandsSlice";

// --- Icon Imports ---
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";

// --- Reusable Modal Component ---
import Modal from "../components/common/Modal";

// --- Type for Form Data ---
interface MaterialFormData {
  name: string;
  materialCode: string;
  description: string;
  defaultUnit: string;
  itemCategoryId: string;
  brandId: string;
}

const initialFormData: MaterialFormData = {
  name: "",
  materialCode: "",
  description: "",
  defaultUnit: "",
  itemCategoryId: "",
  brandId: "",
};

function MasterMaterialsPage(): JSX.Element {
  const dispatch = useAppDispatch();

  // --- Local State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [materialToEdit, setMaterialToEdit] = useState<MasterMaterial | null>(
    null
  );
  const [formData, setFormData] = useState<MaterialFormData>(initialFormData);

  // --- Redux Selectors ---
  const materials = useAppSelector(selectAllMasterMaterials);
  const fetchStatus = useAppSelector(selectMasterMaterialsStatus);
  const operationStatus = useAppSelector(selectMasterMaterialOperationStatus);
  const operationError = useAppSelector(selectMasterMaterialOperationError);
  const itemCategories = useAppSelector(selectAllItemCategories);
  const brands = useAppSelector(selectAllBrands);

  // --- Effects ---
  // Fetch all necessary data on initial load
  useEffect(() => {
    dispatch(fetchMasterMaterials());
    dispatch(fetchItemCategories());
    dispatch(fetchBrands());
  }, [dispatch]);

  // Close modal after a successful operation
  useEffect(() => {
    if (operationStatus === "succeeded") {
      setIsModalOpen(false);
      dispatch(resetOperationStatus());
    }
  }, [operationStatus, dispatch]);

  // --- Event Handlers (REVISED LOGIC) ---
  const handleAddNewClick = () => {
    setMaterialToEdit(null);
    setFormData(initialFormData); // Set form to blank for adding
    dispatch(resetOperationStatus());
    setIsModalOpen(true);
  };

  const handleEditClick = (material: MasterMaterial) => {
    setMaterialToEdit(material);
    // Pre-populate form with data of the material to edit
    setFormData({
      name: material.name,
      materialCode: material.materialCode || "",
      description: material.description || "",
      defaultUnit: material.defaultUnit,
      itemCategoryId: String(material.itemCategory.id),
      brandId: String(material.brand?.id || ""),
    });
    dispatch(resetOperationStatus());
    setIsModalOpen(true);
  };

  const handleDeleteClick = (material: MasterMaterial) => {
    if (window.confirm(`Are you sure you want to delete "${material.name}"?`)) {
      dispatch(deleteMasterMaterial(material.id))
        .unwrap()
        .catch((err) => alert(`Error: ${err}`));
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const canSave =
      formData.name && formData.defaultUnit && formData.itemCategoryId;
    if (!canSave) {
      alert(
        "Please fill all required fields: Name, Default Unit, and Item Category."
      );
      return;
    }

    const payload: NewMasterMaterialData = {
      name: formData.name,
      defaultUnit: formData.defaultUnit,
      itemCategoryId: parseInt(formData.itemCategoryId),
      materialCode: formData.materialCode || undefined,
      description: formData.description || undefined,
      brandId: formData.brandId ? parseInt(formData.brandId) : null,
    };

    if (materialToEdit) {
      await dispatch(
        updateMasterMaterial({ id: materialToEdit.id, ...payload })
      );
    } else {
      await dispatch(createMasterMaterial(payload));
    }
  };

  // --- Render Logic ---
  // (This part remains the same: loading indicator, table rendering, etc.)
  let tableContent;
  if (fetchStatus === "loading") {
    tableContent = (
      <tr>
        <td colSpan={7} className="text-center">
          <span className="loading loading-lg"></span>
        </td>
      </tr>
    );
  } else if (fetchStatus === "succeeded") {
    tableContent = materials.map((material) => (
      <tr key={material.id} className="hover">
        <td>{material.id}</td>
        <td>{material.materialCode || "-"}</td>
        <td>
          <div className="font-bold">{material.name}</div>
        </td>
        <td>{material.defaultUnit}</td>
        <td>{material.itemCategory.name}</td>
        <td>{material.brand?.name || "N/A"}</td>
        <td className="space-x-2 text-center">
          <button
            className="btn btn-ghost btn-xs"
            onClick={() => handleEditClick(material)}
          >
            <FiEdit /> Edit
          </button>
          <button
            className="btn btn-ghost btn-xs text-error"
            onClick={() => handleDeleteClick(material)}
          >
            <FiTrash2 /> Delete
          </button>
        </td>
      </tr>
    ));
  } else {
    tableContent = (
      <tr>
        <td colSpan={7} className="text-center text-error">
          Failed to load materials.
        </td>
      </tr>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Master Materials</h1>
        <button className="btn btn-primary" onClick={handleAddNewClick}>
          <FiPlus /> Add New Material
        </button>
      </div>

      <div className="overflow-x-auto bg-base-100 shadow-xl rounded-lg">
        <table className="table w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Code</th>
              <th>Name</th>
              <th>Unit</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>{tableContent}</tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          materialToEdit ? "Edit Master Material" : "Add New Master Material"
        }
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Form Inputs */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Material Name</span>
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
              <span className="label-text">Material Code</span>
            </label>
            <input
              type="text"
              name="materialCode"
              value={formData.materialCode}
              onChange={handleFormChange}
              className="input input-bordered w-full"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Default Unit</span>
            </label>
            <input
              type="text"
              name="defaultUnit"
              value={formData.defaultUnit}
              onChange={handleFormChange}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              className="textarea textarea-bordered h-24 w-full"
            ></textarea>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Item Category</span>
            </label>
            <select
              name="itemCategoryId"
              value={formData.itemCategoryId}
              onChange={handleFormChange}
              className="select select-bordered"
              required
            >
              <option value="" disabled>
                Select a Category
              </option>
              {itemCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Brand (Optional)</span>
            </label>
            <select
              name="brandId"
              value={formData.brandId}
              onChange={handleFormChange}
              className="select select-bordered"
            >
              <option value="">Select a Brand</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
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
              )}
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default MasterMaterialsPage;
