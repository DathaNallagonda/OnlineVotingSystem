-- Add admin CRUD policies for votes table

-- Allow admins to update votes
CREATE POLICY "Admins can update votes"
  ON public.votes FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete votes
CREATE POLICY "Admins can delete votes"
  ON public.votes FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to insert votes (for manual vote creation)
CREATE POLICY "Admins can insert votes"
  ON public.votes FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
