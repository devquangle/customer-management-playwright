import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchCustomers,
  createCustomer,
  updateCustomer,
  patchCustomerStatus,
  getCustomer,
  deleteCustomer,
} from "../../src/customerApiStore.js";
import {
  validateCustomerForm,
  createCustomerPayload,
  updateCustomerPayload,
} from "../../src/customerBusiness.js";

// Giả lập (Mock) hàm fetch toàn cục
global.fetch = vi.fn();

describe("customerApiStore.js unit tests - 30 Test Cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // 1. KIỂM THỬ HÀM fetchCustomers (TC-001 -> TC-006)
  // =========================================================================

  // Note: TC-001 - Kiểm tra fetchCustomers thành công trả về danh sách khách hàng đầy đủ.
  it("TC-001: fetchCustomers should return a list of customers on success", async () => {
    const mockCustomers = [{ id: "1", fullName: "Nguyen Van A", status: "new" }];
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCustomers,
    });

    const result = await fetchCustomers();
    expect(fetch).toHaveBeenCalledWith("http://localhost:3001/customers", {
      headers: { "Content-Type": "application/json" },
      method: "GET",
    });
    expect(result).toEqual(mockCustomers);
  });

  // Note: TC-002 - Kiểm tra fetchCustomers thành công trả về danh sách rỗng.
  it("TC-002: fetchCustomers should return empty array when no customers exist", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    const result = await fetchCustomers();
    expect(result).toEqual([]);
  });

  // Note: TC-003 - Kiểm tra fetchCustomers thất bại ném lỗi 500 (Lỗi hệ thống).
  it("TC-003: fetchCustomers should throw error on 500 status", async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(fetchCustomers()).rejects.toThrow("API error 500");
  });

  // Note: TC-004 - Kiểm tra fetchCustomers thất bại ném lỗi 404 (Không tìm thấy endpoint).
  it("TC-004: fetchCustomers should throw error on 404 status", async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 404 });
    await expect(fetchCustomers()).rejects.toThrow("API error 404");
  });

  // Note: TC-005 - Kiểm tra fetchCustomers thất bại ném lỗi 401 (Không có quyền truy cập).
  it("TC-005: fetchCustomers should throw error on 401 status", async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 401 });
    await expect(fetchCustomers()).rejects.toThrow("API error 401");
  });

  // Note: TC-006 - Kiểm tra fetchCustomers thất bại ném lỗi 403 (Truy cập bị cấm).
  it("TC-006: fetchCustomers should throw error on 403 status", async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 403 });
    await expect(fetchCustomers()).rejects.toThrow("API error 403");
  });

  // =========================================================================
  // 2. KIỂM THỬ HÀM createCustomer (TC-007 -> TC-012)
  // =========================================================================

  // Note: TC-007 - Kiểm tra createCustomer thành công tạo khách hàng mới với dữ liệu chuẩn.
  it("TC-007: createCustomer should call POST API with standard payload", async () => {
    const formData = { fullName: "Nguyen Van B", phone: "0912345678", email: "b@gmail.com", course: "React" };
    const payload = createCustomerPayload(formData);
    const createdCustomer = { id: "2", ...payload };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => createdCustomer,
    });

    const result = await createCustomer(payload);
    expect(fetch).toHaveBeenCalledWith("http://localhost:3001/customers", {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify(payload),
    });
    expect(result).toEqual(createdCustomer);
  });

  // Note: TC-008 - Kiểm tra createCustomer thành công tạo khách hàng khi dữ liệu chứa ký tự đặc biệt.
  it("TC-008: createCustomer should succeed when data contains special characters", async () => {
    const payload = { fullName: "O'Conner & Sons", phone: "090000000", email: "o@g.com", course: "C++ & Java" };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "3", ...payload }),
    });

    const result = await createCustomer(payload);
    expect(result.fullName).toBe("O'Conner & Sons");
  });

  // Note: TC-009 - Kiểm tra createCustomer thành công tạo khách hàng khi trường note ghi chú bỏ trống.
  it("TC-009: createCustomer should succeed with empty note field", async () => {
    const payload = { fullName: "Nguyen B", phone: "090000000", email: "o@g.com", course: "C++", note: "" };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "4", ...payload }),
    });

    const result = await createCustomer(payload);
    expect(result.note).toBe("");
  });

  // Note: TC-010 - Kiểm tra createCustomer thất bại ném lỗi 400 (Dữ liệu gửi đi sai cấu trúc).
  it("TC-010: createCustomer should throw error on 400 status", async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 400 });
    await expect(createCustomer({})).rejects.toThrow("API error 400");
  });

  // Note: TC-011 - Kiểm tra createCustomer thất bại ném lỗi 409 (Trùng lặp dữ liệu/Email đã tồn tại).
  it("TC-011: createCustomer should throw error on 409 status", async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 409 });
    await expect(createCustomer({})).rejects.toThrow("API error 409");
  });

  // Note: TC-012 - Kiểm tra createCustomer thất bại ném lỗi 500 (Lỗi hệ thống).
  it("TC-012: createCustomer should throw error on 500 status", async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(createCustomer({})).rejects.toThrow("API error 500");
  });

  // =========================================================================
  // 3. KIỂM THỬ HÀM updateCustomer (TC-013 -> TC-018)
  // =========================================================================

  // Note: TC-013 - Kiểm tra updateCustomer thành công cập nhật toàn bộ thông tin mới.
  it("TC-013: updateCustomer should call PUT API with id and payload", async () => {
    const formData = { fullName: "Nguyen Van B Edited", phone: "0912345678", email: "b@gmail.com", course: "React", status: "new" };
    const payload = updateCustomerPayload(formData);

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "1", ...payload }),
    });

    const result = await updateCustomer("1", payload);
    expect(fetch).toHaveBeenCalledWith("http://localhost:3001/customers/1", {
      headers: { "Content-Type": "application/json" },
      method: "PUT",
      body: JSON.stringify(payload),
    });
    expect(result).toEqual({ id: "1", ...payload });
  });

  // Note: TC-014 - Kiểm tra updateCustomer thành công cập nhật khi thay đổi trạng thái sang contacted.
  it("TC-014: updateCustomer should succeed when updating status to contacted", async () => {
    const payload = { fullName: "A", phone: "09", email: "e", course: "c", status: "contacted" };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "1", ...payload }),
    });

    const result = await updateCustomer("1", payload);
    expect(result.status).toBe("contacted");
  });

  // Note: TC-015 - Kiểm tra updateCustomer thành công cập nhật khi chuyển isFavorite thành true.
  it("TC-015: updateCustomer should succeed when setting isFavorite to true", async () => {
    const payload = { fullName: "A", phone: "09", email: "e", course: "c", isFavorite: true };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "1", ...payload }),
    });

    const result = await updateCustomer("1", payload);
    expect(result.isFavorite).toBe(true);
  });

  // Note: TC-016 - Kiểm tra updateCustomer thất bại ném lỗi 400 (Dữ liệu gửi đi không hợp lệ).
  it("TC-016: updateCustomer should throw error on 400 status", async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 400 });
    await expect(updateCustomer("1", {})).rejects.toThrow("API error 400");
  });

  // Note: TC-017 - Kiểm tra updateCustomer thất bại ném lỗi 404 (Khách hàng cần cập nhật không tồn tại).
  it("TC-017: updateCustomer should throw error on 404 status", async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 404 });
    await expect(updateCustomer("999", {})).rejects.toThrow("API error 404");
  });

  // Note: TC-018 - Kiểm tra updateCustomer thất bại ném lỗi 500 (Lỗi hệ thống).
  it("TC-018: updateCustomer should throw error on 500 status", async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(updateCustomer("1", {})).rejects.toThrow("API error 500");
  });

  // =========================================================================
  // 4. KIỂM THỬ HÀM patchCustomerStatus (TC-019 -> TC-024)
  // =========================================================================

  // Note: TC-019 - Kiểm tra patchCustomerStatus thành công cập nhật nhanh trạng thái sang "new".
  it("TC-019: patchCustomerStatus should update status to new", async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: "1", status: "new" }) });
    const result = await patchCustomerStatus("1", "new");
    expect(fetch).toHaveBeenCalledWith("http://localhost:3001/customers/1", {
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
      body: JSON.stringify({ status: "new" }),
    });
    expect(result.status).toBe("new");
  });

  // Note: TC-020 - Kiểm tra patchCustomerStatus thành công cập nhật nhanh trạng thái sang "contacted".
  it("TC-020: patchCustomerStatus should update status to contacted", async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: "1", status: "contacted" }) });
    const result = await patchCustomerStatus("1", "contacted");
    expect(result.status).toBe("contacted");
  });

  // Note: TC-021 - Kiểm tra patchCustomerStatus thành công cập nhật nhanh trạng thái sang "registered".
  it("TC-021: patchCustomerStatus should update status to registered", async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: "1", status: "registered" }) });
    const result = await patchCustomerStatus("1", "registered");
    expect(result.status).toBe("registered");
  });

  // Note: TC-022 - Kiểm tra patchCustomerStatus thất bại ném lỗi 400 (Trạng thái truyền vào không hợp lệ).
  it("TC-022: patchCustomerStatus should throw error on 400 status", async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 400 });
    await expect(patchCustomerStatus("1", "invalid_status")).rejects.toThrow("API error 400");
  });

  // Note: TC-023 - Kiểm tra patchCustomerStatus thất bại ném lỗi 404 (Khách hàng cần đổi trạng thái không tồn tại).
  it("TC-023: patchCustomerStatus should throw error on 404 status", async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 404 });
    await expect(patchCustomerStatus("999", "new")).rejects.toThrow("API error 404");
  });

  // Note: TC-024 - Kiểm tra patchCustomerStatus thất bại ném lỗi 500 (Lỗi hệ thống).
  it("TC-024: patchCustomerStatus should throw error on 500 status", async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(patchCustomerStatus("1", "new")).rejects.toThrow("API error 500");
  });

  // =========================================================================
  // 5. KIỂM THỬ HÀM getCustomer (TC-025 -> TC-027)
  // =========================================================================

  // Note: TC-025 - Kiểm tra getCustomer thành công lấy chi tiết thông tin khách hàng bằng ID hợp lệ.
  it("TC-025: getCustomer should fetch single customer by id", async () => {
    const customer = { id: "1", fullName: "Nguyen Van A" };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => customer,
    });

    const result = await getCustomer("1");
    expect(fetch).toHaveBeenCalledWith("http://localhost:3001/customers/1", {
      headers: { "Content-Type": "application/json" },
      method: "GET",
    });
    expect(result).toEqual(customer);
  });

  // Note: TC-026 - Kiểm tra getCustomer thất bại ném lỗi 404 (Khách hàng không tồn tại).
  it("TC-026: getCustomer should throw error on 404 status", async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 404 });
    await expect(getCustomer("999")).rejects.toThrow("API error 404");
  });

  // Note: TC-027 - Kiểm tra getCustomer thất bại ném lỗi 500 (Lỗi hệ thống).
  it("TC-027: getCustomer should throw error on 500 status", async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(getCustomer("1")).rejects.toThrow("API error 500");
  });

  // =========================================================================
  // 6. KIỂM THỬ HÀM deleteCustomer (TC-028 -> TC-030)
  // =========================================================================

  // Note: TC-028 - Kiểm tra deleteCustomer thành công xóa khách hàng bằng ID.
  it("TC-028: deleteCustomer should call DELETE API with id", async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });
    const result = await deleteCustomer("1");
    expect(fetch).toHaveBeenCalledWith("http://localhost:3001/customers/1", {
      headers: { "Content-Type": "application/json" },
      method: "DELETE",
    });
    expect(result).toEqual({ success: true });
  });

  // Note: TC-029 - Kiểm tra deleteCustomer thất bại ném lỗi 404 (Khách hàng cần xóa không tồn tại).
  it("TC-029: deleteCustomer should throw error on 404 status", async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 404 });
    await expect(deleteCustomer("999")).rejects.toThrow("API error 404");
  });

  // Note: TC-030 - Kiểm tra deleteCustomer thất bại ném lỗi 500 (Lỗi hệ thống).
  it("TC-030: deleteCustomer should throw error on 500 status", async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(deleteCustomer("1")).rejects.toThrow("API error 500");
  });
});
