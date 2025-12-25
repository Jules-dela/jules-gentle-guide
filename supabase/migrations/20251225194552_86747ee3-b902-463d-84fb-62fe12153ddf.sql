-- Add DELETE policy for admins to manage applications
CREATE POLICY "Admins can delete applications"
ON public.housing_applications
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));