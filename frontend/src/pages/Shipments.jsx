import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import { Plus, Package } from "lucide-react";

const fetchShipments = async () => {
  const res = await fetch("/api/shipments");
  return res.json();
};
const fetchCustomers = async () => {
  const res = await fetch("/api/customers");
  return res.json();
};
const fetchWarehouses = async () => {
  const res = await fetch("/api/warehouses");
  return res.json();
};
const fetchInventory = async () => {
  const res = await fetch("/api/inventory");
  return res.json();
};

export default function Shipments() {
  const { searchQuery } = useOutletContext() || { searchQuery: "" };
  const queryClient = useQueryClient();
  const [customerId, setCustomerId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [errorMessage, setErrorMessage] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["shipments"],
    queryFn: fetchShipments,
  });
  const { data: custData } = useQuery({
    queryKey: ["customers"],
    queryFn: fetchCustomers,
  });
  const { data: whData } = useQuery({
    queryKey: ["warehouses"],
    queryFn: fetchWarehouses,
  });
  const { data: invData } = useQuery({
    queryKey: ["inventory"],
    queryFn: fetchInventory,
  });

  const createMutation = useMutation({
    mutationFn: async (newShipment) => {
      setErrorMessage(""); // clear previous errors
      const res = await fetch("/api/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newShipment),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create shipment");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      setCustomerId("");
      setWarehouseId("");
      setProductId("");
      setQuantity("1");
      setErrorMessage("");
    },
    onError: (error) => {
      setErrorMessage(error.message);
    }
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await fetch(`/api/shipments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shipments"] }),
  });

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate({
      customerId,
      warehouseId,
      productId: productId || undefined,
      quantity: Number(quantity) || 1,
      status: "PENDING",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "var(--accent)";
      case "PROCESSING":
        return "#3b82f6";
      case "IN_TRANSIT":
        return "#f59e0b";
      case "DELIVERED":
        return "var(--success)";
      case "CANCELLED":
        return "var(--danger)";
      default:
        return "var(--text-secondary)";
    }
  };

  const filteredData =
    data?.data?.filter(
      (s) =>
        (s.customerId?.name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (s.warehouseId?.name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (s.productId?.name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (s.status || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s._id || "")
          .slice(-6)
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
    ) || [];

  return (
    <div>
      <h1 style={{ marginBottom: "32px" }}>Shipment Logistics</h1>

      <div className="glass-panel" style={{ marginBottom: "32px" }}>
        <h3 style={{ marginBottom: "16px" }}>Create New Shipment</h3>
        
        {errorMessage && (
          <div style={{ padding: '12px 16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: '500' }}>
            {errorMessage}
          </div>
        )}

        <form
          onSubmit={handleCreate}
          style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}
        >
          <select
            className="input-field"
            style={{ marginBottom: 0, flex: 1, minWidth: "180px" }}
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            required
          >
            <option value="">Select Customer...</option>
            {custData?.data?.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            className="input-field"
            style={{ marginBottom: 0, flex: 1, minWidth: "180px" }}
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            required
          >
            <option value="">Select Origin Warehouse...</option>
            {whData?.data?.map((w) => (
              <option key={w._id} value={w._id}>
                {w.name}
              </option>
            ))}
          </select>
          <select
            className="input-field"
            style={{ marginBottom: 0, flex: 1, minWidth: "180px" }}
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            disabled={!warehouseId}
          >
            <option value="">{warehouseId ? "Select Product..." : "Select Warehouse First"}</option>
            {invData?.data?.filter(inv => inv.warehouseId?._id === warehouseId).map((inv) => (
              <option key={inv.productId?._id} value={inv.productId?._id}>
                {inv.productId?.name} ({inv.productId?.sku}) - {inv.quantity} in stock
              </option>
            ))}
          </select>
          <input
            className="input-field"
            style={{ marginBottom: 0, width: "130px" }}
            type="number"
            min="1"
            placeholder="Units"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
          <button
            type="submit"
            className="btn-primary"
            style={{
              height: "44px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Plus size={18} /> Create Shipment
          </button>
        </form>
      </div>

      <div className="glass-panel">
        <h3 style={{ marginBottom: "16px" }}>Outbound Shipments</h3>
        {isLoading ? (
          <p>Loading shipments...</p>
        ) : (
          <table
            style={{
              width: "100%",
              textAlign: "left",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                <th style={{ padding: "12px" }}>ID</th>
                <th style={{ padding: "12px" }}>Customer</th>
                <th style={{ padding: "12px" }}>Origin Warehouse</th>
                <th style={{ padding: "12px" }}>Product : Unit Amount</th>
                <th style={{ padding: "12px" }}>Status</th>
                <th style={{ padding: "12px" }}>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((shipment) => (
                <tr
                  key={shipment._id}
                  style={{ borderBottom: "1px solid var(--border-color)" }}
                >
                  <td
                    style={{
                      padding: "12px",
                      fontFamily: "monospace",
                      fontSize: "12px",
                    }}
                  >
                    {shipment._id.slice(-6)}
                  </td>
                  <td style={{ padding: "12px" }}>
                    {shipment.customerId?.name || "Unknown User"}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "6px",
                        backgroundColor: "rgba(139, 92, 246, 0.15)",
                        color: "#a78bfa",
                        fontSize: "13px",
                        fontWeight: "500",
                      }}
                    >
                      {shipment.warehouseId?.name || "Unknown Facility"}
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    {shipment.productId ? (
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: "500",
                            color: "var(--text-primary)",
                          }}
                        >
                          {shipment.productId.name}
                        </span>
                        <span
                          style={{
                            fontSize: "12px",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            backgroundColor: "rgba(59, 130, 246, 0.15)",
                            color: "#3b82f6",
                            fontWeight: "600",
                          }}
                        >
                          {shipment.quantity ?? 1}{" "}
                          {(shipment.quantity ?? 1) === 1 ? "unit" : "units"}
                        </span>
                      </div>
                    ) : (
                      <span
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "13px",
                        }}
                      >
                        —
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        backgroundColor: `${getStatusColor(shipment.status)}20`,
                        color: getStatusColor(shipment.status),
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      {shipment.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <select
                      className="input-field"
                      style={{ margin: 0, padding: "6px", width: "auto" }}
                      value={shipment.status}
                      onChange={(e) =>
                        statusMutation.mutate({
                          id: shipment._id,
                          status: e.target.value,
                        })
                      }
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="IN_TRANSIT">IN TRANSIT</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      padding: "24px",
                      textAlign: "center",
                      color: "var(--text-secondary)",
                    }}
                  >
                    No shipments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
