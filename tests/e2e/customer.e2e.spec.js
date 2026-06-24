import { test, expect } from "@playwright/test";

// Cơ sở dữ liệu giả lập cho E2E tests
let mockCustomers = [];

function resetMockCustomers() {
  mockCustomers = [
    {
      id: "cust-1",
      fullName: "Nguyễn Văn A",
      phone: "0901234567",
      email: "anguyen@example.com",
      course: "React JS",
      status: "new",
      isFavorite: false,
      createdAt: "2026-01-24T10:00:00.000Z",
    },
    {
      id: "cust-2",
      fullName: "Trần Thị B",
      phone: "0912345678",
      email: "btran@example.com",
      course: "Node.js Developer",
      status: "contacted",
      isFavorite: true,
      createdAt: "2026-01-24T11:00:00.000Z",
    },
    {
      id: "cust-3",
      fullName: "Lê Văn C",
      phone: "0923456789",
      email: "cle@example.com",
      course: "Fullstack Web",
      status: "registered",
      isFavorite: false,
      createdAt: "2026-01-24T12:00:00.000Z",
    },
  ];
}

test.beforeEach(async ({ page }) => {
  resetMockCustomers();

  // Thiết lập route giả lập cho các API gọi đến JSON Server
  await page.route("**/customers", async (route, request) => {
    const method = request.method();
    if (method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockCustomers),
      });
    } else if (method === "POST") {
      const data = JSON.parse(request.postData() || "{}");
      const newCustomer = {
        id: `cust-${Date.now()}`,
        status: "new",
        isFavorite: false,
        createdAt: new Date().toISOString(),
        ...data,
      };
      mockCustomers.push(newCustomer);
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(newCustomer),
      });
    }
  });

  await page.route("**/customers/*", async (route, request) => {
    const method = request.method();
    const url = request.url();
    // Lấy ID an toàn (bỏ qua query parameters nếu có)
    const urlPath = new URL(url).pathname;
    const id = urlPath.split("/").pop();
    const customerIndex = mockCustomers.findIndex((c) => c.id === id);

    if (method === "GET") {
      if (customerIndex !== -1) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockCustomers[customerIndex]),
        });
      } else {
        await route.fulfill({ status: 404 });
      }
    } else if (method === "PUT" || method === "PATCH") {
      const data = JSON.parse(request.postData() || "{}");
      if (customerIndex !== -1) {
        mockCustomers[customerIndex] = {
          ...mockCustomers[customerIndex],
          ...data,
        };
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockCustomers[customerIndex]),
        });
      } else {
        await route.fulfill({ status: 404 });
      }
    } else if (method === "DELETE") {
      if (customerIndex !== -1) {
        const deleted = mockCustomers.splice(customerIndex, 1);
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(deleted[0]),
        });
      } else {
        await route.fulfill({ status: 404 });
      }
    }
  });

  // Điều hướng đến dashboard
  await page.goto("/");
  // Chờ mạng lưới rảnh rỗi và bảng tải xong
  await page.waitForLoadState("networkidle");
  // Đợi bảng hiển thị đầy đủ 3 dòng dữ liệu để đảm bảo ứng dụng đã tải xong các script Bootstrap & Event Listeners
  await expect(page.locator("#customerTableBody tr")).toHaveCount(3);
});

