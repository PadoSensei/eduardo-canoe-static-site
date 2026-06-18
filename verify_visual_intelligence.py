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
                        "tour_type": "sunset",
                        "display_name": "Sunset Tour",
                        "price": 200,
                        "seats_available": 10,
                        "is_bookable": True,
                        "capacity": 20,
                        "tour_date": "2026-06-19",
                        "duration": "2h",
                        "image_url": "",
                        "inclusions": [],
                        "requirements": [],
                        "start_time": "16:30",
                        "meeting_time": "16:10",
                        "is_special_event": False
                    },
                    {
                        "tour_instance_id": 2,
                        "tour_type": "full_moon",
                        "display_name": "Full Moon Experience",
                        "price": 500,
                        "seats_available": 5,
                        "is_bookable": True,
                        "capacity": 12,
                        "tour_date": "2026-06-19",
                        "duration": "3h",
                        "image_url": "",
                        "inclusions": [],
                        "requirements": [],
                        "start_time": "19:30",
                        "meeting_time": "19:10",
                        "is_special_event": True
                    }
                ])
            )
        await page.route("**/api/v1/tours/available*", mock_tours)

        # Mock API for Templates
        async def mock_templates(route):
            await route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps([
                    {
                        "id": 1,
                        "name": "sunset",
                        "display_name": "Sunset Tour",
                        "default_start_time": "17:00",
                        "default_meeting_time": "16:40"
                    }
                ])
            )
        await page.route("**/api/v1/tours/templates", mock_templates)

        # 1. Verify Booking List (Special Event UI)
        print("Checking Booking List...")
        await page.goto("http://localhost:5173/?date=2026-06-19&bypass=true")
        await page.evaluate("localStorage.setItem('language', 'en')")
        await page.reload()

        await page.wait_for_selector("text=Full Moon Experience")

        # Check for Monthly Special Event badge
        badge = page.get_by_text("Monthly Special Event")
        await badge.wait_for(state="visible")
        print("Special Event badge found.")

        # Check for Dark Theme (bg-slate-900)
        special_card = page.locator("div:has-text('Full Moon Experience')").filter(has_text="Monthly Special Event").first
        bg_color = await special_card.evaluate("el => window.getComputedStyle(el).backgroundColor")
        print(f"Special Card BG Color: {bg_color}") # Should be slate-900 (rgb(15, 23, 42))

        await page.screenshot(path="verify_booking_list.png")

        # 2. Verify Tour Modal (Dynamic Times)
        print("Checking Tour Modal...")
        # Click on "Book Now" for the Sunset Tour (which has 16:30 start time)
        await page.locator("button:has-text('Book Now')").first.click()

        await page.wait_for_selector("text=Tour Details")

        start_time_row = page.locator("div:has-text('Start Time') >> text=16:30")
        meeting_time_row = page.locator("div:has-text('Meeting Time') >> text=16:10")

        await start_time_row.wait_for(state="visible")
        await meeting_time_row.wait_for(state="visible")
        print("Dynamic times found in Tour Modal.")

        await page.screenshot(path="verify_tour_modal.png")
        await page.locator("button:has-text('Close')").click()

        # 3. Verify Booking Form (Dynamic Times)
        print("Checking Booking Form...")
        # Click on "Book Now" for the Special Event (which has 19:30 start time)
        await page.locator("button:has-text('Book Now')").last.click()
        # Click "Next" in Modal if needed? No, wait, BookingSystem opens Modal, then Form.
        # Actually in BookingSystem.tsx, "Book Now" usually opens the modal.
        # Let's check the button text in the modal.
        await page.locator("button:has-text('Proceed to Booking')").click()

        await page.wait_for_selector("text=Start Time:")
        form_start_time = page.locator("div:has-text('Start Time:') >> text=19:30")
        await form_start_time.wait_for(state="visible")
        print("Dynamic start time found in Booking Form.")
        await page.screenshot(path="verify_booking_form.png")

        # 4. Verify FAQ (Data Injection)
        print("Checking FAQ Injection...")
        await page.goto("http://localhost:5173/faq?bypass=true")
        await page.evaluate("localStorage.setItem('language', 'en')")
        await page.reload()

        # Wait for templates to load and inject
        await asyncio.sleep(1)

        # Open "Logistics" or search for "time"
        await page.locator("button:has-text('Logistics')").click()
        await page.locator("button:has-text('What time is the tour?')").click()

        # Check for injected time (17:00 from mock_templates)
        injected_text = page.locator("text=17:00")
        await injected_text.wait_for(state="visible")
        print("Injected time found in FAQ.")

        await page.screenshot(path="verify_faq.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
