export const API_BASE_URL = 'http://localhost:8000';

export async function fetchDeals() {
    const response = await fetch(`${API_BASE_URL}/deals`);
    if (!response.ok) throw new Error('Failed to fetch deals');
    return response.json();
}

export async function createDeal(deal: any) {
    const response = await fetch(`${API_BASE_URL}/deals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deal)
    });
    if (!response.ok) throw new Error('Failed to create deal');
    return response.json();
}

export async function updateDeal(dealId: string, deal: any) {
    const response = await fetch(`${API_BASE_URL}/deals/${dealId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deal)
    });
    if (!response.ok) throw new Error('Failed to update deal');
    return response.json();
}

export async function deleteDeal(dealId: string) {
    const response = await fetch(`${API_BASE_URL}/deals/${dealId}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete deal');
    return response.json();
}

export async function fetchCircuits() {
    const response = await fetch(`${API_BASE_URL}/circuits`);
    if (!response.ok) throw new Error('Failed to fetch circuits');
    return response.json();
}

export async function createCircuit(circuit: any) {
    const response = await fetch(`${API_BASE_URL}/circuits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(circuit)
    });
    if (!response.ok) throw new Error('Failed to create circuit');
    return response.json();
}

export async function updateCircuit(circuitId: string, circuit: any) {
    const response = await fetch(`${API_BASE_URL}/circuits/${circuitId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(circuit)
    });
    if (!response.ok) throw new Error('Failed to update circuit');
    return response.json();
}

export async function deleteCircuit(circuitId: string) {
    const response = await fetch(`${API_BASE_URL}/circuits/${circuitId}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete circuit');
    return response.json();
}

export async function fetchMicPom() {
    const response = await fetch(`${API_BASE_URL}/mic-pom`);
    if (!response.ok) throw new Error('Failed to fetch MIC POM records');
    return response.json();
}

export async function createMicPom(record: any) {
    const response = await fetch(`${API_BASE_URL}/mic-pom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
    });
    if (!response.ok) throw new Error('Failed to create MIC POM record');
    return response.json();
}

export async function saveMatrixResults(data: any) {
    const response = await fetch(`${API_BASE_URL}/matrix/scan-results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to save scan results');
    return response.json();
}

export async function bulkCreateCircuits(circuits: any[]) {
    const response = await fetch(`${API_BASE_URL}/circuits/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(circuits)
    });
    if (!response.ok) throw new Error('Failed to bulk save circuits');
    return response.json();
}

export async function fetchHealth() {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) throw new Error('Failed to fetch health status');
    return response.json();
}

export async function fetchUsers() {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
}

export async function createUser(user: any) {
    const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    });
    if (!response.ok) throw new Error('Failed to create user');
    return response.json();
}

export async function deleteUser(userId: number) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete user');
    return response.json();
}

export async function fetchDashboardStats() {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
    if (!response.ok) throw new Error('Failed to fetch dashboard stats');
    return response.json();
}

export async function createChangeRequest(formData: FormData) {
    const response = await fetch(`${API_BASE_URL}/change-requests`, {
        method: 'POST',
        body: formData
    });
    if (!response.ok) throw new Error('Failed to submit change request');
    return response.json();
}

export async function fetchChangeRequests() {
    const response = await fetch(`${API_BASE_URL}/change-requests`);
    if (!response.ok) throw new Error('Failed to fetch change requests');
    return response.json();
}

export async function updateChangeRequest(requestId: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/change-requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update change request');
    return response.json();
}

export async function fetchActiveOnboardCircuits() {
    const response = await fetch(`${API_BASE_URL}/active-onboard-circuits`);
    if (!response.ok) throw new Error('Failed to fetch active onboard circuits');
    return response.json();
}

export async function createActiveOnboardCircuit(circuit: any) {
    const response = await fetch(`${API_BASE_URL}/active-onboard-circuits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(circuit)
    });
    if (!response.ok) throw new Error('Failed to create active onboard circuit');
    return response.json();
}

export async function updateActiveOnboardCircuit(circuitId: string, circuit: any) {
    const response = await fetch(`${API_BASE_URL}/active-onboard-circuits/${circuitId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(circuit)
    });
    if (!response.ok) throw new Error('Failed to update active onboard circuit');
    return response.json();
}

export async function deleteActiveOnboardCircuit(circuitId: string) {
    const response = await fetch(`${API_BASE_URL}/active-onboard-circuits/${circuitId}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete active onboard circuit');
    return response.json();
}

export async function bulkCreateActiveOnboardCircuits(circuits: any[]) {
    const response = await fetch(`${API_BASE_URL}/active-onboard-circuits/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(circuits)
    });
    if (!response.ok) throw new Error('Failed to bulk create active onboard circuits');
    return response.json();
}
