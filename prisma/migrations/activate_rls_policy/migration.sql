
-- RLS for user Table

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "User" USING ("assosiationId" = current_setting('app.assosiation_id', TRUE))

