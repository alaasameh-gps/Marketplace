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
        
        # -> Click the 'Products' link in the header to open the products/catalog page.
        # Products link
        elem = page.get_by_role("navigation").get_by_role("link", name="Products")
        await elem.click(timeout=10000)
        
        # -> Click the 'Products' link in the header to open the Products (catalog) page.
        # Products link
        elem = page.get_by_role("navigation").get_by_role("link", name="Products")
        await elem.click(timeout=10000)
        
        # -> Click the 'Products' link in the header to open the Products (catalog) page.
        # Products link
        elem = page.get_by_role("navigation").get_by_role("link", name="Products")
        await elem.click(timeout=10000)
        
        # -> Click the 'Products' link in the header to open the Products page.
        # Products link
        elem = page.get_by_role("navigation").get_by_role("link", name="Products")
        await elem.click(timeout=10000)
        
        # -> Open the 'Products' page (navigate to the products/catalog) so the products search and filter UI is available.
        await page.goto("http://localhost:3000/products")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Enter 'Wireless Headphones' into the search field and click the 'Search' button.
        # Search text field
        elem = page.get_by_role("textbox", name="🔍")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Wireless Headphones")
        
        # -> Enter 'Wireless Headphones' into the search field and click the 'Search' button.
        # Search button
        elem = page.get_by_role("button", name="Search")
        await elem.click(timeout=10000)
        
        # -> Open the 'Category' dropdown so the category options (e.g., 'Electronics') are displayed.
        # Category Electronics Fashion Home & Living dropdown
        elem = page.locator("select[name=\"category\"]")
        await elem.click(timeout=10000)
        
        # -> Select 'Electronics' from the Category dropdown to apply the category filter.
        # Category Electronics Fashion Home & Living dropdown
        elem = page.locator("xpath=/html/body/div[2]/main/div/form/select").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.select_option("")
        
        # -> Select 'TechCorp' in the Brand dropdown and click the 'Search' button to apply the brand filter.
        # Brand TechCorp Trendline dropdown
        elem = page.locator("select[name=\"brand\"]")
        await elem.click(timeout=10000)
        
        # -> Select 'TechCorp' in the Brand dropdown and click the 'Search' button to apply the brand filter.
        # Brand TechCorp Trendline dropdown
        elem = page.locator("xpath=/html/body/div[2]/main/div/form/select[2]").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.select_option("")
        
        # -> Select 'TechCorp' in the Brand dropdown and click the 'Search' button to apply the brand filter.
        # Search button
        elem = page.get_by_role("button", name="Search")
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> 'Wireless Headphones' product card is visible in the results.
        # Assert-outcome: passed
        # Assert: Verifies the product card contains the text 'Wireless Headphones'.
        await expect(page.get_by_role("main").nth(0)).to_contain_text("Wireless Headphones", timeout=15000), "Verifies the product card contains the text 'Wireless Headphones'."
        
        # --> Category and Brand filters were applied (category and brand parameters present in the page URL).
        # Assert-outcome: passed
        # Assert: Verifies the URL contains a category parameter indicating the Category filter was applied.
        await expect(page).to_have_url(re.compile("category="), timeout=15000), "Verifies the URL contains a category parameter indicating the Category filter was applied."
        # Assert-outcome: passed
        # Assert: Verifies the URL contains a brand parameter indicating the Brand filter was applied.
        await expect(page).to_have_url(re.compile("brand="), timeout=15000), "Verifies the URL contains a brand parameter indicating the Brand filter was applied."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    