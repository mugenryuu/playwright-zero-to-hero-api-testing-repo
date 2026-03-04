import { test } from '@playwright/test';
import tags from '../test-data/tags.json'
import article from '../test-data/article.json'
import { PageManager } from '../page-objects/PageManager';
import { NewArticleTestData } from '../types/article.types';

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
  const pm = new PageManager(page);
  const data = article as NewArticleTestData

  const newArticle = data.newArticle
  await pm.onHomePage.createArticleAndDelete(request, newArticle)
});
