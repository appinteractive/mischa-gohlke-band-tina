import { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";

// Initialize YouTube API client
const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY, // Add this to your .env file
});

async function getYoutubeMetadata(videoId: string) {
  const response = await youtube.videos.list({
    part: ["snippet", "contentDetails"],
    id: [videoId],
  });

  const video = response.data.items?.[0];
  if (!video) {
    throw new Error("Video not found");
  }

  return {
    title: video.snippet?.title || "",
    description: video.snippet?.description || "",
    thumbnailUrl: video.snippet?.thumbnails?.maxres?.url ||
      video.snippet?.thumbnails?.high?.url ||
      video.snippet?.thumbnails?.default?.url || "",
    duration: formatDuration(video.contentDetails?.duration || ""),
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  console.log("req.query", req.query);
  const { videoId } = req.query;

  try {
    const metadata = await getYoutubeMetadata(videoId as string);
    console.log("metadata", metadata);
    res.status(200).json(metadata);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Convert ISO 8601 duration to hh:mm:ss format
// PT83M34S -> 1:23:34
// PT23M3S -> 23:03
// PT3M3S -> 3:03
// PT3S -> 0:03
function formatDuration(duration?: string) {
  if (!duration || duration === undefined || duration === null) return null;

  const parts = duration.match(/(\d+)(?=[HMS])/g);
  let hours = 0,
    minutes = 0,
    seconds = 0;

  if (parts) {
    if (parts.length === 3) {
      hours = parseInt(parts[0]);
      minutes = parseInt(parts[1]);
      seconds = parseInt(parts[2]);
    } else if (parts.length === 2) {
      minutes = parseInt(parts[0]);
      seconds = parseInt(parts[1]);
    } else if (parts.length === 1) {
      seconds = parseInt(parts[0]);
    }
  }

  // Handle minutes greater than 60
  if (minutes >= 60) {
    hours += Math.floor(minutes / 60);
    minutes = minutes % 60;
  }

  let formattedDuration = "";
  if (hours > 0) {
    formattedDuration += `${hours}:`;
  }
  formattedDuration += `${minutes.toString().padStart(2, "0")}:${
    seconds
      .toString()
      .padStart(2, "0")
  }`;

  // Remove leading zeros
  formattedDuration = formattedDuration.replace(/^0+/, "");

  // fix for :44 -> 0:44
  if (formattedDuration.startsWith(":")) {
    formattedDuration = `0${formattedDuration}`;
  }

  return formattedDuration;
}

// console.log(formatDuration('PT83M34S')) // 1:23:34
// console.log(formatDuration('PT23M3S')) // 23:03
// console.log(formatDuration('PT3M3S')) // 3:03
// console.log(formatDuration('PT3S')) // 0:03
