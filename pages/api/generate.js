import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured properly",
      },
    });
    return;
  }

  const bands = req.body.bands || "";
  if (bands.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid request",
      },
    });
    return;
  }

  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: generatePrompt(bands),
      temperature: 0.2,
      max_tokens: 800,
      n: 3,
    });
    res.status(200).json({ result: completion.data.choices[0].text });
  } catch (error) {
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: "An error occurred during your request.",
        },
      });
    }
  }
}

function generatePrompt(animal) {
  return `Please give me suggestions of new music to listen to in the form of a list of real bands based only on these words or feelings: ${animal}. Put them in the format of:
  1.(Artist 1) - is a " "
  2.(Artist 2 ) - They are " "
  Include a short blurb about what they are like.
  If a user inputs an actual band please don't repeat it back in the list
  Also please don't print any incomplete responses - if the token limit isn't long enough just leave of the last band please.`;
}
