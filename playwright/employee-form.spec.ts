import { test, expect } from '@playwright/test';

test.describe('Employee Form', () => {

  test.beforeEach(async ({ page }) => {
    // Simula API de empleados (equivalente a cy.mockEmployeesAPI)
    await page.route('**/api/employees', route => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          body: JSON.stringify([{ id: 1, name: 'Juan Pérez', position: 'Developer', salary: 50000 }]),
        });
      }
      return route.continue();
    });
  });

  // -------------------------------
  // CREATE EMPLOYEE
  // -------------------------------
  test.describe('Create Employee', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/employees/new');
    });

    test('should display create employee form', async ({ page }) => {
      await expect(page.getByText('Nuevo Empleado')).toBeVisible();
      await expect(page.locator('form')).toBeVisible();
      await expect(page.locator('input[formControlName="name"]')).toBeVisible();
      await expect(page.locator('input[formControlName="position"]')).toBeVisible();
      await expect(page.locator('input[formControlName="salary"]')).toBeVisible();
      await expect(page.getByText('Crear Empleado')).toBeVisible();
      await expect(page.getByText('Cancelar')).toBeVisible();
    });

    test('should create employee with valid data', async ({ page }) => {
      await page.route('**/api/employees', async route => {
        if (route.request().method() === 'POST') {
          await route.fulfill({ status: 201, body: '{}' });
        } else {
          await route.continue();
        }
      });

      await page.fill('input[formControlName="name"]', 'Nuevo Empleado');
      await page.fill('input[formControlName="position"]', 'Tester');
      await page.fill('input[formControlName="salary"]', '40000');
      await page.getByText('Crear Empleado').click();

      await expect(page).toHaveURL(/\/employees$/);
    });

    test('should show validation errors for required fields', async ({ page }) => {
      await page.getByText('Crear Empleado').click();
      await expect(page).toHaveURL(/\/employees\/new/);

      const nameInput = page.locator('input[formControlName="name"]');
      await nameInput.focus();
      await nameInput.blur();
      await expect(page.getByText('name es requerido')).toBeVisible();
    });

    test('should show validation error for short name', async ({ page }) => {
      await page.fill('input[formControlName="name"]', 'A');
      await page.locator('input[formControlName="name"]').blur();
      await expect(page.getByText('name debe tener al menos 2 caracteres')).toBeVisible();
    });

    test('should show validation error for negative salary', async ({ page }) => {
      await page.fill('input[formControlName="salary"]', '-1000');
      await page.locator('input[formControlName="salary"]').blur();
      await expect(page.getByText('salary debe ser mayor o igual a 0')).toBeVisible();
    });

    test('should disable submit button when form is invalid', async ({ page }) => {
      await page.fill('input[formControlName="name"]', 'A');
      await expect(page.getByText('Crear Empleado')).toBeDisabled();
    });

    test('should enable submit button when form is valid', async ({ page }) => {
      await page.fill('input[formControlName="name"]', 'Valid Name');
      await page.fill('input[formControlName="position"]', 'Developer');
      await page.fill('input[formControlName="salary"]', '50000');
      await expect(page.getByText('Crear Empleado')).toBeEnabled();
    });

    test('should cancel and navigate back to employees list', async ({ page }) => {
      await page.getByText('Cancelar').click();
      await expect(page).toHaveURL(/\/employees$/);
    });

    test('should handle API error when creating employee', async ({ page }) => {
      await page.route('**/api/employees', route =>
        route.fulfill({ status: 400, body: 'Bad Request' })
      );

      await page.fill('input[formControlName="name"]', 'Test Employee');
      await page.getByText('Crear Empleado').click();

      await expect(page.getByText('Error al crear el empleado')).toBeVisible();
      await expect(page).toHaveURL(/\/employees\/new/);
    });
  });

  // -------------------------------
  // EDIT EMPLOYEE
  // -------------------------------
  test.describe('Edit Employee', () => {
    test.beforeEach(async ({ page }) => {
      await page.route('**/api/employees/1', route =>
        route.fulfill({
          status: 200,
          body: JSON.stringify({ id: 1, name: 'Juan Pérez', position: 'Developer', salary: 50000 }),
        })
      );
      await page.goto('/employees/edit/1');
    });

    test('should display edit employee form', async ({ page }) => {
      await expect(page.getByText('Editar Empleado')).toBeVisible();
      await expect(page.locator('form')).toBeVisible();
      await expect(page.getByText('Actualizar Empleado')).toBeVisible();
      await expect(page.getByText('Cancelar')).toBeVisible();
    });

    test('should load existing employee data', async ({ page }) => {
      await expect(page.locator('input[formControlName="name"]')).toHaveValue('Juan Pérez');
      await expect(page.locator('input[formControlName="position"]')).toHaveValue('Developer');
      await expect(page.locator('input[formControlName="salary"]')).toHaveValue('50000');
    });

    test('should update employee with modified data', async ({ page }) => {
      await page.route('**/api/employees/1', route => {
        if (route.request().method() === 'PUT') {
          return route.fulfill({ status: 200, body: '{}' });
        }
        return route.continue();
      });

      await page.fill('input[formControlName="name"]', 'Juan Pérez Updated');
      await page.fill('input[formControlName="position"]', 'Senior Developer');
      await page.fill('input[formControlName="salary"]', '55000');
      await page.getByText('Actualizar Empleado').click();

      await expect(page).toHaveURL(/\/employees$/);
    });

    test('should handle error when updating employee', async ({ page }) => {
      await page.route('**/api/employees/1', route => {
        if (route.request().method() === 'PUT') {
          return route.fulfill({ status: 400, body: 'Bad Request' });
        }
        return route.continue();
      });

      await page.fill('input[formControlName="name"]', 'Updated Name');
      await page.getByText('Actualizar Empleado').click();

      await expect(page.getByText('Error al actualizar el empleado')).toBeVisible();
      await expect(page).toHaveURL(/\/employees\/edit\/1/);
    });
  });

  // -------------------------------
  // FORM VALIDATION
  // -------------------------------
  test.describe('Form Validation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/employees/new');
    });

    test('should validate required name field', async ({ page }) => {
      const name = page.locator('input[formControlName="name"]');
      await name.focus();
      await name.blur();
      await expect(page.getByText('name es requerido')).toBeVisible();
    });

    test('should validate minimum name length', async ({ page }) => {
      await page.fill('input[formControlName="name"]', 'A');
      await page.locator('input[formControlName="name"]').blur();
      await expect(page.getByText('name debe tener al menos 2 caracteres')).toBeVisible();
    });

    test('should validate minimum salary value', async ({ page }) => {
      await page.fill('input[formControlName="salary"]', '-100');
      await page.locator('input[formControlName="salary"]').blur();
      await expect(page.getByText('salary debe ser mayor o igual a 0')).toBeVisible();
    });

    test('should accept valid form data', async ({ page }) => {
      await page.fill('input[formControlName="name"]', 'Valid Employee Name');
      await page.fill('input[formControlName="position"]', 'Valid Position');
      await page.fill('input[formControlName="salary"]', '50000');
      await expect(page.locator('.field-error')).toHaveCount(0);
      await expect(page.getByText('Crear Empleado')).toBeEnabled();
    });

    test('should allow empty position field', async ({ page }) => {
      await page.fill('input[formControlName="name"]', 'Employee Name');
      await page.fill('input[formControlName="salary"]', '50000');
      await expect(page.getByText('Crear Empleado')).toBeEnabled();
    });

    test('should allow empty salary field', async ({ page }) => {
      await page.fill('input[formControlName="name"]', 'Employee Name');
      await page.fill('input[formControlName="position"]', 'Position');
      await expect(page.getByText('Crear Empleado')).toBeEnabled();
    });
  });
});
