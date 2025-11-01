import { test, expect } from '@playwright/test';

const API_URL = 'https://nongenerical-dereistically-rachael.ngrok-free.dev/employees';

interface Employee {
  id?: number;
  name: string;
  position?: string;
  salary?: number;
}

let createdEmployeeId: number;

test.describe('Employee CRUD API', () => {

  test('CREATE employee 1 via API', async ({ request }) => {
    const newEmployee: Employee = { name: 'Test Employee', position: 'Developer', salary: 50000 };
    const response = await request.post(API_URL, { data: newEmployee });
    expect(response.status()).toBe(200);
    const created: Employee = await response.json();
    expect(created.id).toBeDefined();
    expect(created.name).toBe(newEmployee.name);
    createdEmployeeId = created.id!;
  });

  test('CREATE employee 2 via API', async ({ request }) => {
    const newEmployee: Employee = { name: 'Ana Gómez', position: 'Project Manager', salary: 72000 };
    const response = await request.post(API_URL, { data: newEmployee });
    expect(response.status()).toBe(200);
    const created: Employee = await response.json();
    expect(created.id).toBeDefined();
    expect(created.name).toBe(newEmployee.name);
  });

  test('CREATE employee 3 via API', async ({ request }) => {
    const newEmployee: Employee = { name: 'Carlos Ruiz', position: 'QA Engineer', salary: 45000 };
    const response = await request.post(API_URL, { data: newEmployee });
    expect(response.status()).toBe(200);
    const created: Employee = await response.json();
    expect(created.id).toBeDefined();
    expect(created.name).toBe(newEmployee.name);
  });

  test('CREATE employee 4 via API', async ({ request }) => {
    const newEmployee: Employee = { name: 'Laura Torres', position: 'UX Designer', salary: 60000 };
    const response = await request.post(API_URL, { data: newEmployee });
    expect(response.status()).toBe(200);
    const created: Employee = await response.json();
    expect(created.id).toBeDefined();
    expect(created.name).toBe(newEmployee.name);
  });

  test('CREATE employee 5 via API', async ({ request }) => {
    const newEmployee: Employee = { name: 'Miguel Ángel', position: 'DevOps Engineer', salary: 80000 };
    const response = await request.post(API_URL, { data: newEmployee });
    expect(response.status()).toBe(200);
    const created: Employee = await response.json();
    expect(created.id).toBeDefined();
    expect(created.name).toBe(newEmployee.name);
  });


  test('GET employee by ID via API', async ({ request }) => {
    const response = await request.get(`${API_URL}/${createdEmployeeId}`);
    expect(response.ok()).toBeTruthy();
    const employee: Employee = await response.json();
    expect(employee.id).toBe(createdEmployeeId);
    expect(employee.name).toBe('Test Employee');
  });

  test('UPDATE employee via API', async ({ request }) => {
    const updatedData: Employee = { name: 'Updated Employee', position: 'Senior Developer', salary: 60000 };
    const response = await request.put(`${API_URL}/${createdEmployeeId}`, { data: updatedData });
    expect(response.ok()).toBeTruthy();

    const getResponse = await request.get(`${API_URL}/${createdEmployeeId}`);
    const employee: Employee = await getResponse.json();
    expect(employee.name).toBe(updatedData.name);
  });

  test('DELETE employee via API', async ({ request }) => {
    const response = await request.delete(`${API_URL}/${createdEmployeeId}`);
    expect(response.ok()).toBeTruthy();

    const getResponse = await request.get(`${API_URL}/${createdEmployeeId}`);
    expect(getResponse.status()).toBe(404);
  });
});

