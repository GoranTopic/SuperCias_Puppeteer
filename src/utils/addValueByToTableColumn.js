import options from '../../options.json' assert { type: 'json' };

const addFiltersToTableColumn = async (page, table, filters) => {

    await page.evaluate((textContent) => {
        PrimeFaces.widgets['tblDocumentosGenerales'].sortableColumns[1].childNodes[3].value = '2016'
        PrimeFaces.widgets['tblDocumentosGenerales'].filter()
    }, textContent);
}

export default selectWidgetIdByTextContent;