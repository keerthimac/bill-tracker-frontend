 const API_BASE_URL = "http://localhost:8080/api/v1";

// ... (keep your existing fetchSites function if you have one here) ...

interface ActivePriceParams {
  supplierId: number;
  masterMaterialId: number;
  unit: string;
  date: string; // YYYY-MM-DD
}

interface SupplierPrice {
  id: number;
  price: number;
  // ... other fields from SupplierMaterialPriceResponseDTO
}

export async function fetchActivePrice(
  params: ActivePriceParams
): Promise<SupplierPrice | null> {
  const { supplierId, masterMaterialId, unit, date } = params;
  if (!supplierId || !masterMaterialId || !unit || !date) {
    return null; // Don't fetch if parameters are missing
  }

  try {
    const queryParams = new URLSearchParams({
      supplierId: String(supplierId),
      masterMaterialId: String(masterMaterialId),
      unit: unit,
      date: date,
    });

    const response = await fetch(
      `${API_BASE_URL}/supplier-prices/active-price?${queryParams.toString()}`
    );

    if (response.status === 404) {
      return null; // No active price found, which is a valid case
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data: SupplierPrice = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch active price:", error);
    throw error;
  }
}
