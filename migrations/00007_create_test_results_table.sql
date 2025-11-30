-- Create test_results table
CREATE TABLE test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    practice_test_id UUID NOT NULL REFERENCES practice_tests(id) ON DELETE CASCADE,
    user_answers TEXT NOT NULL,
    correct_count INTEGER NOT NULL,
    wrong_count INTEGER NOT NULL,
    empty_count INTEGER NOT NULL,
    net_score DOUBLE PRECISION NOT NULL,
    solved_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_test_results_user ON test_results(user_id);
CREATE INDEX idx_test_results_practice_test ON test_results(practice_test_id);
CREATE INDEX idx_test_results_user_practice_test ON test_results(user_id, practice_test_id);
CREATE INDEX idx_test_results_solved_at ON test_results(solved_at DESC);
CREATE INDEX idx_test_results_net_score ON test_results(net_score DESC);

