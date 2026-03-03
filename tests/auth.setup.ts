import { test as setup } from '@playwright/test'
import users from '../test-data/users.json'

const authFile = '.auth/user.json'

setup('authentication', async ({ page }) => {
    const notSignedIn = page.getByRole('link', { name: 'Sign In' })
    
    if (notSignedIn) {
        await page.getByRole('link', { name: 'Sign In' }).click();
        await page.getByPlaceholder('Email').fill(users.user1.email);
        await page.getByPlaceholder('Password').fill(users.user1.password);
        await page.getByRole('button', { name: 'Sign In' }).click();

        await page.waitForResponse('*/**/api/tags')
        await page.context().storageState({path: authFile})
    }
})