import React, { useEffect, type JSX } from "react";
import { Link } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import {
  fetchMasterMaterials,
  deleteMasterMaterial,
  selectAllMasterMaterials,
  selectMasterMaterialsStatus,
  selectMasterMaterialsError,
} from "./masterMaterialsSlice";

// --- Icon Imports ---
import { FiEdit, FiTrash2 } from "react-icons/fi";

function MasterMaterialList(): JSX.Element {
  const dispatch = useAppDispatch();
  const materials = useAppSelector(selectAllMasterMaterials);
  const fetchStatus = useAppSelector(selectMasterMaterialsStatus);
  const fetchError = useAppSelector(selectMasterMaterialsError);

  useEffect(() => {
    // Fetch materials only if the list hasn't been loaded yet
    if (fetchStatus === "idle") {
      dispatch(fetchMasterMaterials());
    }
  }, [fetchStatus, dispatch]);

  const handleDelete = (id: number, name: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete master material: "${name}"?`
      )
    ) {
      dispatch(deleteMasterMaterial(id))
        .unwrap()
        .catch((err) => {
          // The backend will prevent deletion if the material is in use.
          // This error will be caught here and displayed to the user.
          alert(`Error: ${err}`);
        });
    }
  };

  if (fetchStatus === "loading") {
    return (
      <div className="flex justify-center p-4">
        <span className="loading loading-lg"></span>
      </div>
    );
  }

  if (fetchStatus === "failed") {
    return (
      <p className="text-error text-center">
        Error loading master materials: {String(fetchError)}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto bg-base-100 shadow-md rounded-lg">
      <table className="table w-full">
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Unit</th>
            <th>Category</th>
            <th>Brand</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {materials.map((material) => (
            <tr key={material.id} className="hover">
              <td>{material.materialCode || "-"}</td>
              <td>
                <div className="font-bold">{material.name}</div>
              </td>
              <td>{material.defaultUnit}</td>
              <td>{material.itemCategory.name}</td>
              <td>{material.brand?.name || "N/A"}</td>
              <td className="space-x-2 text-center">
                <Link
                  to={`/master-materials/edit/${material.id}`}
                  className="btn btn-ghost btn-xs"
                >
                  <FiEdit /> Edit
                </Link>
                <button
                  className="btn btn-ghost btn-xs text-error"
                  onClick={() => handleDelete(material.id, material.name)}
                >
                  <FiTrash2 /> Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MasterMaterialList;
