import React, { useState, useEffect, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  createMasterMaterial,
  selectMasterMaterialOperationStatus,
  selectMasterMaterialOperationError,
  resetOperationStatus,
} from "./masterMaterialsSlice";
import {
  fetchItemCategories,
  selectAllItemCategories,
} from "../itemCategories/itemCategoriesSlice";
import { fetchBrands, selectAllBrands } from "../brands/brandsSlice";

function AddMasterMaterialForm(): JSX.Element {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [materialCode, setMaterialCode] = useState("");
  const [description, setDescription] = useState("");
  const [defaultUnit, setDefaultUnit] = useState("");
  const [itemCategoryId, setItemCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");

  const operationStatus = useAppSelector(selectMasterMaterialOperationStatus);
  const operationError = useAppSelector(selectMasterMaterialOperationError);
  const itemCategories = useAppSelector(selectAllItemCategories);
  const brands = useAppSelector(selectAllBrands);

  useEffect(() => {
    dispatch(fetchItemCategories());
    dispatch(fetchBrands());
    // Reset status when component mounts
    dispatch(resetOperationStatus());
  }, [dispatch]);

  const canSave =
    name.trim() !== "" &&
    defaultUnit.trim() !== "" &&
    itemCategoryId !== "" &&
    operationStatus !== "loading";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSave) {
      try {
        await dispatch(
          createMasterMaterial({
            name,
            materialCode: materialCode || undefined,
            description: description || undefined,
            defaultUnit,
            itemCategoryId: parseInt(itemCategoryId),
            brandId: brandId ? parseInt(brandId) : null,
          })
        ).unwrap();

        alert("Master Material created successfully!");
        navigate("/master-materials");
      } catch (err: any) {
        // Error is handled by the selector and displayed below
        console.error("Failed to save master material:", err);
      }
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto">
      <div className="card-body">
        <h2 className="card-title">Add New Master Material</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Form Inputs */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Material Name</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              value={materialCode}
              onChange={(e) => setMaterialCode(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Default Unit</span>
            </label>
            <input
              type="text"
              value={defaultUnit}
              onChange={(e) => setDefaultUnit(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea textarea-bordered h-24 w-full"
            ></textarea>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Item Category</span>
            </label>
            <select
              value={itemCategoryId}
              onChange={(e) => setItemCategoryId(e.target.value)}
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
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
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

          <div className="card-actions justify-end mt-4">
            <button
              type="button"
              onClick={() => navigate("/master-materials")}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!canSave}
            >
              {operationStatus === "loading" && (
                <span className="loading loading-spinner"></span>
              )}
              Save Material
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddMasterMaterialForm;
