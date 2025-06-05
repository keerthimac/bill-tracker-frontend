import React, { useState, useEffect, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";

// Actions and selectors from purchaseBillsSlice
import {
  createPurchaseBill,
  selectCreatePurchaseBillStatus,
  selectCreatePurchaseBillError,
  resetCreatePurchaseBillStatus,
  type NewPurchaseBillData, // Assuming this is exported from the slice or defined here
  // NewBillItemData, // This is part of NewPurchaseBillData
} from "./purchaseBillsSlice";

// Actions and selectors for lookup data
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
  fetchItemCategories,
  selectAllItemCategories,
  selectItemCategoriesStatus,
} from "../itemCategories/itemCategoriesSlice";

// Define local type for an item being added (matches NewBillItemData from slice)
interface CurrentBillItem {
  materialName: string;
  itemCategoryId: string; // Use string for form select, convert to number on submit
  quantity: string; // Use string for form input, convert to number
  unit: string;
  unitPrice: string; // Use string for form input, convert to number
}

const initialBillItemState: CurrentBillItem = {
  materialName: "",
  itemCategoryId: "",
  quantity: "",
  unit: "",
  unitPrice: "",
};

function AddPurchaseBillForm(): JSX.Element {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Form state for Purchase Bill header
  const [billNumber, setBillNumber] = useState<string>("");
  const [billDate, setBillDate] = useState<string>(""); // YYYY-MM-DD
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [selectedSiteId, setSelectedSiteId] = useState<string>("");

  // Form state for the current bill item being entered
  const [currentItem, setCurrentItem] =
    useState<CurrentBillItem>(initialBillItemState);
  // State for the list of bill items added to this bill
  const [billItems, setBillItems] = useState<CurrentBillItem[]>([]);

  // Redux state for lookup data
  const sites = useAppSelector(selectAllSites);
  const sitesStatus = useAppSelector(selectSitesStatus);
  const suppliers = useAppSelector(selectAllSuppliers);
  const suppliersStatus = useAppSelector(selectSuppliersStatus);
  const itemCategories = useAppSelector(selectAllItemCategories);
  const itemCategoriesStatus = useAppSelector(selectItemCategoriesStatus);

  // Redux state for purchase bill creation
  const createStatus = useAppSelector(selectCreatePurchaseBillStatus);
  const createError = useAppSelector(selectCreatePurchaseBillError);

  // Fetch lookup data on component mount if not already loaded
  useEffect(() => {
    if (sitesStatus === "idle") dispatch(fetchSites());
    if (suppliersStatus === "idle") dispatch(fetchSuppliers());
    if (itemCategoriesStatus === "idle") dispatch(fetchItemCategories());
  }, [sitesStatus, suppliersStatus, itemCategoriesStatus, dispatch]);

  // Reset create status when component unmounts or on success/failure
  useEffect(() => {
    return () => {
      if (createStatus === "succeeded" || createStatus === "failed") {
        dispatch(resetCreatePurchaseBillStatus());
      }
    };
  }, [createStatus, dispatch]);

  const handleCurrentItemChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setCurrentItem({ ...currentItem, [e.target.name]: e.target.value });
  };

  const handleAddItem = () => {
    // Basic validation for current item before adding
    if (
      !currentItem.materialName ||
      !currentItem.itemCategoryId ||
      !currentItem.quantity ||
      !currentItem.unit ||
      !currentItem.unitPrice
    ) {
      alert("Please fill all fields for the item.");
      return;
    }
    if (
      isNaN(parseFloat(currentItem.quantity)) ||
      isNaN(parseFloat(currentItem.unitPrice))
    ) {
      alert("Quantity and Unit Price must be numbers.");
      return;
    }
    setBillItems([...billItems, { ...currentItem }]);
    setCurrentItem(initialBillItemState); // Reset for next item
  };

  const handleRemoveItem = (indexToRemove: number) => {
    setBillItems(billItems.filter((_, index) => index !== indexToRemove));
  };

  const canSaveBill =
    billNumber &&
    billDate &&
    selectedSupplierId &&
    selectedSiteId &&
    billItems.length > 0 &&
    createStatus !== "loading";

  const handleSubmitBill = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSaveBill) {
      alert("Please fill all required bill details and add at least one item.");
      return;
    }

    const newPurchaseBillData: NewPurchaseBillData = {
      billNumber,
      billDate,
      supplierId: parseInt(selectedSupplierId, 10),
      siteId: parseInt(selectedSiteId, 10),
      items: billItems.map((item) => ({
        materialName: item.materialName,
        itemCategoryId: parseInt(item.itemCategoryId, 10),
        quantity: parseFloat(item.quantity),
        unit: item.unit,
        unitPrice: parseFloat(item.unitPrice),
      })),
    };

    try {
      const resultAction = await dispatch(
        createPurchaseBill(newPurchaseBillData)
      ).unwrap();
      // Clear form and navigate on success
      setBillNumber("");
      setBillDate("");
      setSelectedSupplierId("");
      setSelectedSiteId("");
      setBillItems([]);
      setCurrentItem(initialBillItemState);
      alert("Purchase Bill created successfully!");
      navigate(`/purchase-bills`); // Or to the detail page: /purchase-bills/${resultAction.id}
    } catch (err: any) {
      console.error("Failed to create purchase bill:", err);
      // Error message is already in createError from the slice and will be displayed
      // If err contains validationErrors, you might want to display them more specifically
      // alert(`Error: ${err.message || 'Could not save purchase bill'}`);
    }
  };

  // --- Render ---
  if (
    sitesStatus === "loading" ||
    suppliersStatus === "loading" ||
    itemCategoriesStatus === "loading"
  ) {
    return <p>Loading prerequisite data...</p>;
  }

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "20px",
        marginBottom: "20px",
      }}
    >
      <h2>Add New Purchase Bill</h2>
      <form onSubmit={handleSubmitBill}>
        {/* Bill Header Fields */}
        <fieldset
          style={{ marginBottom: "15px", padding: "10px", borderColor: "#ddd" }}
        >
          <legend>Bill Details</legend>
          <div>
            <label htmlFor="billNumber">Bill Number:</label>
            <input
              type="text"
              id="billNumber"
              value={billNumber}
              onChange={(e) => setBillNumber(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="billDate">Bill Date:</label>
            <input
              type="date"
              id="billDate"
              value={billDate}
              onChange={(e) => setBillDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="selectedSupplierId">Supplier:</label>
            <select
              id="selectedSupplierId"
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              required
            >
              <option value="">Select Supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="selectedSiteId">Site:</label>
            <select
              id="selectedSiteId"
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              required
            >
              <option value="">Select Site</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </div>
        </fieldset>

        {/* Bill Items Section */}
        <fieldset
          style={{ marginBottom: "15px", padding: "10px", borderColor: "#ddd" }}
        >
          <legend>Add Bill Item</legend>
          <div>
            <label htmlFor="materialName">Material Name:</label>
            <input
              type="text"
              name="materialName"
              value={currentItem.materialName}
              onChange={handleCurrentItemChange}
            />
          </div>
          <div>
            <label htmlFor="itemCategoryId">Category:</label>
            <select
              name="itemCategoryId"
              value={currentItem.itemCategoryId}
              onChange={handleCurrentItemChange}
            >
              <option value="">Select Category</option>
              {itemCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="quantity">Quantity:</label>
            <input
              type="number"
              step="any"
              name="quantity"
              value={currentItem.quantity}
              onChange={handleCurrentItemChange}
            />
          </div>
          <div>
            <label htmlFor="unit">Unit:</label>
            <input
              type="text"
              name="unit"
              value={currentItem.unit}
              onChange={handleCurrentItemChange}
            />
          </div>
          <div>
            <label htmlFor="unitPrice">Unit Price:</label>
            <input
              type="number"
              step="any"
              name="unitPrice"
              value={currentItem.unitPrice}
              onChange={handleCurrentItemChange}
            />
          </div>
          <button
            type="button"
            onClick={handleAddItem}
            style={{ marginTop: "10px" }}
          >
            Add Item to Bill
          </button>
        </fieldset>

        {/* Display Added Bill Items */}
        {billItems.length > 0 && (
          <fieldset
            style={{
              marginBottom: "15px",
              padding: "10px",
              borderColor: "#007bff",
            }}
          >
            <legend>Current Bill Items</legend>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {billItems.map((item, index) => (
                <li
                  key={index}
                  style={{
                    borderBottom: "1px dashed #eee",
                    paddingBottom: "5px",
                    marginBottom: "5px",
                  }}
                >
                  {item.materialName} - Qty: {item.quantity} {item.unit} @{" "}
                  {item.unitPrice} each (Category ID: {item.itemCategoryId}){" "}
                  {/* You might want to display category name here */}
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    style={{ marginLeft: "10px", color: "red" }}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </fieldset>
        )}

        <button type="submit" disabled={!canSaveBill}>
          {createStatus === "loading"
            ? "Saving Purchase Bill..."
            : "Save Purchase Bill"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/purchase-bills")}
          style={{ marginLeft: "10px" }}
          disabled={createStatus === "loading"}
        >
          Cancel
        </button>
        {createStatus === "failed" && createError && (
          <p style={{ color: "red", marginTop: "10px" }}>
            Error creating bill: {createError}
          </p>
        )}
      </form>
    </div>
  );
}

export default AddPurchaseBillForm;
