import {Page} from '@playwright/test'

export class NavigationPage {
    readonly page;

    constructor(page: Page) {
        this.page = page
    }

    async newArticlePage() {
        await this.page.getByRole('link', { name: 'New Article' }).click();
    }
}