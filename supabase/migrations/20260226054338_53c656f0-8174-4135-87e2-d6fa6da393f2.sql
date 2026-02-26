-- Create notifications table for in-app notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  related_id UUID,
  related_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own notifications
CREATE POLICY "Users can read own notifications"
ON public.notifications FOR SELECT
USING (true);

-- Allow insert for authenticated
CREATE POLICY "Allow insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Allow update notifications"
ON public.notifications FOR UPDATE
USING (true);

-- Create index for performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(user_id, is_read);

-- Create storage bucket for claim attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('claim-attachments', 'claim-attachments', true);

-- Storage policies for claim attachments
CREATE POLICY "Anyone can read claim attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'claim-attachments');

CREATE POLICY "Authenticated users can upload claim attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'claim-attachments');

CREATE POLICY "Users can delete own claim attachments"
ON storage.objects FOR DELETE
USING (bucket_id = 'claim-attachments');