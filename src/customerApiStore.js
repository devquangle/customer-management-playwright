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

export function patchCustomerStatus(id, status) {
  return request(`/customers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
}

export function getCustomer(id) {
  return request(`/customers/${id}`, {
    method: "GET",
  });
}


export function deleteCustomer(id) {
  return request(`/customers/${id}`, {
    method: "DELETE",
  });
}