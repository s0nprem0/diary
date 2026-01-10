import Sentiment from "sentiment";

const sentiment = new Sentiment();

interface EmotionResult {
  score: number;
  mood: string;
}

export const analyzeEmotion = (text: string): EmotionResult => {
  const result = sentiment.analyze(text);
  const score = result.score;

  // Simple rule-based mood detection based on score
  // You can replace this logic with an AI API call later
  let mood = "Neutral";
  if (score > 2) mood = "Happy";
  else if (score > 0) mood = "Good";
  else if (score < -2) mood = "Sad";
  else if (score < 0) mood = "Bad";

  return { score, mood };
};
