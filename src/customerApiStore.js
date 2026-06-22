const API_BASE_URL = "http://localhost:3001";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status}`);
  }

  return response.json();
}

export function fetchCustomers() {
  return request("/customers", {
    method: "GET",
  });
}

export function createCustomer(customer) {
  return request("/customers", {
    method: "POST",
    body: JSON.stringify(customer),
  });
}

export function updateCustomer(id, customer) {
  return request(`/customers/${id}`, {
    method: "PUT",
    body: JSON.stringify(customer),
  });
}

// ĐÃ SỬA: Xóa bỏ body: JSON.stringify(customer) vì phương thức GET không cần body
export function getCustomer(id) {
  return request(`/customers/${id}`, {
    method: "GET",
  });
}

// BỔ SUNG: Hàm xóa khách hàng phục vụ cho nút "Xóa" trên UI
export function deleteCustomer(id) {
  return request(`/customers/${id}`, {
    method: "DELETE",
  });
}