import { JSDOM } from 'jsdom';

export async function downloadAndExtract(url: string): Promise<{ textContent: string, imageUrls: string[] }> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to download file: HTTP Error ${response.status}`);
    }
    const html = await response.text();

    // const doc = new JSDOM(html, {
    //     resources: undefined,
    //     url
    //   }).window.document;
    const doc = JSDOM.fragment(html);
    const mainContent = doc.getElementById("main-content");
    const textContent = extractTextFromNode(mainContent!)
    // console.log("Text:", textContent);
    const imageUrls: string[] = [];
    const images: HTMLCollectionOf<HTMLImageElement> | undefined = mainContent?.getElementsByTagName("img");
    if (images) {
        for (let i = 0; i < images.length; i++) {
            const imageUrl = images[i].getAttribute("src");
            if (imageUrl) {
                imageUrls.push(imageUrl);
                console.log("Image:", imageUrl);
            }
        }
    }
  

    return { textContent, imageUrls };
}

function extractTextFromNode(node: Node): string {

    if (node.nodeType === 3) {
        if(node.textContent?.includes("<")) return "";
        return node.textContent || "";
    }
    let text = "";
    for (let i = 0; i < node.childNodes.length; i++) {
        text += extractTextFromNode(node.childNodes[i]);
    }
    return text;
}