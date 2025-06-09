import React, { useState, useEffect, type JSX } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import Modal from "../components/common/Modal";

// --- Redux & Icon Imports ---
import {
  fetchSites,
  createSite,
  updateSite,
  deleteSite,
  selectAllSites,
  selectSitesStatus,
  selectSiteOperationStatus,
  selectSiteOperationError,
  resetOperationStatus,
  type Site,
} from "../features/sites/sitesSlice";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";

interface SiteFormData {
  name: string;
  location: string;
}

const initialFormData: SiteFormData = { name: "", location: "" };

function SitesPage(): JSX.Element {
  const dispatch = useAppDispatch();

  // --- Local & Redux State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [siteToEdit, setSiteToEdit] = useState<Site | null>(null);
  const [formData, setFormData] = useState<SiteFormData>(initialFormData);
  const sites = useAppSelector(selectAllSites);
  const fetchStatus = useAppSelector(selectSitesStatus);
  const operationStatus = useAppSelector(selectSiteOperationStatus);
  const operationError = useAppSelector(selectSiteOperationError);

  // --- Effects ---
  useEffect(() => {
    if (fetchStatus === "idle") {
      dispatch(fetchSites());
    }
  }, [fetchStatus, dispatch]);

  useEffect(() => {
    if (operationStatus === "succeeded") {
      setIsModalOpen(false);
      dispatch(resetOperationStatus());
    }
  }, [operationStatus, dispatch]);

  useEffect(() => {
    if (siteToEdit) {
      setFormData({
        name: siteToEdit.name,
        location: siteToEdit.location || "",
      });
    } else {
      setFormData(initialFormData);
    }
  }, [siteToEdit]);

  // --- Event Handlers ---
  const handleAddNewClick = () => {
    setSiteToEdit(null);
    dispatch(resetOperationStatus());
    setIsModalOpen(true);
  };
  const handleEditClick = (site: Site) => {
    setSiteToEdit(site);
    dispatch(resetOperationStatus());
    setIsModalOpen(true);
  };
  const handleDeleteClick = (site: Site) => {
    if (
      window.confirm(`Are you sure you want to delete site "${site.name}"?`)
    ) {
      dispatch(deleteSite(site.id))
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
    if (siteToEdit) {
      await dispatch(updateSite({ id: siteToEdit.id, ...payload }));
    } else {
      await dispatch(createSite(payload));
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Sites</h1>
        <button className="btn btn-primary" onClick={handleAddNewClick}>
          <FiPlus /> Add New Site
        </button>
      </div>

      <div className="overflow-x-auto bg-base-100 shadow-xl rounded-lg">
        <table className="table w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {fetchStatus === "loading" && (
              <tr>
                <td colSpan={4} className="text-center">
                  <span className="loading loading-lg"></span>
                </td>
              </tr>
            )}
            {fetchStatus === "succeeded" &&
              sites.map((site) => (
                <tr key={site.id} className="hover">
                  <td>{site.id}</td>
                  <td>{site.name}</td>
                  <td>{site.location || "-"}</td>
                  <td className="space-x-2">
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={() => handleEditClick(site)}
                    >
                      <FiEdit /> Edit
                    </button>
                    <button
                      className="btn btn-ghost btn-xs text-error"
                      onClick={() => handleDeleteClick(site)}
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
        title={siteToEdit ? "Edit Site" : "Add New Site"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Site Name</span>
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
          <div className="form-control">
            <label className="label">
              <span className="label-text">Location</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleFormChange}
              className="input input-bordered w-full"
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

export default SitesPage;
