import { describe, it, expect } from "vitest";
import {
  validateCustomerForm,
  createCustomerPayload,
  updateCustomerPayload,
  filterCustomers,
  searchCustomers,
} from "../../src/customerBusiness.js";

describe("customerBusiness.js unit tests - 30 Test Cases", () => {

  // =========================================================================
  // 1. KIỂM THỬ XÁC THỰC FORM validateCustomerForm (TC-001 -> TC-018)
  // =========================================================================

  // Note: TC-001 - Báo lỗi khi Họ tên bị bỏ trống.
  it("TC-001: validateCustomerForm fullName is empty should fail", () => {
    const data = { fullName: "", phone: "0912345678", email: "a@gmail.com", course: "Java" };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(false);
    expect(res.errors.fullName).toBe("Họ tên không được rỗng");
  });

  // Note: TC-002 - Báo lỗi khi Họ tên chỉ chứa các khoảng trắng.
  it("TC-002: validateCustomerForm fullName is whitespace should fail", () => {
    const data = { fullName: "   ", phone: "0912345678", email: "a@gmail.com", course: "Java" };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(false);
    expect(res.errors.fullName).toBe("Họ tên không được rỗng");
  });

  // Note: TC-003 - Báo lỗi khi Họ tên quá ngắn (2 ký tự).
  it("TC-003: validateCustomerForm fullName length < 3 should fail", () => {
    const data = { fullName: "Lê", phone: "0912345678", email: "a@gmail.com", course: "Java" };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(false);
    expect(res.errors.fullName).toBe("Họ tên phải có tối thiểu 3 ký tự");
  });

  // Note: TC-004 - Xác thực thành công khi Họ tên vừa đủ 3 ký tự.
  it("TC-004: validateCustomerForm fullName exactly 3 chars should pass", () => {
    const data = { fullName: "Nam", phone: "0912345678", email: "a@gmail.com", course: "Java" };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(true);
  });

  // Note: TC-005 - Xác thực thành công khi Họ tên đầy đủ hợp lệ.
  it("TC-005: validateCustomerForm fullName standard should pass", () => {
    const data = { fullName: "Nguyen Van A", phone: "0912345678", email: "a@gmail.com", course: "Java" };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(true);
  });

  // Note: TC-006 - Báo lỗi khi Số điện thoại trống.
  it("TC-006: validateCustomerForm phone is empty should fail", () => {
    const data = { fullName: "Nguyen Van A", phone: "", email: "a@gmail.com", course: "Java" };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(false);
    expect(res.errors.phone).toBe("Số điện thoại không được rỗng");
  });

  // Note: TC-007 - Báo lỗi khi Số điện thoại chứa ký tự chữ cái.
  it("TC-007: validateCustomerForm phone contains letters should fail", () => {
    const data = { fullName: "Nguyen Van A", phone: "0912345abc", email: "a@gmail.com", course: "Java" };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(false);
    expect(res.errors.phone).toBe("Số điện thoại chỉ được chứa số");
  });

  // Note: TC-008 - Báo lỗi khi Số điện thoại chứa ký tự đặc biệt.
  it("TC-008: validateCustomerForm phone contains symbols should fail", () => {
    const data = { fullName: "Nguyen Van A", phone: "0912-345-67", email: "a@gmail.com", course: "Java" };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(false);
    expect(res.errors.phone).toBe("Số điện thoại chỉ được chứa số");
  });

  // Note: TC-009 - Báo lỗi khi Số điện thoại quá ngắn (dưới 9 ký tự).
  it("TC-009: validateCustomerForm phone is too short should fail", () => {
    const data = { fullName: "Nguyen Van A", phone: "0912345", email: "a@gmail.com", course: "Java" };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(false);
    expect(res.errors.phone).toBe("Số điện thoại phải có độ dài từ 9 đến 11 ký tự");
  });

  // Note: TC-010 - Báo lỗi khi Số điện thoại quá dài (trên 11 ký tự).
  it("TC-010: validateCustomerForm phone is too long should fail", () => {
    const data = { fullName: "Nguyen Van A", phone: "0912345678901", email: "a@gmail.com", course: "Java" };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(false);
    expect(res.errors.phone).toBe("Số điện thoại phải có độ dài từ 9 đến 11 ký tự");
  });

  // Note: TC-011 - Xác thực thành công khi Số điện thoại hợp lệ (9 ký tự).
  it("TC-011: validateCustomerForm phone with 9 digits should pass", () => {
    const data = { fullName: "Nguyen Van A", phone: "123456789", email: "a@gmail.com", course: "Java" };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(true);
  });

  // Note: TC-012 - Xác thực thành công khi Số điện thoại hợp lệ (10 ký tự).
  it("TC-012: validateCustomerForm phone with 10 digits should pass", () => {
    const data = { fullName: "Nguyen Van A", phone: "0912345678", email: "a@gmail.com", course: "Java" };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(true);
  });

  // Note: TC-013 - Xác thực thành công khi Số điện thoại hợp lệ (11 ký tự).
  it("TC-013: validateCustomerForm phone with 11 digits should pass", () => {
    const data = { fullName: "Nguyen Van A", phone: "01234567890", email: "a@gmail.com", course: "Java" };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(true);
  });

  // Note: TC-014 - Báo lỗi khi Email bị bỏ trống.
  it("TC-014: validateCustomerForm email is empty should fail", () => {
    const data = { fullName: "Nguyen Van A", phone: "0912345678", email: "", course: "Java" };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(false);
    expect(res.errors.email).toBe("Email không được rỗng");
  });

  // Note: TC-015 - Báo lỗi khi Email thiếu ký tự '@'.
  it("TC-015: validateCustomerForm email missing @ should fail", () => {
    const data = { fullName: "Nguyen Van A", phone: "0912345678", email: "agmail.com", course: "Java" };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(false);
    expect(res.errors.email).toBe("Email không đúng định dạng (VD: name@example.com)");
  });

  // Note: TC-016 - Báo lỗi khi Email thiếu dấu chấm ở tên miền.
  it("TC-016: validateCustomerForm email missing dot should fail", () => {
    const data = { fullName: "Nguyen Van A", phone: "0912345678", email: "a@gmail", course: "Java" };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(false);
    expect(res.errors.email).toBe("Email không đúng định dạng (VD: name@example.com)");
  });

  // Note: TC-017 - Xác thực thành công khi Email đúng định dạng chuẩn.
  it("TC-017: validateCustomerForm email standard should pass", () => {
    const data = { fullName: "Nguyen Van A", phone: "0912345678", email: "test@example.com", course: "Java" };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(true);
  });

  // Note: TC-018 - Báo lỗi khi Khóa học quan tâm bị trống.
  it("TC-018: validateCustomerForm course is empty should fail", () => {
    const data = { fullName: "Nguyen Van A", phone: "0912345678", email: "a@gmail.com", course: "" };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(false);
    expect(res.errors.course).toBe("Khóa học quan tâm không được rỗng");
  });

  // =========================================================================
  // 2. KIỂM THỬ ĐÓNG GÓI DỮ LIỆU createCustomerPayload (TC-019 -> TC-021)
  // =========================================================================

  // Note: TC-019 - Kiểm tra createCustomerPayload tự động gán status là "new".
  it("TC-019: createCustomerPayload sets status to 'new'", () => {
    const payload = createCustomerPayload({ fullName: "A", phone: "123", email: "e", course: "c" });
    expect(payload.status).toBe("new");
  });

  // Note: TC-020 - Kiểm tra createCustomerPayload tự động gán isFavorite là false.
  it("TC-020: createCustomerPayload sets isFavorite to false", () => {
    const payload = createCustomerPayload({ fullName: "A", phone: "123", email: "e", course: "c" });
    expect(payload.isFavorite).toBe(false);
  });

  // Note: TC-021 - Kiểm tra createCustomerPayload cắt khoảng trắng thừa (trim) ở họ tên.
  it("TC-021: createCustomerPayload trims fullName", () => {
    const payload = createCustomerPayload({ fullName: "  Nguyen Van A  ", phone: "123", email: "e", course: "c" });
    expect(payload.fullName).toBe("Nguyen Van A");
  });

  // =========================================================================
  // 3. KIỂM THỬ ĐÓNG GÓI DỮ LIỆU updateCustomerPayload (TC-022 -> TC-024)
  // =========================================================================

  // Note: TC-022 - Kiểm tra updateCustomerPayload cắt khoảng trắng thừa ở trạng thái status.
  it("TC-022: updateCustomerPayload trims status", () => {
    const payload = updateCustomerPayload({ fullName: "A", phone: "123", email: "e", course: "c", status: "  contacted  " });
    expect(payload.status).toBe("contacted");
  });

  // Note: TC-023 - Kiểm tra updateCustomerPayload ép kiểu trường yêu thích sang Boolean.
  it("TC-023: updateCustomerPayload casts isFavorite to Boolean", () => {
    const payload = updateCustomerPayload({ fullName: "A", phone: "123", email: "e", course: "c", isFavorite: "yes" });
    expect(payload.isFavorite).toBe(true);
  });

  // Note: TC-024 - Kiểm tra updateCustomerPayload giữ nguyên các thông tin ghi chú khác.
  it("TC-024: updateCustomerPayload preserves note field", () => {
    const payload = updateCustomerPayload({ fullName: "A", phone: "1", email: "e", course: "c", note: "Test note" });
    expect(payload.note).toBe("Test note");
  });

  // =========================================================================
  // 4. KIỂM THỬ BỘ LỌC filterCustomers (TC-025 -> TC-027)
  // =========================================================================

  // Note: TC-025 - Bộ lọc "all" trả về toàn bộ danh sách không đổi.
  it("TC-025: filterCustomers 'all' returns all records", () => {
    const list = [{ id: 1 }, { id: 2 }];
    expect(filterCustomers(list, "all")).toEqual(list);
  });

  // Note: TC-026 - Bộ lọc "favorite" chỉ trả về danh sách khách hàng có isFavorite = true.
  it("TC-026: filterCustomers 'favorite' returns favorites only", () => {
    const list = [{ id: 1, isFavorite: true }, { id: 2, isFavorite: false }];
    expect(filterCustomers(list, "favorite")).toEqual([{ id: 1, isFavorite: true }]);
  });

  // Note: TC-027 - Bộ lọc theo trạng thái cụ thể (ví dụ: 'registered') chỉ trả về khách hàng có trạng thái đó.
  it("TC-027: filterCustomers returns matched status records", () => {
    const list = [{ id: 1, status: "new" }, { id: 2, status: "registered" }];
    expect(filterCustomers(list, "registered")).toEqual([{ id: 2, status: "registered" }]);
  });

  // =========================================================================
  // 5. KIỂM THỬ TÌM KIẾM searchCustomers (TC-028 -> TC-030)
  // =========================================================================

  // Note: TC-028 - Tìm kiếm từ khóa trống trả về toàn bộ danh sách.
  it("TC-028: searchCustomers with empty keyword returns original list", () => {
    const list = [{ fullName: "Nguyen Van A" }];
    expect(searchCustomers(list, "")).toEqual(list);
  });

  // Note: TC-029 - Tìm kiếm theo tên không phân biệt chữ hoa/thường.
  it("TC-029: searchCustomers matches name case-insensitively", () => {
    const list = [{ fullName: "Nguyễn Văn Sơn" }, { fullName: "Lê Minh Cường" }];
    expect(searchCustomers(list, "sơn")).toEqual([{ fullName: "Nguyễn Văn Sơn" }]);
  });

  // Note: TC-030 - Tìm kiếm theo khóa học đăng ký quan tâm.
  it("TC-030: searchCustomers matches course name", () => {
    const list = [{ fullName: "A", course: "Vite JS" }, { fullName: "B", course: "React" }];
    expect(searchCustomers(list, "vite")).toEqual([{ fullName: "A", course: "Vite JS" }]);
  });
});
