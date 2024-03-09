const selectWidgetIdByTextContent = async (page, textContent) =>
    await page.evaluate((textContent) => {
        const elements = Array.from(document.querySelectorAll('span'));
        const selectedElement = elements.find((el) => el.textContent.trim() === textContent);
        return selectedElement.parentNode.id.split(':').pop();
    }, textContent);

export default selectWidgetIdByTextContent;

