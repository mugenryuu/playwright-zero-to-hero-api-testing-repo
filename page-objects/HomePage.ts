import { Page, expect, APIRequestContext } from "@playwright/test";
import authFile from '../.auth/user.json'

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
}