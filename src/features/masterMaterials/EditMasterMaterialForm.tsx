import React, { useState, useEffect, type JSX } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  updateMasterMaterial,
  selectMasterMaterialById,
  selectMasterMaterialOperationStatus,
  selectMasterMaterialOperationError,
  resetOperationStatus,
} from "./masterMaterialsSlice";
import { selectAllItemCategories } from "../itemCategories/itemCategoriesSlice";
import { selectAllBrands } from "../brands/brandsSlice";
import type { RootState } from "../../app/store";

function EditMasterMaterialForm(): JSX.Element {
  const { materialId } = useParams<{ materialId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const numericMaterialId = materialId ? parseInt(materialId, 10) : undefined;

  // Selectors
  const materialToEdit = useAppSelector((state: RootState) =>
    numericMaterialId
      ? selectMasterMaterialById(state, numericMaterialId)
      : undefined
  );
  const itemCategories = useAppSelector(selectAllItemCategories);
  const brands = useAppSelector(selectAllBrands);
  const operationStatus = useAppSelector(selectMasterMaterialOperationStatus);
  const operationError = useAppSelector(selectMasterMaterialOperationError);

  // Form State
  const [name, setName] = useState("");
  const [materialCode, setMaterialCode] = useState("");
  const [description, setDescription] = useState("");
  const [defaultUnit, setDefaultUnit] = useState("");
  const [itemCategoryId, setItemCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");

  useEffect(() => {
    // Pre-populate form when material data is loaded from store
    if (materialToEdit) {
      setName(materialToEdit.name);
      setMaterialCode(materialToEdit.materialCode || "");
      setDescription(materialToEdit.description || "");
      setDefaultUnit(materialToEdit.defaultUnit);
      setItemCategoryId(String(materialToEdit.itemCategory.id));
      setBrandId(String(materialToEdit.brand?.id || ""));
    }
    dispatch(resetOperationStatus());
  }, [materialToEdit, dispatch]);

  const canSave =
    name.trim() !== "" &&
    defaultUnit.trim() !== "" &&
    itemCategoryId !== "" &&
    operationStatus !== "loading";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSave && numericMaterialId) {
      try {
        await dispatch(
          updateMasterMaterial({
            id: numericMaterialId,
            name,
            materialCode,
            description,
            defaultUnit,
            itemCategoryId: parseInt(itemCategoryId),
            brandId: brandId ? parseInt(brandId) : null,
          })
        ).unwrap();

        alert("Master Material updated successfully!");
        navigate("/master-materials");
      } catch (err) {
        console.error("Failed to update master material:", err);
      }
    }
  };

  if (!materialToEdit) {
    return <div>Loading material details...</div>;
  }

  return (
    <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto">
      <div className="card-body">
        <h2 className="card-title">
          Edit Master Material (ID: {numericMaterialId})
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* The JSX for the form inputs is identical to AddMasterMaterialForm */}
          {/* ... (copy the form inputs from AddMasterMaterialForm here) ... */}
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
              Update Material
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditMasterMaterialForm;
