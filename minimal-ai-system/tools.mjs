import { JSDOM } from 'jsdom';

// In-memory store for selectors
const selectorStore = new Map();

const tools = [
    {
        "type": "function",
        "function": {
            "name": "addSelector",
            "description": "Adds a selector that will be used to extract data from the page during future webscraping tasks",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "The name to store the results under",
                    },
                    "selector": {
                        "type": "string",
                        "description": "The selector to run, e.g. '.class-name'",
                    }
                },
                "required": ["name", "selector"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "quickTestSelector",
            "description": "Tests a selector on a page without saving it, allowing you to see if it works",
            "parameters": {
                "type": "object",
                "properties": {
                    "selector": {
                        "type": "string",
                        "description": "The selector to run, e.g. '.class-name'",
                    }
                },
                "required": ["selector"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "removeSelector",
            "description": "Removes a selector from the database by name",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "The name of the selector to remove",
                    }
                },
                "required": ["name"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "markComplete",
            "description": "Marks the current task as complete",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "clearAllSelectors",
            "description": "Clears all selectors from the database. Only use this if you've made significant mistakes and need to start over",
            "parameters": {
                "type": "object",
                "properties": {
                    "confirm": {
                        "type": "boolean",
                        "description": "Confirm that you want to clear all selectors",
                    }
                },
                "required": ["confirm"],
            },
        },
    }
];


async function useTool(toolName, params, html) {
    const parsedParams = JSON.parse(params);
    console.log('toolName: ', toolName);
    console.log('parsedParams: ', parsedParams);
    switch (toolName) {
        case 'addSelector':
            return addSelector(parsedParams.name, parsedParams.selector, html);
        case 'quickTestSelector':
            return quickTestSelector(parsedParams.selector, html);
        case 'removeSelector':
            return removeSelector(parsedParams.name, html);
        case 'clearAllSelectors':
            return clearAllSelectors(parsedParams.confirm);
        case 'markComplete':
            return markComplete(html);
        default:
            throw new Error(`Unknown tool: ${toolName}`);
    }
}

async function getTools() {
    return tools;
}

async function quickTestSelector(selector, html) {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    console.log('selector: ', selector);
    console.log('html: ', html);
    const elements = document.querySelectorAll(selector);
    console.log('elements: ', elements.length ? elements[0].outerHTML : 'No elements found');
    return JSON.stringify(Array.from(elements).map(el => el.textContent.trim()));
}

async function addSelector(name, selector, html) {
    const dom = new JSDOM(`<!DOCTYPE html><html><body>${html}</body></html>`);
    const document = dom.window.document;
    const elements = document.querySelectorAll(selector);
    const results = Array.from(elements).map(el => el.textContent.trim());
    selectorStore.set(name, selector);
    console.log(`Saved selector ${name} = ${selector} to memory`);
    return `Added selector "${name}" with value "${selector}". Test results: ${JSON.stringify(results)}`;
}

async function clearAllSelectors(confirm) {
    if (!confirm) {
        throw new Error("You must confirm that you want to clear all selectors");
    }
    selectorStore.clear();
    console.log("Cleared all selectors from memory");
    return 'Cleared all selectors from memory';
}

async function removeSelector(name) {
    selectorStore.delete(name);
    console.log(`Removed selector ${name} from memory`);
    return `Removed selector ${name} from memory`;
}

async function markComplete(html) {
    const currentSelectors = Array.from(selectorStore.entries()).map(([name, selector]) => ({
        name,
        selector
    }));

    // Run tests for each selector
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const results = {};
    
    for (const {name, selector} of currentSelectors) {
        const elements = document.querySelectorAll(selector);
        results[name] = Array.from(elements).map(el => el.textContent.trim());
    }

    console.log("Marked the current task as complete: results: ", JSON.stringify(results, null, 2));
    return `Task completed with ${currentSelectors.length} selectors created. Test results:
    ${JSON.stringify(results, null, 2)}
    
    If this looks good, respond without a tool call to the "user" with a message summarizing the task and the results, as well as the exact selectors used and exact results.  

    If something is wrong, call the clearAllSelectors tool with the confirm parameter set to true to start over.
    `;
}

export { getTools, useTool }; 