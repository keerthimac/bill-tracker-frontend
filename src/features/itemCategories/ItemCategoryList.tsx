import { useEffect, type JSX } from "react";
import { Link } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import {
  fetchItemCategories,
  selectAllItemCategories,
  selectItemCategoriesStatus,
  selectItemCategoriesError,
  deleteItemCategory,
  // Corrected: Import the unified status selectors for operations
  selectItemCategoryOperationStatus,
  selectItemCategoryOperationError,
} from "./itemCategoriesSlice";

function ItemCategoryList(): JSX.Element {
  const dispatch = useAppDispatch();

  // --- Redux State ---
  const categories = useAppSelector(selectAllItemCategories);
  const fetchStatus = useAppSelector(selectItemCategoriesStatus);
  const fetchError = useAppSelector(selectItemCategoriesError);
  
  // Use the unified status for CUD operations to provide UI feedback
  const operationStatus = useAppSelector(selectItemCategoryOperationStatus);
  const operationError = useAppSelector(selectItemCategoryOperationError);

  // --- Effects ---
  useEffect(() => {
    if (fetchStatus === "idle") {
      dispatch(fetchItemCategories());
    }
  }, [fetchStatus, dispatch]);

  // --- Event Handlers ---
  const handleDeleteCategory = (categoryId: number, categoryName: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete the category "${categoryName}"?`
      )
    ) {
      dispatch(deleteItemCategory(categoryId))
        .unwrap()
        .catch((err) => {
          console.error("Failed to delete category:", err);
          // The UI will display the `operationError` from the Redux state.
        });
    }
  };

  // --- Render Logic ---
  let content;
  if (fetchStatus === "loading") {
    content = <p>"Loading item categories..."</p>;
  } else if (fetchStatus === "succeeded") {
    if (categories.length === 0) {
      content = <p>No item categories found.</p>;
    } else {
      content = (
        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          {categories.map((category) => (
            <li
              key={category.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
                padding: "10px",
                border: "1px solid #eee",
                borderRadius: "4px",
                // Visually indicate when the list is being processed
                opacity: operationStatus === "loading" ? 0.6 : 1,
              }}
            >
              <span>{category.name}</span>
              <span>
                <Link
                  to={`/item-categories/edit/${category.id}`}
                  style={{
                    marginRight: "10px",
                    textDecoration: "none",
                    color: "blue",
                    // Prevent navigation while an operation is in progress
                    pointerEvents: operationStatus === "loading" ? "none" : "auto",
                  }}
                >
                  Edit
                </Link>
                <button
                  onClick={() =>
                    handleDeleteCategory(category.id, category.name)
                  }
                  style={{
                    color: "red",
                    background: "none",
                    border: "1px solid red",
                    padding: "3px 6px",
                    cursor: "pointer",
                  }}
                  disabled={operationStatus === "loading"}
                >
                  Delete
                </button>
              </span>
            </li>
          ))}
        </ul>
      );
    }
  } else if (fetchStatus === "failed") {
    content = <p>Error: {fetchError}</p>;
  }

  return (
    <div>
      <h2>Item Categories</h2>
      {/* Display a global error message for failed operations like delete */}
      {operationStatus === "failed" && operationError && (
        <p style={{ color: "red", border: "1px solid red", padding: "10px" }}>
          <strong>Operation Failed:</strong> {operationError}
        </p>
      )}
      {/* Display a global loading message for CUD operations */}
      {operationStatus === 'loading' && <p>Processing...</p>}

      {content}
    </div>
  );
}

export default ItemCategoryList;