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
