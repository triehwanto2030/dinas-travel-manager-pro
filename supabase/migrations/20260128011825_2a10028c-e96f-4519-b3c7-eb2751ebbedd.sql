-- Master data: Grade Karyawan
CREATE TABLE public.employee_grades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Case-insensitive unique code
CREATE UNIQUE INDEX employee_grades_code_unique
  ON public.employee_grades (lower(code));

ALTER TABLE public.employee_grades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on employee_grades"
  ON public.employee_grades
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on employee_grades"
  ON public.employee_grades
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update on employee_grades"
  ON public.employee_grades
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete on employee_grades"
  ON public.employee_grades
  FOR DELETE
  USING (true);

CREATE TRIGGER update_employee_grades_updated_at
  BEFORE UPDATE ON public.employee_grades
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


-- Master data: Departemen (opsional per Perusahaan)
CREATE TABLE public.employee_departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NULL REFERENCES public.companies(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unik global saat company_id NULL
CREATE UNIQUE INDEX employee_departments_global_name_unique
  ON public.employee_departments (lower(name))
  WHERE company_id IS NULL;

-- Unik per perusahaan saat company_id NOT NULL
CREATE UNIQUE INDEX employee_departments_company_name_unique
  ON public.employee_departments (company_id, lower(name))
  WHERE company_id IS NOT NULL;

CREATE INDEX employee_departments_company_id_idx
  ON public.employee_departments (company_id);

ALTER TABLE public.employee_departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on employee_departments"
  ON public.employee_departments
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on employee_departments"
  ON public.employee_departments
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update on employee_departments"
  ON public.employee_departments
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete on employee_departments"
  ON public.employee_departments
  FOR DELETE
  USING (true);

CREATE TRIGGER update_employee_departments_updated_at
  BEFORE UPDATE ON public.employee_departments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
