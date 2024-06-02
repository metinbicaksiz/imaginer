[DEMO LINK](https://imaginer.vercel.app)


![imaginer](https://github.com/metinbicaksiz/imaginer/blob/main/assets/images/imaginer.png)
```markdown
# Imaginer

## Introduction

**Imaginer** is a simple image generator that uses your prompts to generate AI-based images. Built with **Next.js**, it leverages the Replicate API to transform textual descriptions into visual art. This repository contains the source code for Imaginer, offering a seamless experience for users to create unique images with just a few words.

## Features

- 🌟 **AI-based Image Generation**: Generate images based on textual prompts.
- 🚀 **Next.js Integration**: Built on top of the powerful Next.js framework.
- 🛡️ **Rate Limiting**: Prevent abuse with rate limiting middleware.
- 🎨 **Responsive Design**: Beautiful and responsive design using modern CSS techniques.
- ✨ **Loading Animations**: User-friendly loading animations during image generation.
- 💾 **Downloadable Images**: Easily download the generated images.
- 🧩 **Prompt Suggestions**: Get inspiration from pre-defined prompt suggestions.

## Requirements

To run this project, ensure you have the following installed:

- **Node.js** (v14.x or later)
- **npm** (v6.x or later) or **yarn**

## Installation

Follow these steps to set up the project locally:

1. **Clone the repository**:
    ```bash
    git clone https://github.com/metinbicaksiz/imaginer.git
    cd imaginer
    ```

2. **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

3. **Set up environment variables**:
    Create a `.env.local` file in the root directory and add the following:
    ```env
    REPLICATE_API_URL=https://api.replicate.com/v1
    REPLICATE_API_TOKEN=your_replicate_api_token
    ```

4. **Run the development server**:
    ```bash
    npm run dev
    # or
    yarn dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1. **Navigate to the homepage**:
    Open [http://localhost:3000](http://localhost:3000) in your browser.

2. **Enter a prompt**:
    Type a description of the image you want to generate in the text area.

3. **Generate the image**:
    Click the "Generate" button to start the image generation process.

4. **View and download**:
    Once the image is generated, it will be displayed on the page. You can download it by clicking the "Download" link.

## Configuration

### Next.js Configuration

The Next.js configuration is defined in `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: "replicate.delivery",
        protocol: "https",
      },
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};

module.exports = nextConfig;
```

### Rate Limiting

Rate limiting is implemented using `express-rate-limit` and `express-slow-down` in `utils/rate-limiter.js`:
```javascript
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';

const applyMiddleware = (middleware) => (request, response) =>
  new Promise((resolve, reject) => {
    middleware(request, response, (result) =>
      result instanceof Error ? reject(result) : resolve(result)
    );
  });

const getIP = (request) =>
  request.headers['x-forwarded-for'] ||
  request.headers['x-real-ip'] ||
  request.connection.remoteAddress;

export const getRateLimitMiddlewares = () => {
  const max = 3;
  const windowMs = 12 * 60 * 60 * 1000;
  const keyGenerator = getIP;

  return [
    slowDown({ keyGenerator, windowMs }),
    rateLimit({ keyGenerator, windowMs, max }),
  ];
};

const middlewares = getRateLimitMiddlewares();

async function applyRateLimit(request, response) {
  await Promise.all(
    middlewares
      .map(applyMiddleware)
      .map((middleware) => middleware(request, response))
  );
}

export { applyRateLimit };
```

### API Route

The API route for generating images is defined in `pages/api/generate/index.js`:
```javascript
const REPLICATE_MODEL_VERSION =
  "f178fa7a1ae43a9a9af01b833b9d2ecf97b1bcb0acfd2dc5dd04895e042863f1";

const startGeneration = async (prompt) => {
  const response = await fetch(`${process.env.REPLICATE_API_URL}/predictions`, {
    headers: {
      Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      version: REPLICATE_MODEL_VERSION,
      input: { prompt },
    }),
  });

  return response.json();
};

const getGeneration = async (url) => {
  const result = await fetch(url, {
    headers: {
      Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  return result.json();
};

async function handler(req, res) {
  const { prompt } = req.body;

  if (!prompt) res.status(400).json("No prompt provided");

  const predictions = await startGeneration(prompt);

  let generatedImage;

  while (!generatedImage) {
    const result = await getGeneration(predictions.urls.get);

    if (result.status === "succeeded") {
      [generatedImage] = result.output;
    } else if (result.status === "failed") {
      break;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  res
    .status(200)
    .json(generatedImage ? generatedImage : "Failed to generate the image");
}

export default handler;
```

## Conclusion

Imaginer is a robust and user-friendly application designed to bring your textual prompts to life through AI-generated images. With its seamless integration with Next.js and the Replicate API, generating images has never been easier. Whether you're looking for inspiration or just want to experiment with AI, Imaginer has you covered. Enjoy creating! 🚀
```
