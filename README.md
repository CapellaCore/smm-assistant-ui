# SMM Assistant UI

A React-based chat interface for the SMM Assistant API. This application provides a user-friendly way to interact with the Instagram assistant API.

## Features

- Modern chat interface
- Real-time message display
- File upload support
- Error handling with toast notifications
- Environment-aware authentication
- Built-in debugging tools
- Responsive design

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/CapellaCore/smm-assistant-ui.git
cd smm-assistant-ui
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Environment Configuration

The application supports multiple environments (dev, staging, prod) with automatic API URL resolution:

- **Local Development**: `http://localhost:8080`
- **Development**: `https://smm-assistant-dev-553110626568.us-central1.run.app`
- **Production**: `https://smm-assistant-prod-553110626568.europe-west1.run.app`

### Environment Variables

- `VITE_API_URL`: Override the API URL for the current environment
- `VITE_BASE_URL`: Set the base path for the application

## Authentication

The application uses environment-aware token storage to prevent dev/prod conflicts:

- Tokens are stored with environment-specific keys
- Automatic cleanup of tokens from other environments
- Clear warnings when token/environment mismatches occur

## Troubleshooting

### Common Issues

#### "Возникла ошибка при обращении к AI" Error

This Russian error message ("An error occurred when contacting AI") typically indicates:

1. **Environment Mismatch**: You're using a dev token with the production API or vice versa
2. **Authentication Issues**: Your token has expired or is invalid
3. **API Configuration Problems**: The frontend is pointing to the wrong API endpoint

#### Debugging Tools

The application includes built-in debugging tools:

1. **Environment Banner**: Shows current environment and authentication status at the top of the chat
2. **Debug Panel**: Click the "Debug" button in the bottom-right corner to see:
   - Environment variables
   - Configuration values
   - Authentication status
   - Available tokens in localStorage

#### Steps to Resolve

1. **Check Environment**: Look at the environment banner to confirm you're on the right environment
2. **Verify Token**: Ensure you have a valid token for the current environment
3. **Clear Storage**: If you have multiple tokens, clear localStorage and re-authenticate
4. **Console Logs**: Open browser dev tools to see detailed error logs and configuration info

### Manual Token Management

If you need to manually manage tokens:

```javascript
// Clear all tokens
localStorage.clear();

// Set token for specific environment
localStorage.setItem('access_token_dev', 'your-dev-token');
localStorage.setItem('access_token_prod', 'your-prod-token');
```

## Building for Production

To build the application for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Technologies Used

- React
- TypeScript
- Vite
- Chakra UI
- Axios

## License

This project is licensed under the MIT License.
