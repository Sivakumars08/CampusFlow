CREATE TABLE public.requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id uuid NOT NULL,
  requester_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  location text,
  priority text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'submitted',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT requests_college_id_fkey
    FOREIGN KEY (college_id)
    REFERENCES public.colleges(id),

  CONSTRAINT requests_requester_id_fkey
    FOREIGN KEY (requester_id)
    REFERENCES public.profiles(id),

  CONSTRAINT requests_category_check
    CHECK (category IN (
      'academic',
      'hostel',
      'infrastructure',
      'laboratory',
      'library',
      'transport',
      'mess',
      'technology',
      'other'
    )),

  CONSTRAINT requests_priority_check
    CHECK (priority IN (
      'low',
      'medium',
      'high',
      'urgent'
    )),

  CONSTRAINT requests_status_check
    CHECK (status IN (
      'submitted',
      'assigned',
      'in_progress',
      'resolved',
      'closed'
    ))
);

ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON TABLE public.requests TO authenticated;

CREATE POLICY "Students can create requests for their own college"
ON public.requests
FOR INSERT
TO authenticated
WITH CHECK (
  requester_id = auth.uid()
  AND college_id = (
    SELECT p.college_id
    FROM public.profiles AS p
    WHERE p.id = auth.uid()
      AND p.role = 'student'
  )
);

CREATE POLICY "Students can view their own requests"
ON public.requests
FOR SELECT
TO authenticated
USING (
  requester_id = auth.uid()
);
