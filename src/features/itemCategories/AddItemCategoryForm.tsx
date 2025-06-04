import React, { useState, type JSX } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  createItemCategory,
  selectCreateItemCategoryStatus,
  selectCreateItemCategoryError,
} from "./itemCategoriesSlice";

function AddItemCategoryForm(): JSX.Element {
  const dispatch = useAppDispatch();
  const [name, setName] = useState<string>("");
  const createStatus = useAppSelector(selectCreateItemCategoryStatus);
  const createError = useAppSelector(selectCreateItemCategoryError);

  const canSave = name.trim() !== "";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSave) {
      try {
        await dispatch(createItemCategory({ name })).unwrap();
        setName(""); // Clear form on success
        // alert('Item Category created successfully!');
      } catch (err) {
        console.error("Failed to save the item category: ", err);
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
        <button type="submit" disabled={!canSave || createStatus === "loading"}>
          {createStatus === "loading" ? "Saving..." : "Add Category"}
        </button>
        {createStatus === "failed" && createError && (
          <p style={{ color: "red" }}>Error: {createError}</p>
        )}
      </form>
    </div>
  );
}

export default AddItemCategoryForm;
