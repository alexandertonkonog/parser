/** Непроизводительный парсер отелей на сайте https://101hotels.com/ */
let dataConstructor = (config) => {
    const sites = {
        hotels101: 'https://101hotels.com'
    };

    const configs = {
        [sites.hotels101]: {
            /** Селектор элементов списка на странице */
            parentSelector: '.item',
            /** Элементы конечных строк */
            elements: [
                { selector: 'span[itemprop="name"]', name: 'name', filler: 'Без названия' },
                { selector: 'span[itemprop="streetAddress"]', name: 'address' },
                { selector: '.price-value', prefix: 'от ', name: 'price', suffix: ' рублей' },
            ],
            filter: (value) => +value.price.replace(' ', '') <= 3000 && value.address,
            insert: true,
            withNumbers: true
        }
    };

    const getDataItem = (node, config) => {
        const dataItem = {};
        const getData = getDataFromNode(node);
        config.elements.forEach(item => {
            dataItem[item.name] = getData(item.selector);
        });
        return dataItem;
    };
    
    const parseByConfig = (items) => {
        const config = getConfig();
        return items.map(item => getDataItem(item, config));
    };

    const getConfig = () => {
        const result = config || configs[window.location.origin];
        if (result) return result;
        throw new Error('Не указана конфигурация');
    };

    const getNode = (parent, className) => {
        return parent.querySelector(className);
    };
    
    const getDataFromNode = (parent) => (className) => {
        const node = getNode(parent, className);
        return node?.textContent;
    };

    const getNodeByString = (string) => {
        const node = document.createElement('p');
        node.textContent = string;
        return node;
    };

    const getFilteredDataItems = (items) => {
        const config = getConfig();
        return items.filter(config.filter);
    };

    const getStringPart = (item, configElement) => {
        return `${configElement.prefix || ''}${item[configElement.name] || configElement.filler}${configElement.suffix || ''}`;
    };

    const getDataString = (item, number, config) => {
        const string = config.elements.map(configElement => getStringPart(item, configElement)).join('; ');
        const numberString = `${number}. `;
        return `${config.withNumbers ? numberString : ''}${string}`;
    };

    const getDataStrings = (items) => {
        const config = getConfig();
        return items.map((item, index) => getDataString(item, index + 1, config))
    };

    const insertNodesByStrings = (strings) => {
        const node = document.createElement('div');
        strings.forEach(item => {
            const p = getNodeByString(item);
            node.append(p);
        });
        document.body.append(node);
    };

    const getDataStringsByNodes = (selector) => {
        const nodes = getStartNodesArray(selector);
        const dataItems = parseByConfig(nodes);
        const filteredItems = getFilteredDataItems(dataItems);
        return getDataStrings(filteredItems);
    };

    const getStartNodesArray = (selector) => {
        return Array.from(document.querySelectorAll(selector));
    };

    const executeSideEffects = () => {
        switch (window.location.origin) {
            case sites.hotels101:
                insertNodesByStrings(['string']);
        }
    };

    const executeInserting = (strings) => {
        executeSideEffects();
        insertNodesByStrings(strings);
    };
    
    function getData() {
        const config = getConfig();
        const dataStrings = getDataStringsByNodes(config.parentSelector);

        if (config.insert) executeInserting(dataStrings);
        else return dataStrings;
    };

    getData();
};

dataConstructor();