test.describe("CRM Dashboard E2E Tests - Giao diện & Thống kê ban đầu (Group 1)", () => {
  // TC-E2E-001: Hiển thị tiêu đề và phụ đề dashboard chính xác
  test("TC-E2E-001: Hien thi tieu de va phu de dashboard chinh xac", async ({ page }) => {
    await expect(page.locator("h2").first()).toContainText("Quản lý khách hàng");
    await expect(page.locator(".dashboard-header p")).toHaveText(
      "Hệ thống quản trị dữ liệu học viên"
    );
  });

  // TC-E2E-002: Thống kê số lượng "Khách mới" chính xác
  test("TC-E2E-002: Thong ke so luong 'Khach moi' chinh xac", async ({ page }) => {
    await expect(page.locator("#stat-new")).toHaveText("1");
  });

  // TC-E2E-003: Thống kê số lượng "Đã tư vấn" chính xác
  test("TC-E2E-003: Thong ke so luong 'Da tu van' chinh xac", async ({ page }) => {
    await expect(page.locator("#stat-contacted")).toHaveText("1");
  });

  // TC-E2E-004: Thống kê số lượng "Đã đăng ký" chính xác
  test("TC-E2E-004: Thong ke so luong 'Da dang ky' chinh xac", async ({ page }) => {
    await expect(page.locator("#stat-registered")).toHaveText("1");
  });

  // TC-E2E-005: Hiển thị bảng khách hàng với đúng 7 cột tiêu đề
  test("TC-E2E-005: Hien thi bang khach hang voi dung 7 cot tieu de", async ({ page }) => {
    const headers = page.locator("table thead th");
    await expect(headers).toHaveCount(7);
    const expectedHeaders = ["STT", "Họ tên", "Liên hệ", "Khóa học", "Trạng thái", "Ngày tạo", "Thao tác"];
    for (let i = 0; i < 7; i++) {
      await expect(headers.nth(i)).toHaveText(expectedHeaders[i]);
    }
  });

  // TC-E2E-006: Hiển thị số lượng tổng chính xác
  test("TC-E2E-006: Hien thi so luong tong chinh xac", async ({ page }) => {
    await expect(page.locator("#count")).toHaveText("Tổng số đang hiển thị: 3");
  });
});

test.describe("CRM Dashboard E2E Tests - Tìm kiếm & Bộ lọc (Group 2)", () => {
  // TC-E2E-007: Tìm kiếm khách hàng theo tên (có kết quả phù hợp)
  test("TC-E2E-007: Tim kiem khach hang theo ten (co ket qua phu hop)", async ({ page }) => {
    const searchInput = page.locator("#searchInput");
    await searchInput.fill("Nguyễn Văn A");
    const rows = page.locator("#customerTableBody tr");
    await expect(rows).toHaveCount(1);
    await expect(rows.first().locator("td").nth(1)).toContainText("Nguyễn Văn A");
  });

  // TC-E2E-008: Tìm kiếm khách hàng theo số điện thoại (có kết quả phù hợp)
  test("TC-E2E-008: Tim kiem khach hang theo so dien thoai (co ket qua phu hop)", async ({ page }) => {
    const searchInput = page.locator("#searchInput");
    await searchInput.fill("0912345678");
    const rows = page.locator("#customerTableBody tr");
    await expect(rows).toHaveCount(1);
    await expect(rows.first().locator("td").nth(1)).toContainText("Trần Thị B");
  });

  // TC-E2E-009: Tìm kiếm khách hàng theo email (có kết quả phù hợp)
  test("TC-E2E-009: Tim kiem khach hang theo email (co ket qua phu hop)", async ({ page }) => {
    const searchInput = page.locator("#searchInput");
    await searchInput.fill("cle@example.com");
    const rows = page.locator("#customerTableBody tr");
    await expect(rows).toHaveCount(1);
    await expect(rows.first().locator("td").nth(1)).toContainText("Lê Văn C");
  });

  // TC-E2E-010: Tìm kiếm không tìm thấy kết quả nào (hiển thị thông báo trống)
  test("TC-E2E-010: Tim kiem khong tim thay ket qua nao (hien thi thong bao trong)", async ({ page }) => {
    const searchInput = page.locator("#searchInput");
    await searchInput.fill("Không có ai tên thế này");
    const rows = page.locator("#customerTableBody tr");
    await expect(rows).toHaveCount(1);
    await expect(rows.locator("td")).toHaveText("Không có khách hàng tương ứng");
  });

  // TC-E2E-011: Lọc khách hàng theo trạng thái "Mới"
  test("TC-E2E-011: Loc khach hang theo trang thai 'Moi'", async ({ page }) => {
    await page.locator('#filterButtonGroup button[data-filter="new"]').click();
    const rows = page.locator("#customerTableBody tr");
    await expect(rows).toHaveCount(1);
    await expect(rows.first().locator("td").nth(4)).toContainText("Khách mới");
  });

  // TC-E2E-012: Lọc khách hàng theo trạng thái "Tư vấn"
  test("TC-E2E-012: Loc khach hang theo trang thai 'Tu van'", async ({ page }) => {
    await page.locator('#filterButtonGroup button[data-filter="contacted"]').click();
    const rows = page.locator("#customerTableBody tr");
    await expect(rows).toHaveCount(1);
    await expect(rows.first().locator("td").nth(4)).toContainText("Đã tư vấn");
  });

  // TC-E2E-013: Lọc khách hàng theo trạng thái "Đăng ký"
  test("TC-E2E-013: Loc khach hang theo trang thai 'Dang ky'", async ({ page }) => {
    await page.locator('#filterButtonGroup button[data-filter="registered"]').click();
    const rows = page.locator("#customerTableBody tr");
    await expect(rows).toHaveCount(1);
    await expect(rows.first().locator("td").nth(4)).toContainText("Đã đăng ký");
  });

  // TC-E2E-014: Lọc khách hàng theo danh sách "Yêu thích"
  test("TC-E2E-014: Loc khach hang theo danh sach 'Yeu thich'", async ({ page }) => {
    await page.locator('#filterButtonGroup button[data-filter="favorite"]').click();
    const rows = page.locator("#customerTableBody tr");
    await expect(rows).toHaveCount(1);
    await expect(rows.first().locator("td").nth(1)).toContainText("Trần Thị B");
  });
});

