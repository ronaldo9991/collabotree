-- Add unique constraint to prevent duplicate applications
-- This ensures that a student can only apply to the same project once

-- First, remove any existing duplicate applications (if any)
DELETE FROM project_applications 
WHERE id NOT IN (
  SELECT MIN(id) 
  FROM project_applications 
  GROUP BY project_id, student_id
);

-- Add unique constraint to prevent future duplicates
ALTER TABLE project_applications 
ADD CONSTRAINT unique_project_student_application 
UNIQUE (project_id, student_id);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_project_applications_project_student 
ON project_applications (project_id, student_id);
