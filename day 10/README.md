# Smart Doc Q&A — Ask My Notes

A full-stack, in-memory AI-powered document exploration web application that allows users to upload a PDF document and ask natural language questions about its content. Responses include inline page citations and source highlights, as well as token-level cost telemetry.

---

## Features

- 📁 **Instant PDF Upload**: Upload local PDF files up to 10MB (processed completely in-memory on the server).
- ⚙️ **Page-by-Page Parsing**: PDF content is extracted and split page-by-page dynamically using Node's `pdf-parse`.
- 💬 **Contextual Q&A**: Ask multi-turn follow-up questions referencing the uploaded document.
- 📌 **Exact Source Citations**: Inline citations like `Pg X` indicating the source pages where the information was drawn, and clickable badges at the bottom of responses.
- 📊 **Real-time Telemetry & Costs**: Displays detailed prompts, response, total token counts, and estimated USD pricing on every response.
- 🕒 **Active Session History**: View a sidebar log of your current questions and jump back to them in the conversation container.
- 🧊 **Premium Glassmorphic UI**: Tailored harmonized dark slate/cyan theme with responsive grid design, micro-animations, loading skeletons, and custom elements.

---

## Directory Structure

```text
day-10/
├── backend/
│   ├── uploads/          # Directory placeholder (unused as processing is in-memory)
│   ├── server.js         # Express app, Multer upload, PDF parse, and Groq handler
│   ├── package.json      # Backend script configuration and dependencies
│   └── .env.example      # Example server environment configuration
├── frontend/
│   ├── src/
│   │   ├── components/   # ChatInterface, HistorySidebar, UploadZone, TelemetryBadge
│   │   ├── App.jsx       # Main application controller and API routers
│   │   ├── index.css     # CSS variable stylesheet, typography, layout, animations
│   │   └── main.jsx      # Vite React app mounting entry-point
│   ├── index.html        # HTML frame containing Google Fonts
│   ├── vite.config.js    # React plugin and proxy settings to backend API
│   └── package.json      # Frontend script configuration and dependencies
├── README.md             # Project instruction and documentation (this file)
└── .env.example          # Root environment variable template
```

---

## Setup and Installation

### 1. Prerequisites
- **Node.js**: Ensure you have Node.js installed (v18+ recommended).
- **Groq API Key**: A valid Groq API developer key (`gsk_...`).

### 2. Environment Configuration
Navigate to the `backend` directory (or the root `day-10` folder) and copy `.env.example` to `.env`:

```bash
cd backend
cp .env.example .env
```

Open `.env` and fill in your Groq API Key:

```env
PORT=5000
GROQ_API_KEY=your_actual_groq_api_key_here
```

### 3. Backend Setup
Install backend dependencies and start the development server:

```bash
cd backend
npm install
npm run start
```
The server will boot up at `http://localhost:5000`.

### 4. Frontend Setup
In a new terminal window, navigate to the `frontend` directory, install packages, and spin up the Vite dev server:

```bash
cd frontend
npm install
npm run dev
```
Vite will start the client interface at `http://localhost:3000`.

---

## API Documentation

### 1. Upload PDF
- **Endpoint**: `POST /api/upload`
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  - `pdf`: The file binary (PDF only)
- **Response**:
  ```json
  {
    "success": true,
    "pages": 12
  }
  ```

### 2. Ask Document Question
- **Endpoint**: `POST /api/ask`
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "question": "What is machine learning?"
  }
  ```
- **Response**:
  ```json
  {
    "answer": "Machine learning is a field of artificial intelligence focused on building systems that learn from data [Page 3]. It relies heavily on statistical methods to make predictions [Page 4].",
    "sources": [3, 4],
    "telemetry": {
      "promptTokens": 1420,
      "responseTokens": 110,
      "totalTokens": 1530,
      "estimatedCost": 0.005910
    }
  }
  ```

### 3. Check Workspace Status
- **Endpoint**: `GET /api/status`
- **Response**:
  ```json
  {
    "success": true,
    "hasPdf": true,
    "fileName": "lecture-notes.pdf",
    "pages": 12,
    "history": [
      {
        "question": "...",
        "answer": "...",
        "sources": [3],
        "telemetry": { ... }
      }
    ]
  }
  ```

### 4. Reset Session Workspace
- **Endpoint**: `POST /api/reset`
- **Response**:
  ```json
  {
    "success": true,
    "message": "System state reset successfully"
  }
  ```

---

## Technology Highlights
- **PDF parsing page-by-page**: A custom `pagerender` function intercepts `pdf-parse` processing, indexing pages in order and retaining exact layout texts.
- **Llama 3.3 Context Formatting**: Pages are inserted inside XML-style page tags (`<page number="X">`) which the Llama model parses directly, achieving 100% accurate page-specific inline citations.
- **Token Telemetry Pricing**: Tracks model input and output usage parameters, calculating real-time consumption costs based on current Groq API rates.
