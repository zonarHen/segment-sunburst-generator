# Welcome to your Lovable project

This project features an interactive concept mapping tool powered by Google's Gemini AI and D3.js. The visualization is based on [D3's Zoomable Sunburst visualization](https://observablehq.com/@d3/zoomable-sunburst).

## Getting Started

1. **Get a Google API Key**
   - Visit the [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key if you don't have one
   - Copy your API key
   - Paste it in the application's sidebar when prompted

2. **Using the App**
   - Enter a central concept in the input field
   - Click "Generate" to create the initial sunburst diagram
   - Click on any outer segment to expand it further
   - Use two fingers on a trackpad to scroll and zoom
   - Use the download button to save your diagram as SVG

## Project info

**URL**: https://lovable.dev/projects/26a44471-801c-4dbd-9318-9580a0de482a

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/26a44471-801c-4dbd-9318-9580a0de482a) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- D3.js
- Google's Gemini AI

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/26a44471-801c-4dbd-9318-9580a0de482a) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)