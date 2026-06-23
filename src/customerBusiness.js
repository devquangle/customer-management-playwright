export function validateCustomerForm(formData) {
  const errors = {};

  const fullName = String(formData.fullName ?? "").trim();
  const phone = String(formData.phone ?? "").trim();
  const email = String(formData.email ?? "").trim();
  const course = String(formData.course ?? "").trim();

  // 1. Validate Họ tên
  if (!fullName) {
    errors.fullName = "Họ tên không được rỗng";
  } else if (fullName.length < 3) {
    errors.fullName = "Họ tên phải có tối thiểu 3 ký tự";
  }

  // 2. Validate Số điện thoại
  if (!phone) {
    errors.phone = "Số điện thoại không được rỗng";
  } else if (!/^\d+$/.test(phone)) {
    errors.phone = "Số điện thoại chỉ được chứa số";
  } else if (phone.length < 9 || phone.length > 11) {
    errors.phone = "Số điện thoại phải có độ dài từ 9 đến 11 ký tự";
  }

  // 3. Validate Email (ĐÃ SỬA LỖI Ở ĐÂY)
  if (!email) {
    errors.email = "Email không được rỗng"; // Trước đó bạn viết nhầm là errors.phone
  } else if (!email.includes("@")) {
    errors.email = "Email phải có ký tự @";
  }

  // 4. Validate Khóa học
  if (!course) {
    errors.course = "Khóa học quan tâm không được rỗng";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

function getBasePayload(formData) {
  return {
    fullName: String(formData.fullName ?? "").trim(),
    phone: String(formData.phone ?? "").trim(),
    email: String(formData.email ?? "").trim(),
    course: String(formData.course ?? "").trim(),
    note: String(formData.note ?? "").trim(),
  };
}

export function createCustomerPayload(formData) {
  return {
    ...getBasePayload(formData),
    status: "new",
    isFavorite: false,
  };
}

export function updateCustomerPayload(formData) {
  return {
    ...getBasePayload(formData),
    status: String(formData.status ?? "new").trim(),
    isFavorite: Boolean(formData.isFavorite), // Ép kiểu Boolean cho an toàn
  };
}

export function filterCustomers(customers, filterType = "all") {
  if (filterType === "all") {
    return customers;
  }

  if (filterType === "favorite") {
    return customers.filter((customer) => customer.isFavorite === true);
  }

  return customers.filter((customer) => customer.status === filterType);
}

export function searchCustomers(customers, keyword = "") {
  const q = String(keyword).trim().toLowerCase();

  if (!q) {
    return customers;
  }

  return customers.filter((customer) => {
    return [customer.fullName, customer.phone, customer.email, customer.course]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });
}
