import asyncio
from playwright.async_api import async_playwright
import json

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={"width": 1280, "height": 720})
        page = await context.new_page()

        # Mock API for Tours
        async def mock_tours(route):
            await route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps([
                    {
                        "tour_instance_id": 1,
                        "tour_type": "sunrise",
                        "display_name": "Sunrise Tour",
                        "price": 150,
                        "seats_available": 0,
                        "is_bookable": False,
                        "capacity": 10,
                        "tour_date": "2025-05-20",
                        "duration": "2h",
                        "image_url": "",
                        "inclusions": [],
                        "requirements": []
                    }
                ])
            )
        await page.route("**/api/v1/tours/available*", mock_tours)

        # Mock API for Email Settings
        async def mock_email_settings(route):
            await route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps([
                    {
                        "slug": "guest_confirmation",
                        "display_name": "Guest Confirmation",
                        "description": "Sent after booking",
                        "is_enabled": True,
                        "scheduled_time": None
                    }
                ])
            )
        await page.route("**/api/v1/admin/settings/emails", mock_email_settings)

        # 1. Verify Guest Flow - Closed Tour
        print("Checking Guest Flow...")
        await page.goto("http://localhost:5173/?bypass=true")
        await page.evaluate("localStorage.setItem('language', 'en')")
        await page.reload()

        # Wait for tour card
        await page.wait_for_selector("text=Sunrise Tour")

        # Check for the closed badge
        closed_badge = page.get_by_text("Booking Closed").first
        await closed_badge.wait_for(state="visible")
        print("Guest Flow badge found.")

        # Check pointer events none on the parent
        parent = page.locator("div:has-text('Sunrise Tour')").filter(has_text="Booking Closed").first
        pointer_events = await parent.evaluate("el => window.getComputedStyle(el).pointerEvents")
        print(f"Pointer events: {pointer_events}")

        await page.screenshot(path="verify_guest_closed_v2.png")

        # 2. Verify Admin Modal
        print("Checking Admin Emails Modal...")
        await page.goto("http://localhost:5173/admin/emails?bypass=true")
        await page.evaluate("localStorage.setItem('language', 'en')")
        await page.reload()

        # Wait for settings to load
        await page.wait_for_selector("text=Guest Confirmation")

        # Find a toggle
        toggle = page.locator("button.relative.inline-flex.h-5.w-9").first
        await toggle.click()

        # Wait for modal
        modal_title = page.get_by_text("Are you sure?")
        await modal_title.wait_for(state="visible")
        print("Admin Modal appeared.")

        # Check modal description for "enabled" or "disabled"
        # Since it was enabled, action should be "disabled"
        desc = page.locator("#modal-title + p").inner_text()
        print(f"Modal description: {desc}")

        # Click confirm
        confirm_btn = page.locator("button:has-text('Yes, Change It')")
        await page.screenshot(path="verify_admin_modal_v2.png")
        await confirm_btn.click()
        print("Admin Modal confirmed.")

        # Wait for loading state on button (should be disabled)
        # In our implementation we disabled the toggle button during update
        is_disabled = await toggle.is_disabled()
        print(f"Toggle disabled during update: {is_disabled}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