test.describe("CRM Dashboard E2E Tests - Thêm mới học viên & Validation (Group 3)", () => {
  test.beforeEach(async ({ page }) => {
    const btn = page.locator("button:has-text('Thêm khách hàng')");
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page.locator("#customerModalAdd")).toBeVisible();
  });

  // TC-E2E-015: Mở Modal Thêm mới và kiểm tra sự hiện diện của các trường bắt buộc (*)
  test("TC-E2E-015: Mo Modal Them moi va kiem tra su hien dien cua cac truong bat buoc (*)", async ({ page }) => {
    const asterisks = page.locator("#customerModalAdd label span.text-danger");
    await expect(asterisks).toHaveCount(4); // Họ tên, Số điện thoại, Email, Khóa học
  });

  // TC-E2E-016: Reset form và xóa các lỗi validation khi đóng Modal Thêm mới
  test("TC-E2E-016: Reset form va xoa cac loi validation khi dong Modal Them moi", async ({ page }) => {
    await page.locator("#btn-save-customer").click();
    await expect(page.locator("#customerFormAdd #fullName")).toHaveClass(/is-invalid/);

    await page.locator('#customerModalAdd button:has-text("Hủy")').click();
    await expect(page.locator("#customerModalAdd")).toBeHidden();

    await page.locator("button:has-text('Thêm khách hàng')").click();
    await expect(page.locator("#customerModalAdd")).toBeVisible();

    await expect(page.locator("#customerFormAdd #fullName")).not.toHaveClass(/is-invalid/);
    await expect(page.locator("#customerFormAdd #fullName")).toHaveValue("");
  });

  // TC-E2E-017: Báo lỗi "Họ tên không được rỗng" khi không nhập Họ tên
  test("TC-E2E-017: Bao loi 'Ho ten khong duoc rong' khi khong nhap Ho ten", async ({ page }) => {
    await page.locator("#customerModalAdd #phone").fill("0987654321");
    await page.locator("#customerModalAdd #email").fill("new@example.com");
    await page.locator("#customerModalAdd #course").fill("VueJS");
    await page.locator("#btn-save-customer").click();

    const nameInput = page.locator("#customerFormAdd #fullName");
    const nameError = page.locator("#customerFormAdd #fullName-error");
    await expect(nameInput).toHaveClass(/is-invalid/);
    await expect(nameError).toHaveText("Họ tên không được rỗng");
  });

  // TC-E2E-018: Báo lỗi "Họ tên phải có tối thiểu 3 ký tự" khi nhập Họ tên quá ngắn
  test("TC-E2E-018: Bao loi 'Ho ten phai co toi thieu 3 ky tu' khi nhap Ho ten qua ngan", async ({ page }) => {
    await page.locator("#customerModalAdd #fullName").fill("An");
    await page.locator("#customerModalAdd #phone").fill("0987654321");
    await page.locator("#customerModalAdd #email").fill("new@example.com");
    await page.locator("#customerModalAdd #course").fill("VueJS");
    await page.locator("#btn-save-customer").click();

    const nameInput = page.locator("#customerFormAdd #fullName");
    const nameError = page.locator("#customerFormAdd #fullName-error");
    await expect(nameInput).toHaveClass(/is-invalid/);
    await expect(nameError).toHaveText("Họ tên phải có tối thiểu 3 ký tự");
  });

  // TC-E2E-019: Báo lỗi "Số điện thoại không được rỗng" khi để trống Số điện thoại
  test("TC-E2E-019: Bao loi 'So dien thoai khong duoc rong' khi de trong So dien thoai", async ({ page }) => {
    await page.locator("#customerModalAdd #fullName").fill("Học viên mới");
    await page.locator("#customerModalAdd #email").fill("new@example.com");
    await page.locator("#customerModalAdd #course").fill("VueJS");
    await page.locator("#btn-save-customer").click();

    const phoneInput = page.locator("#customerFormAdd #phone");
    const phoneError = page.locator("#customerFormAdd #phone-error");
    await expect(phoneInput).toHaveClass(/is-invalid/);
    await expect(phoneError).toHaveText("Số điện thoại không được rỗng");
  });

  // TC-E2E-020: Báo lỗi "Số điện thoại chỉ được chứa số" khi nhập ký tự chữ vào Số điện thoại
  test("TC-E2E-020: Bao loi 'So dien thoai chi duoc chua so' khi nhap ky tu chu vao So dien thoai", async ({ page }) => {
    await page.locator("#customerModalAdd #fullName").fill("Học viên mới");
    await page.locator("#customerModalAdd #phone").fill("098765abcd");
    await page.locator("#customerModalAdd #email").fill("new@example.com");
    await page.locator("#customerModalAdd #course").fill("VueJS");
    await page.locator("#btn-save-customer").click();

    const phoneInput = page.locator("#customerFormAdd #phone");
    const phoneError = page.locator("#customerFormAdd #phone-error");
    await expect(phoneInput).toHaveClass(/is-invalid/);
    await expect(phoneError).toHaveText("Số điện thoại chỉ được chứa số");
  });

  // TC-E2E-021: Báo lỗi "Số điện thoại phải có độ dài từ 9 đến 11 ký tự" khi nhập độ dài không hợp lệ
  test("TC-E2E-021: Bao loi 'So dien thoai phai co do dai tu 9 den 11 ky tu' khi nhap do dai khong hop le", async ({ page }) => {
    await page.locator("#customerModalAdd #fullName").fill("Học viên mới");
    await page.locator("#customerModalAdd #phone").fill("12345");
    await page.locator("#customerModalAdd #email").fill("new@example.com");
    await page.locator("#customerModalAdd #course").fill("VueJS");
    await page.locator("#btn-save-customer").click();

    const phoneInput = page.locator("#customerFormAdd #phone");
    const phoneError = page.locator("#customerFormAdd #phone-error");
    await expect(phoneInput).toHaveClass(/is-invalid/);
    await expect(phoneError).toHaveText("Số điện thoại phải có độ dài từ 9 đến 11 ký tự");
  });

  // TC-E2E-022: Báo lỗi "Email không được rỗng" khi để trống Email
  test("TC-E2E-022: Bao loi 'Email khong duoc rong' khi de trong Email", async ({ page }) => {
    await page.locator("#customerModalAdd #fullName").fill("Học viên mới");
    await page.locator("#customerModalAdd #phone").fill("0987654321");
    await page.locator("#customerModalAdd #course").fill("VueJS");
    await page.locator("#btn-save-customer").click();

    const emailInput = page.locator("#customerFormAdd #email");
    const emailError = page.locator("#customerFormAdd #email-error");
    await expect(emailInput).toHaveClass(/is-invalid/);
    await expect(emailError).toHaveText("Email không được rỗng");
  });
});

