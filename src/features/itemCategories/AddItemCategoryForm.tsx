import React, { useState, useEffect, type JSX } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  createItemCategory,
  // Corrected: Using the unified operation selectors and reset action
  selectItemCategoryOperationStatus,
  selectItemCategoryOperationError,
  resetOperationStatus,
} from "./itemCategoriesSlice";

function AddItemCategoryForm(): JSX.Element {
  const dispatch = useAppDispatch();
  const [name, setName] = useState<string>("");

  // Corrected: Using the unified selectors
  const operationStatus = useAppSelector(selectItemCategoryOperationStatus);
  const operationError = useAppSelector(selectItemCategoryOperationError);

  const canSave = name.trim() !== "";

  // Effect to reset the operation status when the component unmounts
  useEffect(() => {
    return () => {
      dispatch(resetOperationStatus());
    };
  }, [dispatch]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSave) {
      try {
        await dispatch(createItemCategory({ name })).unwrap();
        // --- Success Case ---
        setName(""); // Clear form
        // The operationStatus is now 'succeeded', allowing the success message to show.
        // The useEffect cleanup will reset the status when the user navigates away.
      } catch (err) {
        // --- Error Case ---
        console.error("Failed to save the item category: ", err);
        // The UI will display the operationError from the Redux state.
      }
    }
  };

  return (
    <div>
      <h3>Add New Item Category</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="categoryName">Category Name:</label>
          <input
            type="text"
            id="categoryName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={!canSave || operationStatus === "loading"}>
          {operationStatus === "loading" ? "Saving..." : "Add Category"}
        </button>
        
        {/* --- Feedback Messages --- */}
        {operationStatus === "succeeded" && (
            <p style={{ color: "green" }}>Category created successfully!</p>
        )}
        {operationStatus === "failed" && operationError && (
          <p style={{ color: "red" }}>Error: {operationError}</p>
        )}
      </form>
    </div>
  );
}

export default AddItemCategoryForm;