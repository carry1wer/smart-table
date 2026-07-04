import './fonts/ys-display/fonts.css'
import './style.css'

import {data as sourceData} from "./data/dataset_1.js";

import { initData } from "./data.js";
import { processFormData } from "./lib/utils.js";
import { initSearching } from "./components/searching.js";
import { initFiltering } from "./components/filtering.js";
import { initSorting } from "./components/sorting.js";
import { initPagination } from "./components/pagination.js";
import { initTable } from "./components/table.js";


const api = initData(sourceData);


/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
    const state = processFormData(new FormData(sampleTable.container));
    const rowsPerPage = parseInt(state.rowsPerPage);    // приведём количество страниц к числу
    const page = parseInt(state.page ?? 1);
    const totalFrom = state.totalFrom ? parseFloat(state.totalFrom) : undefined;
    const totalTo = state.totalTo ? parseFloat(state.totalTo) : undefined;
    const total = [totalFrom, totalTo];                // номер страницы по умолчанию 1 и тоже число
    return {                                            // расширьте существующий return вот так
        ...state,
        rowsPerPage,
        page,
        total
    };
}

/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */
async function render(action) {
    let state = collectState(); // состояние полей из таблицы
    let query = {}; // копируем для последующего изменения
    // @todo: использование
    // result = applySearching(result, state, action);
    // result = applyFiltering(result, state, action);
    // result = applySorting(result, state, action);
    // result = applyPagination(result, state, action);

    query = applyFiltering(query, state, action);
    query = applySearching(query, state, action);
    query = applySorting(query, state, action);
    query = applyPagination(query, state, action);
    
    const {total, items} = await api.getRecords(query);
    
    updatePagination(total, query);
    sampleTable.render(items);
}


async function init() {
    const indexes = await api.getIndexes();
    updateIndexes(sampleTable.filter.elements, {
        searchBySeller: indexes.sellers 
    });
}

const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'header', 'filter'],
    after: ['pagination']
}, render);

// @todo: инициализация



const {applyPagination, updatePagination} = initPagination(
    sampleTable.pagination.elements,
    (el, page, isCurrent) => {
        const input = el.querySelector('input');
        const label = el.querySelector('span');
        input.value = page;
        input.checked = isCurrent;
        label.textContent = page;
        return el;
    }
);

const applySearching = initSearching(sampleTable.search.elements, "search");

const applySorting = initSorting([        // Нам нужно передать сюда массив элементов, которые вызывают сортировку, чтобы изменять их визуальное представление
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal
]);

// const applyFiltering = initFiltering(sampleTable.filter.elements, {    // передаём элементы фильтра
//    searchBySeller: indexes.sellers                                    // для элемента с именем searchBySeller устанавливаем массив продавцов
// });

const { applyFiltering, updateIndexes } = initFiltering(sampleTable.filter.elements);



const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

init().then(render);