test.describe("CRM Dashboard E2E Tests - Thêm mới học viên thành công & Định dạng dữ liệu (Group 4)", () => {
  test.beforeEach(async ({ page }) => {
    const btn = page.locator("button:has-text('Thêm khách hàng')");
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page.locator("#customerModalAdd")).toBeVisible();
  });

  // TC-E2E-023: Báo lỗi "Email không đúng định dạng (VD: name@example.com)" khi nhập email sai cú pháp
  test("TC-E2E-023: Bao loi 'Email khong dung dinh dang' khi nhap email sai cu phap", async ({ page }) => {
    await page.locator("#customerModalAdd #fullName").fill("Học viên mới");
    await page.locator("#customerModalAdd #phone").fill("0987654321");
    await page.locator("#customerModalAdd #email").fill("new_email_invalid");
    await page.locator("#customerModalAdd #course").fill("VueJS");
    await page.locator("#btn-save-customer").click();

    const emailInput = page.locator("#customerFormAdd #email");
    const emailError = page.locator("#customerFormAdd #email-error");
    await expect(emailInput).toHaveClass(/is-invalid/);
    await expect(emailError).toHaveText("Email không đúng định dạng (VD: name@example.com)");
  });

  // TC-E2E-024: Báo lỗi "Khóa học quan tâm không được rỗng" khi để trống Khóa học
  test("TC-E2E-024: Bao loi 'Khoa hoc quan tam khong duoc rong' khi de trong Khoa hoc", async ({ page }) => {
    await page.locator("#customerModalAdd #fullName").fill("Học viên mới");
    await page.locator("#customerModalAdd #phone").fill("0987654321");
    await page.locator("#customerModalAdd #email").fill("new@example.com");
    await page.locator("#btn-save-customer").click();

    const courseInput = page.locator("#customerFormAdd #course");
    const courseError = page.locator("#customerFormAdd #course-error");
    await expect(courseInput).toHaveClass(/is-invalid/);
    await expect(courseError).toHaveText("Khóa học quan tâm không được rỗng");
  });

  // TC-E2E-025: Thêm mới khách hàng thành công với đầy đủ thông tin hợp lệ
  test("TC-E2E-025: Them moi khach hang thanh cong voi day du thong tin hop le", async ({ page }) => {
    await page.locator("#customerModalAdd #fullName").fill("Trương Gia Bình");
    await page.locator("#customerModalAdd #phone").fill("0977112233");
    await page.locator("#customerModalAdd #email").fill("binhtg@example.com");
    await page.locator("#customerModalAdd #course").fill("Next.js Enterprise");
    await page.locator("#btn-save-customer").click();

    await expect(page.locator("#customerModalAdd")).toBeHidden();
  });

  // TC-E2E-026: Khách hàng mới thêm thành công tự động đứng ở dòng đầu tiên
  test("TC-E2E-026: Khach hang moi them thanh cong tu dong dung o dong dau tien", async ({ page }) => {
    await page.locator("#customerModalAdd #fullName").fill("Trương Gia Bình");
    await page.locator("#customerModalAdd #phone").fill("0977112233");
    await page.locator("#customerModalAdd #email").fill("binhtg@example.com");
    await page.locator("#customerModalAdd #course").fill("Next.js Enterprise");
    await page.locator("#btn-save-customer").click();

    await expect(page.locator("#customerModalAdd")).toBeHidden();

    // Check hàng đầu tiên (STT 1)
    const firstRow = page.locator("#customerTableBody tr").first();
    await expect(firstRow.locator("td").nth(1)).toContainText("Trương Gia Bình");
    await expect(firstRow.locator("td").nth(3)).toHaveText("Next.js Enterprise");
  });
});

