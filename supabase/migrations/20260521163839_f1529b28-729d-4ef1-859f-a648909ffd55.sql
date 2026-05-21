-- Notification audit log for admin notifications
CREATE TABLE public.notification_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NULL,
  channel TEXT NOT NULL,
  status TEXT NOT NULL,
  error_message TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "RhinoVC admins can read notification log"
ON public.notification_log FOR SELECT
TO authenticated
USING ((auth.jwt() ->> 'email') LIKE '%@rhinovc.com');

-- Service role bypasses RLS automatically; no insert policy needed for end users
CREATE INDEX idx_notification_log_request_id ON public.notification_log(request_id);
CREATE INDEX idx_notification_log_created_at ON public.notification_log(created_at DESC);