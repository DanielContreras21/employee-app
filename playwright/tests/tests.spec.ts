import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:8080/employees';
const FRONT_URL = 'http://localhost:4200/employees';

interface Employee {
  id?: number;
  name: string;
  position?: string;
  salary?: number;
}

let createdEmployeeId: number;

test.describe('Employee CRUD API', () => {

  test('CREATE employee via API', async ({ request }) => {
    const newEmployee: Employee = { name: 'Test Employee', position: 'Developer', salary: 50000 };
    const response = await request.post(API_URL, { data: newEmployee });
    expect(response.status()).toBe(200); // tu backend retorna 200 al crear
    const created: Employee = await response.json();
    expect(created.id).toBeDefined();
    expect(created.name).toBe(newEmployee.name);
    createdEmployeeId = created.id!;
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

test.describe('Employee Frontend Form', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(FRONT_URL + '/new');
  });

  test('should display create employee form', async ({ page }) => {
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[formControlName="name"]')).toBeVisible();
    await expect(page.locator('input[formControlName="position"]')).toBeVisible();
    await expect(page.locator('input[formControlName="salary"]')).toBeVisible();
    await expect(page.locator('button:has-text("Crear Empleado")')).toBeVisible();
    await expect(page.locator('button:has-text("Cancelar")')).toBeVisible();
  });

  test('should show validation for required name', async ({ page }) => {
    await page.locator('input[formControlName="name"]').focus();
    await page.locator('input[formControlName="name"]').blur();
    await expect(page.locator('text=name es requerido')).toBeVisible();
  });

  test('should allow filling and submitting form', async ({ page }) => {
  await page.fill('input[formControlName="name"]', 'Frontend Employee');
  await page.fill('input[formControlName="position"]', 'Tester');
  await page.fill('input[formControlName="salary"]', '45000');
  await page.click('button:has-text("Crear Empleado")');

  // Esperar que no haya errores visibles
  await expect(page.locator('text=name es requerido')).toHaveCount(0);
  await expect(page.locator('text=salary debe ser mayor o igual a 0')).toHaveCount(0);
});

});
