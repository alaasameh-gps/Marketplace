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
        
        # -> Click the language dropdown labelled 'EN' and open the language options so 'عربي' can be selected.
        # EN عربي dropdown
        elem = page.get_by_label("Language")
        await elem.click(timeout=10000)
        
        # -> Select 'عربي' from the language dropdown to switch the interface to Arabic.
        # EN عربي dropdown
        elem = page.locator("xpath=/html/body/div[2]/header/div/div/select").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.select_option("")
        
        # -> Open the language dropdown and select 'عربي' (Arabic) from the options to switch the interface language.
        # EN عربي dropdown
        elem = page.get_by_label("Language")
        await elem.click(timeout=10000)
        
        # -> Click the 'المنتجات' (Products) link to open the Products page after verifying the page-level lang/dir attributes.
        # المنتجات link
        elem = page.get_by_role("navigation").get_by_role("link", name="المنتجات")
        await elem.click(timeout=10000)
        
        # -> Click the 'التصنيفات' (Categories) link to open the Categories page and then verify the RTL attributes and localized Arabic content there.
        # التصنيفات link
        elem = page.get_by_role("banner").get_by_role("link", name="التصنيفات")
        await elem.click(timeout=10000)
        
        # -> Click the 'المنتجات' (Products) link to open the Products page so RTL attributes and Arabic localized product labels can be verified.
        # المنتجات link
        elem = page.get_by_role("navigation").get_by_role("link", name="المنتجات")
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Products page shows Arabic navigation text and Arabic 'Add to cart' controls.
        # Assert-outcome: passed
        # Assert: Verify the Products nav link is displayed in Arabic.
        await expect(page.locator("xpath=/html/body/div[2]/header/div/nav/a[1]").nth(0)).to_have_text("\u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a", timeout=15000), "Verify the Products nav link is displayed in Arabic."
        # Assert-outcome: passed
        # Assert: Verify a product's add-to-cart button has an Arabic aria-label.
        await expect(page.get_by_role("link", name="???? 22 ???? 22 Demo Store").get_by_label("أضف إلى السلة").nth(0)).to_have_attribute("aria-label", "\u0623\u0636\u0641 \u0625\u0644\u0649 \u0627\u0644\u0633\u0644\u0629", timeout=15000), "Verify a product's add-to-cart button has an Arabic aria-label."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    