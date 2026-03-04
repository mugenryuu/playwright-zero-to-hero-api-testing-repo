import { Page, expect, APIRequestContext } from "@playwright/test";
import authFile from '../.auth/user.json'
import { NewArticle } from "../types/article.types";

export class HomePage {
    readonly page;

    constructor(page: Page) {
        this.page = page;
    }

    async interceptAPIandChangeArticleInfo(articleIndex: number, title: string, description: string) {
        await this.page.route('*/**/api/articles*', async route => {
            const response = await route.fetch();
            const responseBody = await response.json();
            responseBody.articles[articleIndex].title = title;
            responseBody.articles[articleIndex].description = description;

            await route.fulfill({
                body: JSON.stringify(responseBody)
            })
        })
    }

    async checkIfArticleHasChanged(articleIndex: number, title: string, description: string) {
        await expect(this.page.getByRole('link', { name: 'conduit' }).nth(articleIndex)).toBeVisible();
        await expect(this.page.locator('.preview-link h1').nth(articleIndex)).toHaveText(title);
        await expect(this.page.locator('.preview-link p').nth(articleIndex)).toHaveText(description);
    }

    async createArticleUsingUI(article: NewArticle) {
        await this.page.getByRole('link', { name: 'New Article' }).click();
        await this.page.getByPlaceholder('Article Title').fill(article.title);
        await this.page.getByPlaceholder(`What's this article about?`).fill(article.about);
        await this.page.getByPlaceholder(`Write your article (in markdown)`).fill(article.content);
        await this.page.getByPlaceholder(`Enter tags`).fill(article.tags)
        await this.page.getByRole('button', { name: 'Publish Article' }).click();
    }

    async createArticleUsingAPI(request: APIRequestContext) {
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
    }

    async deleteArticleUsingAPI(request: APIRequestContext) {
        const token = authFile.origins[0].localStorage[0].value;
        const articleResponse = await this.page.waitForResponse('*/**/api/articles/');
        const articleResponseBody = await articleResponse.json();
        const slugId = articleResponseBody.article.slug

        const deleteArticleResponse = await request.delete(`*/**/api/articles/${slugId}`, {
            headers: {
                Authorization: `Token ${token}`
            }
        })

        expect(deleteArticleResponse.status()).toEqual(204)
    }

    async createArticleAndDelete(request: APIRequestContext, article: NewArticle) {

        const articleExists = this.page.getByText(article.title)

        if (articleExists) {
            console.log('Article already exists, deleting it first')
            this.deleteArticleUsingAPI(request);
        }

        else {
            console.log('Article does not exist, proceeding with test')
            this.createArticleUsingUI(article);
        }

        this.deleteArticleUsingAPI(request)
    }
}