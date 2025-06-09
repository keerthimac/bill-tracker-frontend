import React, { useState, useEffect, type JSX } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import Modal from "../components/common/Modal";

// --- Icon Imports ---
import { FiEdit, FiPlus, FiPower } from "react-icons/fi";

// --- Redux Imports ---
import {
  fetchPricesBySupplier,
  addSupplierPrice,
  updateSupplierPrice,
  deactivateSupplierPrice,
  clearSupplierPrices,
  resetOperationStatus,
  selectPricesForSupplier,
  selectPricesFetchStatus,
  selectPricesOperationStatus,
  selectPricesOperationError,
  type SupplierPrice,
} from "../features/supplierPrices/supplierPricesSlice";
import {
  fetchSuppliers,
  selectAllSuppliers,
} from "../features/suppliers/suppliersSlice";
import {
  fetchMasterMaterials,
  selectAllMasterMaterials,
} from "../features/masterMaterials/masterMaterialsSlice";

// --- Type for Form Data ---
interface PriceFormData {
  masterMaterialId: string;
  price: string;
  unit: string;
  effectiveFromDate: string;
  effectiveToDate: string;
  isActive: boolean;
}

const initialFormData: PriceFormData = {
  masterMaterialId: "",
  price: "",
  unit: "",
  effectiveFromDate: new Date().toISOString().split("T")[0],
  effectiveToDate: "",
  isActive: true,
};

