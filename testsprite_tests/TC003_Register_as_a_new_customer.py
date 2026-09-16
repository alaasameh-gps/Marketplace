import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        # Wider default timeout to match the agent's DOM-stability budget;
        # auto-waiting Playwright APIs (expect, locator.wait_for) inherit this.
        context.set_default_timeout(15000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> navigate
        await page.goto("http://localhost:3000/")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Open the 'Create account' page (Register) and load the registration form.
        await page.goto("http://localhost:3000/register")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Fill the registration form (Full name, a fresh Email, Password) and click the 'Create account' button to submit the form.
        # text field
        elem = page.locator("div").filter(has_text=re.compile(r"^Full name$")).get_by_role("textbox")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Test User")
        
        # -> Fill the registration form (Full name, a fresh Email, Password) and click the 'Create account' button to submit the form.
        # email field
        elem = page.locator("input[type=\"email\"]")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("testsprite+20260913T120000@example.com")
        
        # -> Fill the registration form (Full name, a fresh Email, Password) and click the 'Create account' button to submit the form.
        # password field
        elem = page.locator("input[type=\"password\"]")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("TestSpriteNew1!")
        
        # -> Fill the registration form (Full name, a fresh Email, Password) and click the 'Create account' button to submit the form.
        # Create account button
        elem = page.get_by_role("button", name="Create account")
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> User is signed in (Sign out control is visible in the header).
        await page.get_by_role("button", name="Sign out").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: passed
        # Assert: Sign out button is visible in the header.
        await expect(page.get_by_role("button", name="Sign out").nth(0)).to_be_visible(timeout=15000), "Sign out button is visible in the header."
        
        # --> Authenticated account area (Profile page) is displayed.
        # Assert-outcome: passed
        # Assert: Profile heading is visible on the account page.
        await expect(page.locator("xpath=/html/body/div[2]/main/div/div/div/div[2]/div/h3").nth(0)).to_have_text("Profile", timeout=15000), "Profile heading is visible on the account page."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    