test.describe("CRM Dashboard E2E Tests - Cập nhật học viên & Validation (Group 5)", () => {
  // TC-E2E-027: Mở Modal Cập nhật và kiểm tra dữ liệu hiện tại được điền sẵn chính xác
  test("TC-E2E-027: Mo Modal Cap nhat va kiem tra du lieu hien tai duoc dien san chinh xac", async ({ page }) => {
    const btn = page.locator('.btn-edit[data-id="cust-1"]');
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page.locator("#customerModalUpdate")).toBeVisible();

    await expect(page.locator("#customerModalUpdate #fullName")).toHaveValue("Nguyễn Văn A");
    await expect(page.locator("#customerModalUpdate #phone")).toHaveValue("0901234567");
    await expect(page.locator("#customerModalUpdate #email")).toHaveValue("anguyen@example.com");
    await expect(page.locator("#customerModalUpdate #course")).toHaveValue("React JS");
  });

  // TC-E2E-028: Reset form và xóa các lỗi validation khi đóng Modal Cập nhật
  test("TC-E2E-028: Reset form va xoa cac loi validation khi dong Modal Cap nhat", async ({ page }) => {
    const btn = page.locator('.btn-edit[data-id="cust-1"]');
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page.locator("#customerModalUpdate")).toBeVisible();

    await page.locator("#customerModalUpdate #fullName").fill("");
    await page.locator("#btn-update-customer").click();
    await expect(page.locator("#customerFormUpdate #fullName")).toHaveClass(/is-invalid/);

    // Đóng bằng nút X hoặc Hủy
    await page.locator('#customerModalUpdate button:has-text("Hủy")').click();
    await expect(page.locator("#customerModalUpdate")).toBeHidden();

    // Mở lại
    await page.locator('.btn-edit[data-id="cust-1"]').click();
    await expect(page.locator("#customerModalUpdate")).toBeVisible();
    await expect(page.locator("#customerFormUpdate #fullName")).not.toHaveClass(/is-invalid/);
    await expect(page.locator("#customerFormUpdate #fullName")).toHaveValue("Nguyễn Văn A");
  });

  // TC-E2E-029: Báo lỗi "Họ tên không được rỗng" khi cập nhật Họ tên thành rỗng
  test("TC-E2E-029: Bao loi 'Ho ten khong duoc rong' khi cap nhat Ho ten thanh rong", async ({ page }) => {
    const btn = page.locator('.btn-edit[data-id="cust-1"]');
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page.locator("#customerModalUpdate")).toBeVisible();

    await page.locator("#customerModalUpdate #fullName").fill("");
    await page.locator("#btn-update-customer").click();

    const nameInput = page.locator("#customerFormUpdate #fullName");
    const nameError = page.locator("#customerFormUpdate #fullName-error");
    await expect(nameInput).toHaveClass(/is-invalid/);
    await expect(nameError).toHaveText("Họ tên không được rỗng");
  });

  // TC-E2E-030: Báo lỗi "Họ tên phải có tối thiểu 3 ký tự" khi cập nhật Họ tên quá ngắn
  test("TC-E2E-030: Bao loi 'Ho ten phai co toi thieu 3 ky tu' khi cap nhat Ho ten qua ngan", async ({ page }) => {
    const btn = page.locator('.btn-edit[data-id="cust-1"]');
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page.locator("#customerModalUpdate")).toBeVisible();

    await page.locator("#customerModalUpdate #fullName").fill("An");
    await page.locator("#btn-update-customer").click();

    const nameInput = page.locator("#customerFormUpdate #fullName");
    const nameError = page.locator("#customerFormUpdate #fullName-error");
    await expect(nameInput).toHaveClass(/is-invalid/);
    await expect(nameError).toHaveText("Họ tên phải có tối thiểu 3 ký tự");
  });

  // TC-E2E-031: Báo lỗi "Số điện thoại không được rỗng" khi cập nhật Số điện thoại thành rỗng
  test("TC-E2E-031: Bao loi 'So dien thoai khong duoc rong' khi cap nhat So dien thoai thanh rong", async ({ page }) => {
    const btn = page.locator('.btn-edit[data-id="cust-1"]');
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page.locator("#customerModalUpdate")).toBeVisible();

    await page.locator("#customerModalUpdate #phone").fill("");
    await page.locator("#btn-update-customer").click();

    const phoneInput = page.locator("#customerFormUpdate #phone");
    const phoneError = page.locator("#customerFormUpdate #phone-error");
    await expect(phoneInput).toHaveClass(/is-invalid/);
    await expect(phoneError).toHaveText("Số điện thoại không được rỗng");
  });

  // TC-E2E-032: Báo lỗi "Số điện thoại chỉ được chứa số" khi nhập chữ vào Số điện thoại khi cập nhật
  test("TC-E2E-032: Bao loi 'So dien thoai chi duoc chua so' khi nhap chu vao So dien thoai khi cap nhat", async ({ page }) => {
    const btn = page.locator('.btn-edit[data-id="cust-1"]');
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page.locator("#customerModalUpdate")).toBeVisible();

    await page.locator("#customerModalUpdate #phone").fill("090123abcd");
    await page.locator("#btn-update-customer").click();

    const phoneInput = page.locator("#customerFormUpdate #phone");
    const phoneError = page.locator("#customerFormUpdate #phone-error");
    await expect(phoneInput).toHaveClass(/is-invalid/);
    await expect(phoneError).toHaveText("Số điện thoại chỉ được chứa số");
  });

  // TC-E2E-033: Báo lỗi "Số điện thoại phải có độ dài từ 9 đến 11 ký tự" khi nhập sai độ dài SĐT lúc cập nhật
  test("TC-E2E-033: Bao loi 'So dien thoai phai co do dai tu 9 den 11 ky tu' khi nhap sai do dai SDT luc cap nhat", async ({ page }) => {
    const btn = page.locator('.btn-edit[data-id="cust-1"]');
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page.locator("#customerModalUpdate")).toBeVisible();

    await page.locator("#customerModalUpdate #phone").fill("12345");
    await page.locator("#btn-update-customer").click();

    const phoneInput = page.locator("#customerFormUpdate #phone");
    const phoneError = page.locator("#customerFormUpdate #phone-error");
    await expect(phoneInput).toHaveClass(/is-invalid/);
    await expect(phoneError).toHaveText("Số điện thoại phải có độ dài từ 9 đến 11 ký tự");
  });

  // TC-E2E-034: Báo lỗi "Email không được rỗng" khi cập nhật Email thành rỗng
  test("TC-E2E-034: Bao loi 'Email khong duoc rong' khi cap nhat Email thanh rong", async ({ page }) => {
    const btn = page.locator('.btn-edit[data-id="cust-1"]');
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page.locator("#customerModalUpdate")).toBeVisible();

    await page.locator("#customerModalUpdate #email").fill("");
    await page.locator("#btn-update-customer").click();

    const emailInput = page.locator("#customerFormUpdate #email");
    const emailError = page.locator("#customerFormUpdate #email-error");
    await expect(emailInput).toHaveClass(/is-invalid/);
    await expect(emailError).toHaveText("Email không được rỗng");
  });
});

