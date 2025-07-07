
-- Create enum types
CREATE TYPE public.status_karyawan AS ENUM ('Aktif', 'Tidak Aktif');
CREATE TYPE public.grade_karyawan AS ENUM ('1A', '1B', '2A', '2B', '2C', '3A', '3B', '3C', '4A', '4B', '4C', '5A', '5B', '5C', '6A', '6B');
CREATE TYPE public.status_perjalanan AS ENUM ('Draft', 'Submitted', 'Approved', 'Rejected', 'Completed');
CREATE TYPE public.status_claim AS ENUM ('Draft', 'Submitted', 'Approved', 'Rejected', 'Paid');

-- Create companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create employees table
CREATE TABLE public.employees (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  position TEXT NOT NULL,
  department TEXT NOT NULL,
  company_id UUID REFERENCES public.companies(id) NOT NULL,
  status public.status_karyawan NOT NULL DEFAULT 'Aktif',
  grade public.grade_karyawan NOT NULL,
  join_date DATE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create line approval table
CREATE TABLE public.line_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) NOT NULL,
  supervisor_id TEXT REFERENCES public.employees(id),
  staff_ga_id TEXT REFERENCES public.employees(id),
  spv_ga_id TEXT REFERENCES public.employees(id),
  hr_manager_id TEXT REFERENCES public.employees(id),
  bod_id TEXT REFERENCES public.employees(id),
  staff_fa_id TEXT REFERENCES public.employees(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id)
);

-- Create business trips table
CREATE TABLE public.business_trips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT REFERENCES public.employees(id) NOT NULL,
  company_id UUID REFERENCES public.companies(id) NOT NULL,
  destination TEXT NOT NULL,
  purpose TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  estimated_budget DECIMAL(15,2),
  status public.status_perjalanan NOT NULL DEFAULT 'Draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trip claims table
CREATE TABLE public.trip_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.business_trips(id) NOT NULL,
  employee_id TEXT REFERENCES public.employees(id) NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  status public.status_claim NOT NULL DEFAULT 'Draft',
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert dummy companies
INSERT INTO public.companies (name) VALUES 
('PT. Inovasi Kreatif'),
('PT. Solusi Digital'),
('PT. Teknologi Maju');

-- Insert dummy employees
INSERT INTO public.employees (id, name, email, phone, position, department, company_id, status, grade, join_date) VALUES 
('EMP176', 'Jesika', 'tes@company.com', '+628562998888', 'Staff GA', 'HR', (SELECT id FROM public.companies WHERE name = 'PT. Inovasi Kreatif'), 'Aktif', '2A', '2025-07-03'),
('EMP175', 'Tri', 'tri@gmail.com', '+628562998885', 'Analyst', 'Finance', (SELECT id FROM public.companies WHERE name = 'PT. Inovasi Kreatif'), 'Aktif', '2B', '2025-06-25'),
('EMP005', 'Tri Ehwanto', 'triehwanto@gmail.com', '+628562998885', 'Human Resources Director', 'HR', (SELECT id FROM public.companies WHERE name = 'PT. Inovasi Kreatif'), 'Aktif', '1A', '2025-06-25'),
('EMP001', 'John Doe', 'john.doe@company.com', '+62 815-5678-9012', 'Manager', 'IT', (SELECT id FROM public.companies WHERE name = 'PT. Solusi Digital'), 'Aktif', '1B', '2022-03-15'),
('EMP002', 'Jane Smith', 'jane.smith@company.com', '+62 816-6789-0123', 'Senior Manager', 'Operations', (SELECT id FROM public.companies WHERE name = 'PT. Teknologi Maju'), 'Aktif', '1A', '2021-11-20'),
('EMP006', 'Lisa Anderson', 'lisa.anderson@company.com', '+62 816-6789-0123', 'Specialist', 'Sales', (SELECT id FROM public.companies WHERE name = 'PT. Inovasi Kreatif'), 'Aktif', '3C', '2023-02-28'),
('EMP007', 'Robert Taylor', 'robert.taylor@company.com', '+62 817-7890-1234', 'Coordinator', 'HR', (SELECT id FROM public.companies WHERE name = 'PT. Solusi Digital'), 'Aktif', '2B', '2021-12-05'),
('EMP008', 'Emily Davis', 'emily.davis@company.com', '+62 818-8901-2345', 'Senior Executive', 'Marketing', (SELECT id FROM public.companies WHERE name = 'PT. Teknologi Maju'), 'Aktif', '2A', '2022-07-18');

-- Insert line approvals
INSERT INTO public.line_approvals (company_id, supervisor_id, staff_ga_id, spv_ga_id, hr_manager_id, bod_id, staff_fa_id) VALUES 
((SELECT id FROM public.companies WHERE name = 'PT. Inovasi Kreatif'), 'EMP005', 'EMP176', 'EMP001', 'EMP005', 'EMP002', 'EMP176'),
((SELECT id FROM public.companies WHERE name = 'PT. Solusi Digital'), 'EMP001', 'EMP176', 'EMP002', 'EMP005', 'EMP001', 'EMP176'),
((SELECT id FROM public.companies WHERE name = 'PT. Teknologi Maju'), 'EMP002', 'EMP176', 'EMP002', 'EMP005', 'EMP001', 'EMP176');

-- Insert dummy business trips
INSERT INTO public.business_trips (employee_id, company_id, destination, purpose, start_date, end_date, estimated_budget, status) VALUES 
('EMP006', (SELECT id FROM public.companies WHERE name = 'PT. Inovasi Kreatif'), 'Malang', 'Client Meeting', '2025-07-06', '2025-07-08', 1500000, 'Approved'),
('EMP176', (SELECT id FROM public.companies WHERE name = 'PT. Inovasi Kreatif'), 'Jakarta', 'Training', '2025-07-04', '2025-07-06', 2000000, 'Approved'),
('EMP001', (SELECT id FROM public.companies WHERE name = 'PT. Solusi Digital'), 'Surabaya', 'Project Review', '2025-07-10', '2025-07-12', 1800000, 'Submitted'),
('EMP008', (SELECT id FROM public.companies WHERE name = 'PT. Teknologi Maju'), 'Bandung', 'Conference', '2025-07-15', '2025-07-17', 2200000, 'Draft');

-- Insert dummy trip claims
INSERT INTO public.trip_claims (trip_id, employee_id, total_amount, status) VALUES 
((SELECT id FROM public.business_trips WHERE employee_id = 'EMP006' AND destination = 'Malang'), 'EMP006', 1500000, 'Approved'),
((SELECT id FROM public.business_trips WHERE employee_id = 'EMP176' AND destination = 'Jakarta'), 'EMP176', 2000000, 'Submitted');

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.line_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_claims ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (for now, allow all operations - you can restrict later based on authentication)
CREATE POLICY "Allow all operations on companies" ON public.companies FOR ALL USING (true);
CREATE POLICY "Allow all operations on employees" ON public.employees FOR ALL USING (true);
CREATE POLICY "Allow all operations on line_approvals" ON public.line_approvals FOR ALL USING (true);
CREATE POLICY "Allow all operations on business_trips" ON public.business_trips FOR ALL USING (true);
CREATE POLICY "Allow all operations on trip_claims" ON public.trip_claims FOR ALL USING (true);
