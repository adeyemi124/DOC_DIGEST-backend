// const Anthropic = require('@anthropic-ai/sdk');
// const axios = require('axios');
// const cheerio = require('cheerio');

// const anthropic = new Anthropic({
// 	apiKey: process.env.GEMINI_API_KEY, // Deprecated: switch to GEMINI_API_KEY for consistency
// });

// // Function to fetch and extract text content from a URL
// const getTextFromUrl = async (url) => {
//   try {
//     const { data } = await axios.get(url);
//     const $ = cheerio.load(data);
//     // Remove script and style tags to clean up the content
//     $('script, style').remove();
//     return $('body').text().replace(/\s\s+/g, ' ').trim();
//   } catch (error) {
//     console.error(`Error fetching URL: ${error.message}`);
//     throw new Error('Could not fetch or process the URL. Please ensure it is valid and accessible.');
//   }
// };

// // Function to construct the prompt for the Claude API
// const constructPrompt = (content, inputType, mode) => {
//   let promptIntro = '';
//   if (inputType === 'url' || inputType === 'text') {
//     promptIntro = `Analyze the following documentation content and provide a response in the requested format. The content is:\n\n---\n${content}\n---\n\n`;
//   } else { // query
//     promptIntro = `Answer the following query:\n\n---\n${content}\n---\n\n`;
//   }

//   const formatInstructions = {
//     summary: 'Provide a concise, bullet-point summary of the key concepts, features, and main points.',
//     'step-by-step': 'Provide a clear, actionable, step-by-step guide to implement the described functionality. Include code snippets where appropriate.',
//     examples: 'Provide practical, well-explained code examples demonstrating the core features described in the content.',
//   };

//   const jsonStructure = `
//     Your response MUST be a single, valid JSON object that conforms to the following structure. Do not include any text or markdown formatting outside of this JSON object.
//     {
//       "title": "A concise and descriptive title for the analysis",
//       "overview": "A brief, one or two-sentence overview of the result.",
//       "sections": [
//         {
//           "title": "Title for the first section",
//           "content": "The main content for this section. Use markdown for formatting, like bullet points (e.g., \\"• Point 1\\").",
//           "codeSnippets": [
//             {
//               "language": "e.g., 'javascript' or 'python'",
//               "code": "Your code snippet here",
//               "description": "A brief description of the code snippet"
//             }
//           ]
//         }
//       ]
//     }
//   `;

//   return `${promptIntro}The requested output format is: "${mode}". ${formatInstructions[mode] || ''}\n\n${jsonStructure}`;
// };

// const analyzeContent = async ({ input, inputType, mode }) => {
//   let contentToProcess = input;

//   if (inputType === 'url') {
//     contentToProcess = await getTextFromUrl(input);
//   }

//   const prompt = constructPrompt(contentToProcess, inputType, mode);

//   try {
//     const msg = await anthropic.messages.create({
//       model: "claude-3-sonnet-20240229",
//       max_tokens: 4096,
//       messages: [{ role: "user", content: prompt }],
//     });

//     // Assuming the response from Claude is a JSON string in the content block
//     const jsonResponse = msg.content[0].text;
    
//     // Clean the response to ensure it's valid JSON
//     const cleanedJson = jsonResponse.replace(/```json\n|```/g, '').trim();

//     const parsedResult = JSON.parse(cleanedJson);

//     // Structure the final result to match the frontend's expectation
//     return {
//       id: `claude-${Date.now()}`,
//       mode,
//       input,
//       inputType,
//       result: parsedResult,
//       timestamp: new Date(),
//     };

//   } catch (error) {
//     console.error('Error calling Claude API:', error);
//     throw new Error('Failed to get a valid response from the AI model.');
//   }
// };

// module.exports = {
//   analyzeContent,
// };
