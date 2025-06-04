import { useEffect, type JSX } from "react";
import { useAppSelector, useAppDispatch } from "../../app/hooks"; // Your typed hooks
import {
  fetchItemCategories,
  selectAllItemCategories,
  selectItemCategoriesStatus,
  selectItemCategoriesError,
} from "./itemCategoriesSlice";

function ItemCategoryList(): JSX.Element {
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectAllItemCategories);
  const status = useAppSelector(selectItemCategoriesStatus);
  const error = useAppSelector(selectItemCategoriesError);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchItemCategories()); // Must be fetchItemCategories()
    }
  }, [status, dispatch]);

  let content;

  if (status === "loading") {
    content = <p>"Loading item categories..."</p>;
  } else if (status === "succeeded") {
    if (categories.length === 0) {
      content = <p>No item categories found.</p>;
    } else {
      content = (
        <ul>
          {categories.map((category) => (
            <li key={category.id}>{category.name}</li>
          ))}
        </ul>
      );
    }
  } else if (status === "failed") {
    content = <p>Error loading item categories: {error}</p>;
  }

  return (
    <div>
      <h2>Item Categories</h2>
      {content}
    </div>
  );
}

export default ItemCategoryList;
