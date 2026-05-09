import type { NextApiRequest, NextApiResponse } from "next";

interface ConfigResponse {
  destinations: {
    linear: boolean;
    github: boolean;
    notion: boolean;
  };
}

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<ConfigResponse>
) {
  res.setHeader("Cache-Control", "public, max-age=60");
  return res.status(200).json({
    destinations: {
      linear: Boolean(process.env.LINEAR_API_KEY),
      github: Boolean(
        process.env.GITHUB_TOKEN &&
          process.env.GITHUB_OWNER &&
          process.env.GITHUB_REPO
      ),
      notion: Boolean(process.env.NOTION_TOKEN && process.env.NOTION_DATABASE_ID),
    },
  });
}
