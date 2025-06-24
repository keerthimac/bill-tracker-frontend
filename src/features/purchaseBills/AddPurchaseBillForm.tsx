import React, { useState, useEffect, useMemo, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";

// --- Redux Imports ---
import {
  createPurchaseBill,
  selectCreatePurchaseBillStatus,
  selectCreatePurchaseBillError,
  resetCreatePurchaseBillStatus,
  type NewPurchaseBillData,
} from "./purchaseBillsSlice";
import {
  fetchSites,
  selectAllSites,
  selectSitesStatus,
} from "../sites/sitesSlice";
import {
  fetchSuppliers,
  selectAllSuppliers,
  selectSuppliersStatus,
} from "../suppliers/suppliersSlice";
import {
  fetchMasterMaterials,
  selectAllMasterMaterials,
  selectMasterMaterialsStatus,
} from "../masterMaterials/masterMaterialsSlice";

// --- API Service Import ---
import { fetchActivePrice } from "../../services/apiService";

// --- Local Types ---
interface CurrentBillItem {
  masterMaterialId: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  isPriceLocked: boolean;
}

const initialBillItemState: CurrentBillItem = {
  masterMaterialId: "",
  quantity: "",
  unit: "",
  unitPrice: "",
  isPriceLocked: false,
};

function AddPurchaseBillForm(): JSX.Element {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // --- Form State ---
  const [billNumber, setBillNumber] = useState("");
  const [billDate, setBillDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [selectedSiteId, setSelectedSiteId] = useState("");
  const [currentItem, setCurrentItem] =
    useState<CurrentBillItem>(initialBillItemState);
  const [billItems, setBillItems] = useState<CurrentBillItem[]>([]);

  // --- Redux Selectors ---
  const sites = useAppSelector(selectAllSites);
  const sitesStatus = useAppSelector(selectSitesStatus);
  const suppliers = useAppSelector(selectAllSuppliers);
  const suppliersStatus = useAppSelector(selectSuppliersStatus);
  const masterMaterials = useAppSelector(selectAllMasterMaterials);
  const masterMaterialsStatus = useAppSelector(selectMasterMaterialsStatus);
  const createStatus = useAppSelector(selectCreatePurchaseBillStatus);
  const createError = useAppSelector(selectCreatePurchaseBillError);

  const isHeaderSelected = !!(selectedSupplierId && selectedSiteId && billDate);

  // --- Effects ---
  useEffect(() => {
    if (sitesStatus === "idle") dispatch(fetchSites());
    if (suppliersStatus === "idle") dispatch(fetchSuppliers());
    if (masterMaterialsStatus === "idle") dispatch(fetchMasterMaterials());
  }, [sitesStatus, suppliersStatus, masterMaterialsStatus, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(resetCreatePurchaseBillStatus());
    };
  }, [dispatch]);

  useEffect(() => {
    if (!currentItem.isPriceLocked) {
      const getPrice = async () => {
        if (
          isHeaderSelected &&
          currentItem.masterMaterialId &&
          currentItem.unit &&
          billDate
        ) {
          try {
            const activePrice = await fetchActivePrice({
              supplierId: parseInt(selectedSupplierId),
              masterMaterialId: parseInt(currentItem.masterMaterialId),
              unit: currentItem.unit,
              date: billDate,
            });
            if (activePrice) {
              setCurrentItem((prev) => ({
                ...prev,
                unitPrice: String(activePrice.price),
                isPriceLocked: true,
              }));
            } else {
              setCurrentItem((prev) => ({
                ...prev,
                unitPrice: "",
                isPriceLocked: false,
              }));
            }
          } catch (error) {
            console.warn("Could not fetch active price:", error);
            setCurrentItem((prev) => ({ ...prev, unitPrice: "", isPriceLocked: false }));
          }
        }
      };
      const handler = setTimeout(() => getPrice(), 300);
      return () => clearTimeout(handler);
    }
  }, [
    selectedSupplierId,
    currentItem.masterMaterialId,
    currentItem.unit,
    billDate,
    isHeaderSelected,
    currentItem.isPriceLocked,
    dispatch,
  ]);
  
  const billItemsWithDetails = useMemo(() => {
    return billItems.map((item) => {
      const material = masterMaterials.find(
        (m) => m.id === parseInt(item.masterMaterialId, 10)
      );
      return { ...item, materialName: material?.name || "Unknown Material" };
    });
  }, [billItems, masterMaterials]);

  // --- Event Handlers ---
  const handleCurrentItemChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "masterMaterialId") {
      if (value) {
        const material = masterMaterials.find(
          (m) => m.id === parseInt(value, 10)
        );
        if (material) {
          setCurrentItem({
            ...initialBillItemState,
            masterMaterialId: value,
            unit: material.defaultUnit,
          });
        }
      } else {
        setCurrentItem(initialBillItemState);
      }
    } else {
      setCurrentItem((prev) => ({
        ...prev,
        [name]: value,
        isPriceLocked: name === "unitPrice" ? false : prev.isPriceLocked,
      }));
    }
  };

  const handleAddItem = () => {
    if (
      !currentItem.masterMaterialId ||
      !currentItem.quantity ||
      !currentItem.unit ||
      !currentItem.unitPrice
    ) {
      alert("Please fill all fields for the item.");
      return;
    }
    if (
      isNaN(parseFloat(currentItem.quantity)) ||
      isNaN(parseFloat(currentItem.unitPrice)) ||
      parseFloat(currentItem.quantity) <= 0
    ) {
      alert("Please enter a valid, positive quantity and price.");
      return;
    }
    setBillItems([...billItems, { ...currentItem }]);
    setCurrentItem(initialBillItemState);
  };

  const handleRemoveItem = (indexToRemove: number) => {
    setBillItems(billItems.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmitBill = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      !billNumber ||
      !isHeaderSelected ||
      billItems.length === 0 ||
      createStatus === "loading"
    ) {
      alert("Please fill all required bill details and add at least one item.");
      return;
    }
    const newPurchaseBillData: NewPurchaseBillData = {
      billNumber,
      billDate,
      supplierId: parseInt(selectedSupplierId),
      siteId: parseInt(selectedSiteId),
      items: billItems.map((item) => ({
        masterMaterialId: parseInt(item.masterMaterialId),
        quantity: parseFloat(item.quantity),
        unit: item.unit,
        unitPrice: parseFloat(item.unitPrice),
      })),
    };
    try {
      await dispatch(createPurchaseBill(newPurchaseBillData)).unwrap();
      alert("Purchase Bill created successfully!");
      navigate("/purchase-bills");
    } catch (err: any) {
      console.error("Failed to create purchase bill:", err);
    }
  };

  if (
    sitesStatus === "loading" ||
    suppliersStatus === "loading" ||
    masterMaterialsStatus === "loading"
  ) {
    return <p>Loading form data...</p>;
  }

  return (
    <div className="card bg-base-100 shadow-xl max-w-4xl mx-auto">
      <div className="card-body">
        <h2 className="card-title text-2xl">Add New Purchase Bill</h2>
        <form onSubmit={handleSubmitBill} className="space-y-6">
          <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-base-300 p-4 rounded-md">
            <legend className="font-semibold px-2">Bill Details</legend>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Bill Number</span>
              </label>
              <input
                type="text"
                value={billNumber}
                onChange={(e) => setBillNumber(e.target.value)}
                className="input input-bordered w-full"
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Bill Date</span>
              </label>
              <input
                type="date"
                value={billDate}
                onChange={(e) => setBillDate(e.target.value)}
                className="input input-bordered w-full"
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Supplier</span>
              </label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="select select-bordered"
                required
              >
                <option value="" disabled>
                  Select Supplier
                </option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Site</span>
              </label>
              <select
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
                className="select select-bordered"
                required
              >
                <option value="" disabled>
                  Select Site
                </option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </fieldset>

          <fieldset
            className="border border-base-300 p-4 rounded-md"
            disabled={!isHeaderSelected}
          >
            <legend className="font-semibold px-2">Add Bill Item</legend>
            {!isHeaderSelected && (
              <p className="text-warning p-2 rounded-md bg-yellow-50 border border-yellow-200">
                Please select a Supplier, Site, and Date first.
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text">Master Material</span>
                </label>
                <select
                  name="masterMaterialId"
                  value={currentItem.masterMaterialId}
                  onChange={handleCurrentItemChange}
                  className="select select-bordered"
                >
                  <option value="">Select Material</option>
                  {masterMaterials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Unit</span>
                </label>
                <input
                  type="text"
                  name="unit"
                  value={currentItem.unit}
                  onChange={handleCurrentItemChange}
                  className="input input-bordered"
                  readOnly
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Quantity</span>
                </label>
                <input
                  type="number"
                  step="any"
                  name="quantity"
                  value={currentItem.quantity}
                  onChange={handleCurrentItemChange}
                  className="input input-bordered"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Unit Price</span>
                </label>
                <div className="join w-full">
                  <input
                    type="number"
                    step="any"
                    name="unitPrice"
                    value={currentItem.unitPrice}
                    onChange={handleCurrentItemChange}
                    readOnly={currentItem.isPriceLocked}
                    className="input input-bordered join-item w-full"
                    style={{
                      backgroundColor: currentItem.isPriceLocked
                        ? "hsl(var(--b2))"
                        : "hsl(var(--b1))",
                    }}
                  />
                  {currentItem.isPriceLocked && (
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentItem((prev) => ({
                          ...prev,
                          isPriceLocked: false,
                        }))
                      }
                      className="btn join-item"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right mt-4">
              <button
                type="button"
                onClick={handleAddItem}
                className="btn btn-secondary btn-sm"
                disabled={
                  !currentItem.masterMaterialId || !currentItem.quantity
                }
              >
                Add Item
              </button>
            </div>
          </fieldset>

          {billItems.length > 0 && (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th className="text-right">Qty</th>
                    <th>Unit</th>
                    <th className="text-right">Price</th>
                    <th className="text-right">Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {billItemsWithDetails.map((item, index) => (
                    <tr key={index}>
                      <td>{item.materialName}</td>
                      <td className="text-right">{item.quantity}</td>
                      <td>{item.unit}</td>
                      <td className="text-right">{parseFloat(item.unitPrice).toFixed(2)}</td>
                      <td className="text-right font-semibold">
                        {(
                          parseFloat(item.quantity) * parseFloat(item.unitPrice)
                        ).toFixed(2)}
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="btn btn-xs btn-ghost text-error"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="card-actions justify-end mt-6">
            <button
              type="button"
              onClick={() => navigate("/purchase-bills")}
              className="btn btn-ghost"
              disabled={createStatus === "loading"}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={
                !isHeaderSelected ||
                billItems.length === 0 ||
                createStatus === "loading"
              }
            >
              {createStatus === "loading" ? (
                <>
                  <span className="loading loading-spinner"></span> Saving...
                </>
              ) : (
                "Save Purchase Bill"
              )}
            </button>
          </div>
          {createStatus === "failed" && (
            <div role="alert" className="alert alert-error mt-4">
              <div>
                <span>Error: {createError}</span>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default AddPurchaseBillForm;