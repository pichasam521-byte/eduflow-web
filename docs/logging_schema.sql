-- Create a table for system logs (Maintainability Requirement)
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    level TEXT NOT NULL CHECK (level IN ('INFO', 'WARN', 'ERROR', 'ACTION')),
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Who performed the action
    path TEXT -- URL path or function name
);

-- Enable RLS (Only admins should read logs, but for now we allow insert from server)
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone (Server Actions) can insert
CREATE POLICY "Allow server insertion" ON system_logs FOR INSERT WITH CHECK (true);

-- Policy: Only Admins can view (Mock policy, assuming strict backend access mostly)
-- In a real app, you'd check app_metadata.role = 'admin'
-- For now, we leave it private (no select policy for public)

-- Index for fast searching logs
CREATE INDEX idx_logs_created_at ON system_logs(created_at DESC);
CREATE INDEX idx_logs_level ON system_logs(level);
