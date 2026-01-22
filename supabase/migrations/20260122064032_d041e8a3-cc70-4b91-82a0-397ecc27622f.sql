
-- Create companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create employees table
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  supervisor_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  employee_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  position TEXT,
  department TEXT,
  grade TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create business_trips table
CREATE TABLE public.business_trips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  trip_number TEXT NOT NULL,
  destination TEXT NOT NULL,
  purpose TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  transportation TEXT,
  accommodation TEXT,
  cash_advance NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Submitted',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trip_claims table
CREATE TABLE public.trip_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES public.business_trips(id) ON DELETE CASCADE,
  claim_number TEXT,
  total_amount NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Submitted',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create line_approvals table
CREATE TABLE public.line_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  staff_ga_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  spv_ga_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  hr_manager_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  bod_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  staff_fa_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create users table for user management
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create roles table
CREATE TABLE public.roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create app_settings table
CREATE TABLE public.app_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.line_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (for now, without auth)
CREATE POLICY "Allow public read on companies" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Allow public insert on companies" ON public.companies FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on companies" ON public.companies FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on companies" ON public.companies FOR DELETE USING (true);

CREATE POLICY "Allow public read on employees" ON public.employees FOR SELECT USING (true);
CREATE POLICY "Allow public insert on employees" ON public.employees FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on employees" ON public.employees FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on employees" ON public.employees FOR DELETE USING (true);

CREATE POLICY "Allow public read on business_trips" ON public.business_trips FOR SELECT USING (true);
CREATE POLICY "Allow public insert on business_trips" ON public.business_trips FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on business_trips" ON public.business_trips FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on business_trips" ON public.business_trips FOR DELETE USING (true);

CREATE POLICY "Allow public read on trip_claims" ON public.trip_claims FOR SELECT USING (true);
CREATE POLICY "Allow public insert on trip_claims" ON public.trip_claims FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on trip_claims" ON public.trip_claims FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on trip_claims" ON public.trip_claims FOR DELETE USING (true);

CREATE POLICY "Allow public read on line_approvals" ON public.line_approvals FOR SELECT USING (true);
CREATE POLICY "Allow public insert on line_approvals" ON public.line_approvals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on line_approvals" ON public.line_approvals FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on line_approvals" ON public.line_approvals FOR DELETE USING (true);

CREATE POLICY "Allow public read on users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public insert on users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on users" ON public.users FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on users" ON public.users FOR DELETE USING (true);

CREATE POLICY "Allow public read on roles" ON public.roles FOR SELECT USING (true);
CREATE POLICY "Allow public insert on roles" ON public.roles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on roles" ON public.roles FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on roles" ON public.roles FOR DELETE USING (true);

CREATE POLICY "Allow public read on app_settings" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Allow public insert on app_settings" ON public.app_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on app_settings" ON public.app_settings FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on app_settings" ON public.app_settings FOR DELETE USING (true);

-- Create update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_business_trips_updated_at BEFORE UPDATE ON public.business_trips FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_trip_claims_updated_at BEFORE UPDATE ON public.trip_claims FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_line_approvals_updated_at BEFORE UPDATE ON public.line_approvals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON public.app_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
