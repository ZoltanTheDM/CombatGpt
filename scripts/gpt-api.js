import { moduleName } from './settings.js';
import { pushHistory } from './history.js';

//Low temperature (0 to 0.3): More focused, coherent, and conservative outputs.
//Medium temperature (0.3 to 0.7): Balanced creativity and coherence.
//High temperature (0.7 to 1): Highly creative and diverse, but potentially less coherent.
const TEMPATURE = 1;

async function callGptApi(query) {
	const apiKey = game.settings.get(moduleName, 'apiKey');
	const model = game.settings.get(moduleName, 'modelVersion');
	// const prompt = getGamePromptSetting();
	const apiUrl = 'https://api.openai.com/v1/chat/completions';
	// const promptMessage = {role: 'user', content: prompt};
	const queryMessage = {role: 'user', content: query};
	const messages = [queryMessage];

	const requestBody = {
		model,
		messages,
		temperature: TEMPATURE,
	};

	const requestOptions = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${apiKey}`,
		},
		body: JSON.stringify(requestBody),
	};

	// console.log(requestOptions)
	// return "NOTHING";

	const is4xx = c => c >= 400 && c < 500;
	const handleFailedQuery = async (response, msg) => {
		let err = `${response?.status}`;
		try {
			const data = await response.json();
			console.debug(`${moduleName} | callGptApi(): failure data =`, data);
			err = `${data?.error?.message} (${err})`;
		} catch (e) {
			console.warn(`${moduleName} | Could not decode failed API response.`, e);
		}
		throw new Error(`${msg}: ${err}`);
	};

	let response = {};
	for (
		let retries = 0, backoffTime = 5000;
		retries < 5 && !response?.ok;
		retries++, await new Promise(r => setTimeout(r, backoffTime))
	) {
		console.debug(`${moduleName} | callGptApi(): waiting for reply (tries: ${retries})`);
		response = await fetch(apiUrl, requestOptions);
		console.debug(`${moduleName} | callGptApi(): response =`, response);
		if (response?.status && is4xx(response?.status)) {
			await handleFailedQuery(response, "ChatGPT API failed");
		}
	}

	if (response?.ok) {
		const data = await response.json();
		console.debug(`${moduleName} | callGptApi(): response data =`, data);

		const replyMessage = data.choices[0].message;
		pushHistory(replyMessage.content.trim());
		return replyMessage.content.trim();
	} else {
		await handleFailedQuery(response, "ChatGPT API failed multiple times");
	}
}

export async function getGptReplyAsHtml(query) {
	const answer = await callGptApi(query);
	const html = /<\/?[a-z][\s\S]*>/i.test(answer) || !answer.includes('\n') ?
		answer : answer.replace(/\n/g, "<br>");
	return html.replaceAll("```", "");
}
