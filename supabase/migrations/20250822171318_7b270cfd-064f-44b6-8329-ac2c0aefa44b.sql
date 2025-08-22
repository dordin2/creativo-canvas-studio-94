-- Enable the pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Verify the extension is loaded
SELECT extname FROM pg_extension WHERE extname = 'pg_net';