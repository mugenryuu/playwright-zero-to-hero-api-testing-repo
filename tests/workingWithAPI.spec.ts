import { test, expect } from '@playwright/test';
import tags from '../test-data/tags.json'
import article from '../test-data/article.json'
import authFile from '../.auth/user.json'
import { PageManager } from '../page-objects/PageManager';

test.beforeEach(async ({ page }) => {
  await page.route('*/**/api/tags', async route => {
    await route.fulfill({
      body: JSON.stringify(tags)
    })
  })
  page.goto('/')
})


test('Verify if API intercept worked', async ({ page }) => {
  const pm = new PageManager(page);

  await pm.onHomePage.interceptAPIandChangeArticleInfo(0, 'This is a MOCK new title', 'This is a MOCK new description')
  await pm.onHomePage.checkIfArticleHasChanged(0, 'This is a MOCK new title', 'This is a MOCK new description')
});

test('Create article using API', async ({ page, request }) => {
  const pm = new PageManager(page);

  await pm.onHomePage.createArticleUsingAPI(request);
})

test('Verify if new article is created and deleted', async ({ page, request }) => {
  const token = authFile.origins[0].localStorage[0].value;
  const articleExists = page.getByText(article.newArticle.title)

  if (articleExists) {
    console.log('Article already exists, deleting it first')
    const deleteResponse = await request.delete(`*/**/api/articles/${article.newArticle}`, {
      headers: {
        Authorization: `Token ${token}`
      }
    })
    expect(deleteResponse.status()).toEqual(204)
  }

  else {
    console.log('Article does not exist, proceeding with test')
    await page.getByRole('link', { name: 'New Article' }).click();
    await page.getByPlaceholder('Article Title').fill(article.newArticle.title);
    await page.getByPlaceholder(`What's this article about?`).fill(article.newArticle.about);
    await page.getByPlaceholder(`Write your article (in markdown)`).fill(article.newArticle.content);
    await page.getByPlaceholder(`Enter tags`).fill(article.newArticle.tags)
    await page.getByRole('button', { name: 'Publish Article' }).click();
  }

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
