import React, { useState, useEffect, type JSX } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import Modal from "../components/common/Modal";

// --- Redux & Icon Imports ---
import {
  fetchItemCategories,
  createItemCategory,
  updateItemCategory,
  deleteItemCategory,
  selectAllItemCategories,
  selectItemCategoriesStatus,
  selectItemCategoryOperationStatus,
  selectItemCategoryOperationError,
  resetOperationStatus,
  type ItemCategory,
} from "../features/itemCategories/itemCategoriesSlice";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";

interface CategoryFormData {
  name: string;
}

const initialFormData: CategoryFormData = { name: "" };

function ItemCategoriesPage(): JSX.Element {
  const dispatch = useAppDispatch();

  // --- Local & Redux State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<ItemCategory | null>(
    null
  );
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);
  const categories = useAppSelector(selectAllItemCategories);
  const fetchStatus = useAppSelector(selectItemCategoriesStatus);
  const operationStatus = useAppSelector(selectItemCategoryOperationStatus);
  const operationError = useAppSelector(selectItemCategoryOperationError);

  // --- Effects ---
  useEffect(() => {
    if (fetchStatus === "idle") {
      dispatch(fetchItemCategories());
    }
  }, [fetchStatus, dispatch]);

  useEffect(() => {
    if (operationStatus === "succeeded") {
      setIsModalOpen(false);
      dispatch(resetOperationStatus());
    }
  }, [operationStatus, dispatch]);

  useEffect(() => {
    if (categoryToEdit) {
      setFormData({ name: categoryToEdit.name });
    } else {
      setFormData(initialFormData);
    }
  }, [categoryToEdit]);

  // --- Event Handlers ---
  const handleAddNewClick = () => {
    setCategoryToEdit(null);
    dispatch(resetOperationStatus());
    setIsModalOpen(true);
  };
  const handleEditClick = (category: ItemCategory) => {
    setCategoryToEdit(category);
    dispatch(resetOperationStatus());
    setIsModalOpen(true);
  };
  const handleDeleteClick = (category: ItemCategory) => {
    if (
      window.confirm(
        `Are you sure you want to delete category "${category.name}"?`
      )
    ) {
      dispatch(deleteItemCategory(category.id))
        .unwrap()
        .catch((err) => alert(`Error: ${err}`));
    }
  };
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = { ...formData };
    if (categoryToEdit) {
      await dispatch(updateItemCategory({ id: categoryToEdit.id, ...payload }));
    } else {
      await dispatch(createItemCategory(payload));
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Item Categories</h1>
        <button className="btn btn-primary" onClick={handleAddNewClick}>
          <FiPlus /> Add New Category
        </button>
      </div>

      <div className="overflow-x-auto bg-base-100 shadow-xl rounded-lg">
        <table className="table w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {fetchStatus === "loading" && (
              <tr>
                <td colSpan={3} className="text-center">
                  <span className="loading loading-lg"></span>
                </td>
              </tr>
            )}
            {fetchStatus === "succeeded" &&
              categories.map((category) => (
                <tr key={category.id} className="hover">
                  <td>{category.id}</td>
                  <td>{category.name}</td>
                  <td className="space-x-2">
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={() => handleEditClick(category)}
                    >
                      <FiEdit /> Edit
                    </button>
                    <button
                      className="btn btn-ghost btn-xs text-error"
                      onClick={() => handleDeleteClick(category)}
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={categoryToEdit ? "Edit Item Category" : "Add New Item Category"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Category Name</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              className="input input-bordered w-full"
              required
            />
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

export default ItemCategoriesPage;
