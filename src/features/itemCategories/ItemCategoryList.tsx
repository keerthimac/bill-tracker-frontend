import { useEffect, type JSX } from "react";
import { Link } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import {
  fetchItemCategories,
  selectAllItemCategories,
  selectItemCategoriesStatus,
  selectItemCategoriesError,
  deleteItemCategory, // <<< IMPORT deleteItemCategory thunk
} from "./itemCategoriesSlice";

function ItemCategoryList(): JSX.Element {
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectAllItemCategories);
  const status = useAppSelector(selectItemCategoriesStatus);
  const error = useAppSelector(selectItemCategoriesError);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchItemCategories());
    }
  }, [status, dispatch]);

  const handleDeleteCategory = (categoryId: number, categoryName: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete the category "${categoryName}"?`
      )
    ) {
      dispatch(deleteItemCategory(categoryId))
        .unwrap()
        .catch((err) => {
          alert(`Error deleting category: ${err.message || "Unknown error"}`);
        });
    }
  };

  let content;
  if (status === "loading") {
    content = <p>"Loading item categories..."</p>;
  } else if (status === "succeeded") {
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
                paddingBottom: "5px",
                borderBottom: "1px solid #eee",
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
                >
                  Delete
                </button>
              </span>
            </li>
          ))}
        </ul>
      );
    }
  } else if (status === "failed") {
    content = <p>Error: {error}</p>;
  }

  return <div>{content}</div>;
}
export default ItemCategoryList;
