-- Add constituency_id to elections table to support constituency-specific elections

ALTER TABLE public.elections
ADD COLUMN constituency_id UUID REFERENCES public.constituencies(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX idx_elections_constituency_id ON public.elections(constituency_id);

COMMENT ON COLUMN public.elections.constituency_id IS 'Optional: If set, this election is specific to a constituency. If NULL, election is general.';