function SupplierPricesPage(): JSX.Element {
  const dispatch = useAppDispatch();

  // --- Local State ---
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [priceToEdit, setPriceToEdit] = useState<SupplierPrice | null>(null);
  const [formData, setFormData] = useState<PriceFormData>(initialFormData);

  // --- Redux Selectors ---
  const prices = useAppSelector(selectPricesForSupplier);
  const fetchStatus = useAppSelector(selectPricesFetchStatus);
  const operationStatus = useAppSelector(selectPricesOperationStatus);
  const operationError = useAppSelector(selectPricesOperationError);
  const suppliers = useAppSelector(selectAllSuppliers);
  const masterMaterials = useAppSelector(selectAllMasterMaterials);

  // --- Effects ---
  useEffect(() => {
    dispatch(fetchSuppliers());
    dispatch(fetchMasterMaterials());
  }, [dispatch]);

  useEffect(() => {
    if (selectedSupplierId) {
      dispatch(fetchPricesBySupplier(parseInt(selectedSupplierId)));
    } else {
      dispatch(clearSupplierPrices());
    }
  }, [selectedSupplierId, dispatch]);

  useEffect(() => {
    if (operationStatus === "succeeded") {
      setIsModalOpen(false);
      if (selectedSupplierId) {
        dispatch(fetchPricesBySupplier(parseInt(selectedSupplierId)));
      }
      dispatch(resetOperationStatus());
    }
  }, [operationStatus, dispatch, selectedSupplierId]);

  useEffect(() => {
    if (priceToEdit) {
      setFormData({
        masterMaterialId: String(priceToEdit.masterMaterial.id),
        price: String(priceToEdit.price),
        unit: priceToEdit.unit,
        effectiveFromDate: priceToEdit.effectiveFromDate,
        effectiveToDate: priceToEdit.effectiveToDate || "",
        isActive: priceToEdit.isActive,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [priceToEdit]);

  // --- Event Handlers ---
  const handleAddNewClick = () => {
    setPriceToEdit(null);
    dispatch(resetOperationStatus());
    setIsModalOpen(true);
  };
  const handleEditClick = (price: SupplierPrice) => {
    setPriceToEdit(price);
    dispatch(resetOperationStatus());
    setIsModalOpen(true);
  };
  const handleDeactivateClick = (price: SupplierPrice) => {
    if (
      window.confirm(
        `Are you sure you want to deactivate the price for "${price.masterMaterial.name}"?`
      )
    ) {
      dispatch(deactivateSupplierPrice(price.id));
    }
  };
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === "checkbox";
    setFormData({
      ...formData,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = {
      supplierId: parseInt(selectedSupplierId),
      masterMaterialId: parseInt(formData.masterMaterialId),
      price: parseFloat(formData.price),
      unit: formData.unit,
      effectiveFromDate: formData.effectiveFromDate,
      effectiveToDate: formData.effectiveToDate || null,
      isActive: formData.isActive,
    };
    if (priceToEdit) {
      await dispatch(updateSupplierPrice({ id: priceToEdit.id, ...payload }));
    } else {
      await dispatch(addSupplierPrice(payload));
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Manage Supplier Prices</h1>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="form-control w-full md:w-1/2 lg:w-1/3">
            <label className="label">
              <span className="label-text font-semibold">
                Select a Supplier to Manage Prices
              </span>
            </label>
            <select
              className="select select-bordered"
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
            >
              <option value="">-- View Prices For... --</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedSupplierId && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title">
                Price List for{" "}
                {
                  suppliers.find((s) => s.id === parseInt(selectedSupplierId))
                    ?.name
                }
              </h2>
              <button className="btn btn-primary" onClick={handleAddNewClick}>
                <FiPlus /> Add New Price
              </button>
            </div>

            {fetchStatus === "loading" && (
              <div className="flex justify-center p-4">
                <span className="loading loading-lg"></span>
              </div>
            )}
            {fetchStatus === "failed" && (
              <p className="text-error">Error loading prices.</p>
            )}
            {fetchStatus === "succeeded" && (
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Material</th>
                      <th>Unit</th>
                      <th>Price</th>
                      <th>Effective From</th>
                      <th>Effective To</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prices.map((price) => (
                      <tr key={price.id} className="hover">
                        <td>{price.masterMaterial.name}</td>
                        <td>{price.unit}</td>
                        <td>{price.price.toFixed(2)}</td>
                        <td>{price.effectiveFromDate}</td>
                        <td>{price.effectiveToDate || "N/A"}</td>
                        <td>
                          <span
                            className={`badge ${
                              price.isActive ? "badge-success" : "badge-ghost"
                            }`}
                          >
                            {price.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="space-x-2">
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => handleEditClick(price)}
                          >
                            <FiEdit /> Edit
                          </button>
                          {price.isActive && (
                            <button
                              className="btn btn-ghost btn-xs text-warning"
                              onClick={() => handleDeactivateClick(price)}
                            >
                              <FiPower /> Deactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {prices.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center">
                          No prices found for this supplier.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={priceToEdit ? "Edit Price Entry" : "Add New Price Entry"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Master Material</span>
            </label>
            <select
              name="masterMaterialId"
              value={formData.masterMaterialId}
              onChange={handleFormChange}
              className="select select-bordered"
              required
            >
              <option value="" disabled>
                Select a Material
              </option>
              {masterMaterials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Price</span>
              </label>
              <input
                type="number"
                step="any"
                name="price"
                value={formData.price}
                onChange={handleFormChange}
                className="input input-bordered w-full"
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Unit</span>
              </label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleFormChange}
                className="input input-bordered w-full"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Effective From Date</span>
              </label>
              <input
                type="date"
                name="effectiveFromDate"
                value={formData.effectiveFromDate}
                onChange={handleFormChange}
                className="input input-bordered w-full"
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Effective To Date (Optional)</span>
              </label>
              <input
                type="date"
                name="effectiveToDate"
                value={formData.effectiveToDate}
                onChange={handleFormChange}
                className="input input-bordered w-full"
              />
            </div>
          </div>
          <div className="form-control">
            <label className="cursor-pointer label justify-start gap-4">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleFormChange}
                className="checkbox checkbox-primary"
              />
              <span className="label-text">Is Active</span>
            </label>
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

export default SupplierPricesPage;
