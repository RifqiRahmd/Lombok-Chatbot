-- Migration: create_exec_sql_function
-- Creates a server-side RPC function that allows the chatbot API to execute
-- LLM-generated SELECT queries safely via supabase.rpc('exec_sql', { query })

CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  EXECUTE 'SELECT json_agg(row_to_json(t)) FROM (' || query || ') t'
  INTO result;

  -- Return empty array instead of NULL when no rows found
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- Grant execute permission to service_role (used by the server-side API route)
GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;
