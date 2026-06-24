import { describe, it, expect } from "vitest";
import {
  validateCustomerForm,
  createCustomerPayload,
  updateCustomerPayload,
  filterCustomers,
  searchCustomers,
} from "../../src/customerBusiness.js";

describe("Luồng nghiệp vụ khách hàng (Customer Business Flow Tests - 40 Test Cases)", () => {

  // =========================================================================
  // PHẦN A: KIỂM THỬ XÁC THỰC FORM HỌ TÊN (TC-001 -> TC-006)
  // =========================================================================

  it("TC-001: Họ tên trống -> Báo lỗi rỗng", () => {
    const data = { fullName: "", phone: "0912345678", email: "a@gmail.com", course: "Java" };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(false);
    expect(res.errors.fullName).toBe("Họ tên không được rỗng");
  });

  it("TC-002: Họ tên chỉ chứa khoảng trắng -> Báo lỗi rỗng", () => {
    const data = { fullName: "   ", phone: "0912345678", email: "a@gmail.com", course: "Java" };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(false);
    expect(res.errors.fullName).toBe("Họ tên không được rỗng");
  });

  it("TC-003: Họ tên quá ngắn (2 ký tự) -> Báo lỗi tối thiểu 3 ký tự", () => {
    const data = { fullName: "Lê", phone: "0912345678", email: "a@gmail.com", course: "Java" };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(false);
    expect(res.errors.fullName).toBe("Họ tên phải có tối thiểu 3 ký tự");
  });

  it("TC-004: Họ tên vừa đủ ngắn (3 ký tự) -> Hợp lệ", () => {
    const data = { fullName: "Nam", phone: "0912345678", email: "a@gmail.com", course: "Java" };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(true);
  });

  it("TC-005: Họ tên tiếng Việt có dấu -> Hợp lệ", () => {
    const data = { fullName: "Trần Thế Mỹ", phone: "0912345678", email: "a@gmail.com", course: "Java" };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(true);
  });

  it("TC-006: Họ tên cực kỳ dài -> Hợp lệ", () => {
    const data = { fullName: "Nguyễn Trần Hoàng Phan Anh Vũ Quốc Bảo K", phone: "0912345678", email: "a@gmail.com", course: "Java" };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(true);
  });

  // =========================================================================
  // PHẦN B: KIỂM THỬ XÁC THỰC SỐ ĐIỆN THOẠI (TC-007 -> TC-015)
  // =========================================================================

  it("TC-007: Số điện thoại trống -> Báo lỗi rỗng", () => {
    const data = { fullName: "Nguyễn Văn A", phone: "", email: "a@gmail.com", course: "Java" };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(false);
    expect(res.errors.phone).toBe("Số điện thoại không được rỗng");
  });

  it("TC-008: Số điện thoại chỉ chứa khoảng trắng -> Báo lỗi rỗng", () => {
    const data = { fullName: "Nguyễn Văn A", phone: "   ", email: "a@gmail.com", course: "Java" };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(false);
    expect(res.errors.phone).toBe("Số điện thoại không được rỗng");
  });

  it("TC-009: Số điện thoại chứa ký tự chữ -> Báo lỗi chỉ được chứa số", () => {
    const data = { fullName: "Nguyễn Văn A", phone: "091234567a", email: "a@gmail.com", course: "Java" };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(false);
    expect(res.errors.phone).toBe("Số điện thoại chỉ được chứa số");
  });

  it("TC-010: Số điện thoại chứa ký tự đặc biệt -> Báo lỗi chỉ được chứa số", () => {
    const data = { fullName: "Nguyễn Văn A", phone: "0912-34567", email: "a@gmail.com", course: "Java" };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(false);
    expect(res.errors.phone).toBe("Số điện thoại chỉ được chứa số");
  });

  it("TC-011: Số điện thoại quá ngắn (8 số) -> Báo lỗi độ dài", () => {
    const data = { fullName: "Nguyễn Văn A", phone: "12345678", email: "a@gmail.com", course: "Java" };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(false);
    expect(res.errors.phone).toBe("Số điện thoại phải có độ dài từ 9 đến 11 ký tự");
  });

  it("TC-012: Số điện thoại quá dài (12 số) -> Báo lỗi độ dài", () => {
    const data = { fullName: "Nguyễn Văn A", phone: "123456789012", email: "a@gmail.com", course: "Java" };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(false);
    expect(res.errors.phone).toBe("Số điện thoại phải có độ dài từ 9 đến 11 ký tự");
  });

  it("TC-013: Số điện thoại hợp lệ ở biên dưới (9 số) -> Hợp lệ", () => {
    const data = { fullName: "Nguyễn Văn A", phone: "123456789", email: "a@gmail.com", course: "Java" };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(true);
  });

  it("TC-014: Số điện thoại hợp lệ ở giữa (10 số) -> Hợp lệ", () => {
    const data = { fullName: "Nguyễn Văn A", phone: "0912345678", email: "a@gmail.com", course: "Java" };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(true);
  });

  it("TC-015: Số điện thoại hợp lệ ở biên trên (11 số) -> Hợp lệ", () => {
    const data = { fullName: "Nguyễn Văn A", phone: "01234567890", email: "a@gmail.com", course: "Java" };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(true);
  });

  // =========================================================================
  // PHẦN C: KIỂM THỬ XÁC THỰC EMAIL (TC-016 -> TC-022)
  // =========================================================================

  it("TC-016: Email trống -> Báo lỗi rỗng", () => {
    const data = { fullName: "Nguyễn Văn A", phone: "0912345678", email: "", course: "Java" };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(false);
    expect(res.errors.email).toBe("Email không được rỗng");
  });

  it("TC-017: Email thiếu ký tự @ -> Báo lỗi sai định dạng", () => {
    const data = { fullName: "Nguyễn Văn A", phone: "0912345678", email: "agmail.com", course: "Java" };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(false);
    expect(res.errors.email).toBe("Email không đúng định dạng (VD: name@example.com)");
  });

  it("TC-018: Email thiếu tên miền chính (.com / .vn...) -> Báo lỗi sai định dạng", () => {
    const data = { fullName: "Nguyễn Văn A", phone: "0912345678", email: "a@gmail", course: "Java" };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(false);
    expect(res.errors.email).toBe("Email không đúng định dạng (VD: name@example.com)");
  });

  it("TC-019: Email thiếu phần đứng trước @ -> Báo lỗi sai định dạng", () => {
    const data = { fullName: "Nguyễn Văn A", phone: "0912345678", email: "@gmail.com", course: "Java" };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(false);
    expect(res.errors.email).toBe("Email không đúng định dạng (VD: name@example.com)");
  });

  it("TC-020: Email chứa nhiều khoảng trắng -> Báo lỗi sai định dạng", () => {
    const data = { fullName: "Nguyễn Văn A", phone: "0912345678", email: "a  b@gmail.com", course: "Java" };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(false);
    expect(res.errors.email).toBe("Email không đúng định dạng (VD: name@example.com)");
  });

  it("TC-021: Email chuẩn định dạng .com -> Hợp lệ", () => {
    const data = { fullName: "Nguyễn Văn A", phone: "0912345678", email: "alex.smith@example.com", course: "Java" };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(true);
  });

  it("TC-022: Email có tên miền con và đa cấp (.edu.vn) -> Hợp lệ", () => {
    const data = { fullName: "Nguyễn Văn A", phone: "0912345678", email: "sinhvien@school.edu.vn", course: "Java" };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(true);
  });

  // =========================================================================
  // PHẦN D: KIỂM THỬ XÁC THỰC KHÓA HỌC (TC-023 -> TC-025)
  // =========================================================================

  it("TC-023: Khóa học trống -> Báo lỗi rỗng", () => {
    const data = { fullName: "Nguyễn Văn A", phone: "0912345678", email: "a@gmail.com", course: "" };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(false);
    expect(res.errors.course).toBe("Khóa học quan tâm không được rỗng");
  });

  it("TC-024: Khóa học chỉ chứa khoảng trắng -> Báo lỗi rỗng", () => {
    const data = { fullName: "Nguyễn Văn A", phone: "0912345678", email: "a@gmail.com", course: "   " };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(false);
    expect(res.errors.course).toBe("Khóa học quan tâm không được rỗng");
  });

  it("TC-025: Khóa học hợp lệ -> Hợp lệ", () => {
    const data = { fullName: "Nguyễn Văn A", phone: "0912345678", email: "a@gmail.com", course: "Python Masterclass" };
    const res = validateCustomerForm(data);
    expect(res.isValid).toBe(true);
  });

  // =========================================================================
  // PHẦN E: KIỂM THỬ ĐÓNG GÓI DỮ LIỆU PAYLOAD (TC-026 -> TC-030)
  // =========================================================================

  it("TC-026: createCustomerPayload tự động đặt trạng thái khách mới (new)", () => {
    const data = { fullName: " Sơn ", phone: "0909", email: "s@g.c", course: "CSS", note: "abc" };
    const payload = createCustomerPayload(data);
    expect(payload.status).toBe("new");
  });

  it("TC-027: createCustomerPayload tự động đặt yêu thích là false", () => {
    const data = { fullName: " Sơn ", phone: "0909", email: "s@g.c", course: "CSS", note: "abc" };
    const payload = createCustomerPayload(data);
    expect(payload.isFavorite).toBe(false);
  });

  it("TC-028: createCustomerPayload cắt khoảng trắng thừa ở họ tên", () => {
    const data = { fullName: "  Nguyen Van A  ", phone: "0909", email: "s@g.c", course: "CSS" };
    const payload = createCustomerPayload(data);
    expect(payload.fullName).toBe("Nguyen Van A");
  });

  it("TC-029: updateCustomerPayload cắt khoảng trắng thừa ở trạng thái cập nhật", () => {
    const data = { fullName: "A", phone: "09", email: "e", course: "c", status: "  contacted  " };
    const payload = updateCustomerPayload(data);
    expect(payload.status).toBe("contacted");
  });

  it("TC-030: updateCustomerPayload chuyển đổi kiểu dữ liệu yêu thích về boolean", () => {
    const data1 = { fullName: "A", phone: "09", email: "e", course: "c", isFavorite: "truthy string" };
    const payload1 = updateCustomerPayload(data1);
    expect(payload1.isFavorite).toBe(true);

    const data2 = { fullName: "A", phone: "09", email: "e", course: "c", isFavorite: 0 };
    const payload2 = updateCustomerPayload(data2);
    expect(payload2.isFavorite).toBe(false);
  });

  // =========================================================================
  // PHẦN F: KIỂM THỬ BỘ LỌC KHÁCH HÀNG (TC-031 -> TC-035)
  // =========================================================================

  it("TC-031: filterCustomers 'all' -> Trả về toàn bộ danh sách", () => {
    const list = [{ id: 1, status: "new" }, { id: 2, status: "contacted" }];
    expect(filterCustomers(list, "all")).toEqual(list);
  });

  it("TC-032: filterCustomers 'favorite' -> Chỉ trả về học viên có isFavorite = true", () => {
    const list = [
      { id: 1, isFavorite: true },
      { id: 2, isFavorite: false },
      { id: 3, isFavorite: true },
    ];
    const res = filterCustomers(list, "favorite");
    expect(res).toEqual([{ id: 1, isFavorite: true }, { id: 3, isFavorite: true }]);
  });

  it("TC-033: filterCustomers 'new' -> Chỉ trả về học viên có status = 'new'", () => {
    const list = [
      { id: 1, status: "new" },
      { id: 2, status: "contacted" },
    ];
    const res = filterCustomers(list, "new");
    expect(res).toEqual([{ id: 1, status: "new" }]);
  });

  it("TC-034: filterCustomers 'contacted' -> Chỉ trả về học viên có status = 'contacted'", () => {
    const list = [
      { id: 1, status: "new" },
      { id: 2, status: "contacted" },
    ];
    const res = filterCustomers(list, "contacted");
    expect(res).toEqual([{ id: 2, status: "contacted" }]);
  });

  it("TC-035: filterCustomers 'registered' -> Chỉ trả về học viên có status = 'registered'", () => {
    const list = [
      { id: 1, status: "registered" },
      { id: 2, status: "contacted" },
    ];
    const res = filterCustomers(list, "registered");
    expect(res).toEqual([{ id: 1, status: "registered" }]);
  });

  // =========================================================================
  // PHẦN G: KIỂM THỬ TÌM KIẾM KHÁCH HÀNG (TC-036 -> TC-040)
  // =========================================================================

  it("TC-036: searchCustomers với từ khóa rỗng -> Trả về toàn bộ danh sách", () => {
    const list = [{ fullName: "A" }, { fullName: "B" }];
    expect(searchCustomers(list, "")).toEqual(list);
  });

  it("TC-037: searchCustomers tìm kiếm theo tên không phân biệt hoa thường", () => {
    const list = [{ fullName: "Nguyễn Văn Sơn" }, { fullName: "Lê Minh Cường" }];
    const res = searchCustomers(list, "sơn");
    expect(res).toEqual([{ fullName: "Nguyễn Văn Sơn" }]);
  });

  it("TC-038: searchCustomers tìm kiếm theo số điện thoại", () => {
    const list = [
      { fullName: "A", phone: "0912345" },
      { fullName: "B", phone: "0988888" },
    ];
    const res = searchCustomers(list, "8888");
    expect(res).toEqual([{ fullName: "B", phone: "0988888" }]);
  });

  it("TC-039: searchCustomers tìm kiếm theo email", () => {
    const list = [
      { fullName: "A", email: "a@school.vn" },
      { fullName: "B", email: "b@gmail.com" },
    ];
    const res = searchCustomers(list, "school");
    expect(res).toEqual([{ fullName: "A", email: "a@school.vn" }]);
  });

  it("TC-040: searchCustomers tìm kiếm theo môn học đăng ký", () => {
    const list = [
      { fullName: "A", course: "JavaScript Basics" },
      { fullName: "B", course: "Advanced Python" },
    ];
    const res = searchCustomers(list, "python");
    expect(res).toEqual([{ fullName: "B", course: "Advanced Python" }]);
  });
});