test.describe("CRM Dashboard E2E Tests - Cập nhật thành công & Trạng thái/Xóa (Group 6)", () => {
  // TC-E2E-035: Báo lỗi "Email không đúng định dạng (VD: name@example.com)" khi cập nhật Email sai định dạng
  test("TC-E2E-035: Bao loi 'Email khong dung dinh dang' khi cap nhat Email sai dinh dang", async ({ page }) => {
    const btn = page.locator('.btn-edit[data-id="cust-1"]');
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page.locator("#customerModalUpdate")).toBeVisible();

    await page.locator("#customerModalUpdate #email").fill("invalid_email");
    await page.locator("#btn-update-customer").click();

    const emailInput = page.locator("#customerFormUpdate #email");
    const emailError = page.locator("#customerFormUpdate #email-error");
    await expect(emailInput).toHaveClass(/is-invalid/);
    await expect(emailError).toHaveText("Email không đúng định dạng (VD: name@example.com)");
  });

  // TC-E2E-036: Cập nhật thông tin khách hàng thành công và hiển thị nhãn Yêu thích ❤️ nếu chọn Favorite
  test("TC-E2E-036: Cap nhat thong tin khach hang thanh cong", async ({ page }) => {
    const btn = page.locator('.btn-edit[data-id="cust-1"]');
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page.locator("#customerModalUpdate")).toBeVisible();

    await page.locator("#customerModalUpdate #fullName").fill("Nguyễn Văn A (Đã Sửa)");
    await page.locator("#customerModalUpdate #email").fill("anguyen_edited@example.com");
    await page.locator("#customerModalUpdate #isFavorite").check();
    await page.locator("#btn-update-customer").click();

    await expect(page.locator("#customerModalUpdate")).toBeHidden();

    const updatedRow = page.locator('#customerTableBody tr:has-text("Nguyễn Văn A (Đã Sửa)")');
    await expect(updatedRow).toBeVisible();
    await expect(updatedRow.locator("td").nth(1)).toContainText("❤️");
  });

  // TC-E2E-037: Quy trình đổi trạng thái từ Mới sang Tư vấn
  test("TC-E2E-037: Quy trinh doi trang thai tu Moi sang Tu van", async ({ page }) => {
    const btn = page.locator('.btn-status[data-id="cust-1"][data-status="contacted"]');
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page.locator("#customerModalStatus")).toBeVisible();
    await page.locator("#btn-confirm-status").click();
    await expect(page.locator("#customerModalStatus")).toBeHidden();

    await expect(page.locator("#stat-new")).toHaveText("0");
    await expect(page.locator("#stat-contacted")).toHaveText("2");
  });

  // TC-E2E-038: Hủy bỏ việc cập nhật trạng thái trong Modal Xác nhận và giữ nguyên trạng thái cũ
  test("TC-E2E-038: Huy bo viec cap nhat trang thai trong Modal Xac nhan", async ({ page }) => {
    const btn = page.locator('.btn-status[data-id="cust-1"][data-status="contacted"]');
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page.locator("#customerModalStatus")).toBeVisible();
    await page.locator('#customerModalStatus button.btn-secondary:has-text("Hủy")').click();
    await expect(page.locator("#customerModalStatus")).toBeHidden();

    await expect(page.locator("#stat-new")).toHaveText("1");
    await expect(page.locator("#stat-contacted")).toHaveText("1");
  });

  // TC-E2E-039: Quy trình đổi trạng thái từ Tư vấn sang Đăng ký
  test("TC-E2E-039: Quy trinh doi trang thai tu Tu van sang Dang ky", async ({ page }) => {
    const btn = page.locator('.btn-status[data-id="cust-2"][data-status="registered"]');
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page.locator("#customerModalStatus")).toBeVisible();
    await page.locator("#btn-confirm-status").click();
    await expect(page.locator("#customerModalStatus")).toBeHidden();

    await expect(page.locator("#stat-contacted")).toHaveText("0");
    await expect(page.locator("#stat-registered")).toHaveText("2");
  });

  // TC-E2E-040: Quy trình xóa học viên (Mở Modal -> Xác nhận xóa thành công và biến mất khỏi bảng)
  test("TC-E2E-040: Quy trinh xoa hoc vien", async ({ page }) => {
    const btn = page.locator('.btn-delete[data-id="cust-1"]');
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page.locator("#customerModalDelete")).toBeVisible();
    await page.locator("#btn-confirm-delete").click();
    await expect(page.locator("#customerModalDelete")).toBeHidden();

    await expect(page.locator("#customerTableBody tr")).toHaveCount(2);
    await expect(page.locator('#customerTableBody tr:has-text("Nguyễn Văn A")')).not.toBeVisible();
  });
});
