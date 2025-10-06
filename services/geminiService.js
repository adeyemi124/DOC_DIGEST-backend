const axios = require('axios');
const cheerio = require('cheerio');

const apiKey = process.env.GEMINI_API_KEY;

// Function to fetch and extract text content from a URL
const getTextFromUrl = async (url) => {

	try {
		const { data } = await axios.get(url, {
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
				'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
				'Accept-Language': 'en-US,en;q=0.9',
				'Cache-Control': 'no-cache',
			},
			maxRedirects: 5,
			timeout: 15000,
			validateStatus: (s) => s >= 200 && s < 400, // accept 3xx; axios will follow
		});
		const $ = cheerio.load(data);
		$('script, style').remove();
		return $('body').text().replace(/\s\s+/g, ' ').trim();
	} catch (error) {
		console.error(`Error fetching URL: ${error.message}`);
		throw new Error('Could not fetch or process the URL. Please ensure it is valid and accessible.');
	}


	// try {
	// 	const { data } = await axios.get(url);
	// 	const $ = cheerio.load(data);
	// 	$('script, style').remove();
	// 	return $('body').text().replace(/\s\s+/g, ' ').trim();
	// } catch (error) {
	// 	console.error(`Error fetching URL: ${error.message}`);
	// 	throw new Error('Could not fetch or process the URL. Please ensure it is valid and accessible.');
	// }
};

// Function to construct the prompt for the Gemini API
const constructPrompt = (content, inputType, mode) => {
    let promptIntro = '';
    // Treat Learn (url) the same as Text; Query uses question format
    if (inputType === 'url' || inputType === 'text') {
        promptIntro = `Analyze the following documentation content and provide a response in the requested format. The content is:\n\n---\n${content}\n---\n\n`;
    } else {
        promptIntro = `Answer the following query:\n\n---\n${content}\n---\n\n`;
    }

    const formatInstructions = {
        summary: 'Provide a concise, bullet-point summary of the key concepts, features, and main points.',
        'step-by-step': 'Provide a clear, actionable, step-by-step guide to implement the described functionality. Include code snippets where appropriate.',
        examples: 'Provide practical, well-explained code examples demonstrating the core features described in the content.',
    };

    const jsonStructure = `
        Your response MUST be a single, valid JSON object that conforms to the following structure. Do not include any text or markdown formatting outside of this JSON object.
        {
            "title": "A concise and descriptive title for the analysis",
            "overview": "A brief, one or two-sentence overview of the result.",
            "sections": [
                {
                    "title": "Title for the first section",
                    "content": "The main content for this section. Use markdown for formatting, like bullet points (e.g., \"• Point 1\").",
                    "codeSnippets": [
                        {
                            "language": "e.g., 'javascript' or 'python'",
                            "code": "Your code snippet here",
                            "description": "A brief description of the code snippet"
                        }
                    ]
                }
            ]
        }
    `;

    return `${promptIntro}The requested output format is: "${mode}". ${formatInstructions[mode] || ''}\n\n${jsonStructure}`;
};

const analyzeContent = async ({ input, inputType, mode }) => {
    let contentToProcess = input;
    // For Learn (url) we use the raw input as the topic; do not fetch remote content here.

	const prompt = constructPrompt(contentToProcess, inputType, mode);

    try {
		if (!apiKey) {
			throw new Error('GEMINI_API_KEY is not set in environment.');
		}

		const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
		const { data } = await axios.post(endpoint, {
			contents: [
				{
					role: 'user',
					parts: [{ text: prompt }],
				},
			],
		});

		const jsonResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

		const cleanedJson = (jsonResponse || '')
			.replace(/```json\n|```/g, '')
			.trim();

		const parsedResult = JSON.parse(cleanedJson);

		return {
			id: `gemini-${Date.now()}`,
			mode,
			input,
			inputType,
			result: parsedResult,
			timestamp: new Date(),
		};
	} catch (error) {
		console.error('Error calling Gemini API:', error);
		throw new Error('Failed to get a valid response from the AI model.');
	}
};

module.exports = {
	analyzeContent,
};


