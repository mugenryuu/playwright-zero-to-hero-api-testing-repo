import { test, expect, request } from '@playwright/test';
import tags from '../test-data/tags.json'
import users from '../test-data/users.json'
import article from '../test-data/article.json'

test.beforeEach(async ({ page }) => {
  const notSignedIn = page.getByRole('link', { name: 'Sign In' })
  await page.route('*/**/api/tags', async route => {
    await route.fulfill({
      body: JSON.stringify(tags)
    })
  })

  await page.goto('/');
  if (notSignedIn) {
    await page.getByRole('link', { name: 'Sign In' }).click();
    await page.getByPlaceholder('Email').fill(users.user1.email);
    await page.getByPlaceholder('Password').fill(users.user1.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
  }
})


test('Verify if API intercept worked', async ({ page }) => {
  await page.route('*/**/api/articles*', async route => {
    const response = await route.fetch();
    const responseBody = await response.json();
    responseBody.articles[0].title = 'This is a MOCK new title';
    responseBody.articles[0].description = 'This is a MOCK new description';

    await route.fulfill({
      body: JSON.stringify(responseBody)
    })
  })

  await expect(page.getByRole('link', { name: 'conduit' }).first()).toBeVisible();
  await expect(page.locator('.preview-link h1').first()).toHaveText('This is a MOCK new title');
  await expect(page.locator('.preview-link p').first()).toHaveText('This is a MOCK new description');
});

test('Verify if new article is created and deleted', async ({ page, request }) => {

  const response = await page.waitForResponse('*/**/api/users/login')
  const responseBody = await response.json();
  const token = responseBody.user.token

  await page.getByRole('link', {name: 'New Article'}).click();
  await 
});
