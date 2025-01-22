import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { getTools, useTool } from './tools.mjs';

dotenv.config();

async function openAiCall(systemPrompt, history, model = "gpt-4o-mini") {
    const historyWithSystemPrompt = [
        { role: "system", content: systemPrompt },
        ...history
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: model,
            messages: historyWithSystemPrompt,
            tools: await getTools()
        }),
    });
    const responseData = await response.json();
    const message = responseData.choices[0].message.content;
    const tool_calls = responseData.choices[0].message.tool_calls;
    return { message, tool_calls };
}

const systemPrompt = `You are an expert coder using a tool to configure a webscraping process.  You will be provided with some html and a set of data the user wants to extract.  Your job is to create queries that will extract the data from the html or any page like it.  You process should be:

1. Receive the html and data
2. If the structure is complex, use the quickTestSelector tool to test a selector or number of selectors on the page and see if they returns the correct data
3. Once you're happy with the selectors or if you're confident the selectors will work first try, use the addSelector tool to save them to the database for future use
4. If you make a mistake and add a broken selector, use the removeSelector tool to remove it from the database by name, then go back to step 2
5. When you're happy with the way the selectors work, use the markComplete tool to make your job complete

The "user" messages are not actually coming from the user, they are just meant to assign your tasks and provide automated error messages and feedback.  You should not respond to them unless prompted to do so, just use the tools to do your job.
`;

async function getAiResponse(history, html) {
    let toolCallsExist = true;
    
    while (toolCallsExist) {
        const { message, tool_calls } = await openAiCall(systemPrompt, history);
        if (!tool_calls) {
            // Add the assistant's message to the history
            history.push({ role: 'assistant', content: message });
            toolCallsExist = false;
            continue;
        } else {
            // Add the assistant's message to the history
            history.push({ role: 'assistant', content: message, tool_calls: tool_calls });
        }
        
        // Process each tool call
        for (const tool_call of tool_calls) {
            try {
                // Use the tool and get the result
                const toolResult = await useTool(
                    tool_call.function.name, 
                    tool_call.function.arguments,
                    html
                );
                
                // Add the tool response to the history
                history.push({ 
                    role: 'tool', 
                    content: toolResult,
                    tool_call_id: tool_call.id,
                    name: tool_call.function.name
                });
            } catch (error) {
                console.error(`Error using tool ${tool_call.function.name}:`, error);
                history.push({ 
                    role: 'tool', 
                    content: "Error using tool",
                    tool_call_id: tool_call.id,
                    name: tool_call.function.name
                });
            }
        }
    }
    // log the final message
    console.log("Final message: ", history[history.length - 1].content);
    // Return the final message
    return history[history.length - 1].content;
}

export { getAiResponse }; 