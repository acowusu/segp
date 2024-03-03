import { downloadAndExtract } from "./scrape";
import { test, expect, vi  } from "vitest";

test("downloadAndExtract should return the text content and image URLs", async () => {
  // Mock the fetch function to return a successful response
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    text: vi.fn().mockResolvedValue("<div id='main-content'>Hello World</div>")
  });

  const result = await downloadAndExtract("https://example.com");

  expect(result).toEqual({
    textContent: "Hello World",
    imageUrls: []
  });
});

test("downloadAndExtract should throw an error when download fails", async () => {
  // Mock the fetch function to return an unsuccessful response
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status: 404
  });

  await expect(downloadAndExtract("https://example.com")).rejects.toThrowError(
    "Failed to download file: HTTP Error 404"
  );
});

test("downloadAndExtract should return the text content and image URLs when images are present", async () => {
    // Mock the fetch function to return a successful response
    global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: vi.fn().mockResolvedValue("<div id='main-content'><img src='image1.jpg'><img src='image2.jpg'></div>")
    });

    const result = await downloadAndExtract("https://example.com");

    expect(result).toEqual({
        textContent: "",
        imageUrls: ["image1.jpg", "image2.jpg"]
    });
});

test("downloadAndExtract should return text and images from a bbc article", async () => {
    // Mock the fetch function to return a successful response
    

    const result = await downloadAndExtract("https://www.bbc.co.uk/news/world-middle-east-68456718");
    console.log("Text", result.textContent.length);
    // expect(result.textContent).toContain("refugees");
    expect(result.imageUrls.length).toBeGreaterThan(0);
});
