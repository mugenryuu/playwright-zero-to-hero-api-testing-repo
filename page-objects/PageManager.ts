import { Page } from "@playwright/test";
import { NavigationPage } from "./NavigationPage";
import { HomePage } from "./HomePage";

export class PageManager {
    readonly page;
    readonly navigationPage;
    readonly homePage;
    
    constructor(page: Page) {
        this.page = page
        this.navigationPage = new NavigationPage(this.page)
        this.homePage = new HomePage(this.page)
    }

    get NavigateTo() {
        return this.navigationPage;
    }

    get onHomePage() {
        return this.homePage;
    }
}