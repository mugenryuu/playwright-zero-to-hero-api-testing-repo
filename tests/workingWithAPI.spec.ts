import { test, expect } from '@playwright/test';
import tags from '../test-data/tags.json'
import article from '../test-data/article.json'
import authFile from '../.auth/user.json'

test.beforeEach(async ({ page }) => {

  await page.route('*/**/api/tags', async route => {
    await route.fulfill({
      body: JSON.stringify(tags)
    })
  })
  page.goto('/')
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

test('Create article using API', async ({ request }) => {
  const token = authFile.origins[0].localStorage[0].value;

  await request.post('*/**/api/articles/', {
    data: {
      "title": "this is a title",
      "description": "sample desc",
      "body": "this is the body",
      "tagList": ['automation']
    },
    headers: {
      Authorization: `Token ${token}`
    }
  })
})

test('Verify if new article is created and deleted', async ({ page, request }) => {
  const loginResponse = await page.waitForResponse('*/**/api/users/login')
  const loginResponseBody = await loginResponse.json();
  const token = loginResponseBody.user.token

  await page.getByRole('link', { name: 'New Article' }).click();
  await page.getByPlaceholder('Article Title').fill(article.newArticle.title);
  await page.getByPlaceholder(`What's this article about?`).fill(article.newArticle.about);
  await page.getByPlaceholder(`Write your article (in markdown)`).fill(article.newArticle.content);
  await page.getByPlaceholder(`Enter tags`).fill(article.newArticle.tags)
  await page.getByRole('button', { name: 'Publish Article' }).click();

  const articleResponse = await page.waitForResponse('*/**/api/articles/');
  const articleResponseBody = await articleResponse.json();
  const slugId = articleResponseBody.article.slug

  const deleteArticleResponse = await request.delete(`*/**/api/articles/${slugId}`, {
    headers: {
      Authorization: `Token ${token}`
    }
  })

  expect(deleteArticleResponse.status()).toEqual(204)
});
