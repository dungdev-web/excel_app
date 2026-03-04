// lib/constants.ts

export const INDUSTRIES = [
  'IT', 'Finance', 'HR', 'Sales', 'Marketing',
  'Engineering', 'Manufacturing', 'Retail', 'Healthcare', 'Education',
];

export const LEVELS = [
  'Intern',
  'Fresher (0-1 năm)',
  'Junior (1-2 năm)',
  'Middle (2-4 năm)',
  'Senior (4-7 năm)',
  'Lead / Tech Lead',
  'Principal / Staff',
  'Manager',
  'Director',
  'C-Level (CTO, CFO...)',
];

export const COMPANY_POSITIONS = [
  'Nhân viên toàn thời gian',
  'Nhân viên bán thời gian',
  'Thực tập sinh (Internship)',
  'Freelancer / Contractor',
  'Remote',
  'Hybrid (Remote + Onsite)',
  'Onsite',
];

export const ROLES: Record<string, string[]> = {
  IT: [
    'Frontend Developer',
    'Backend Developer',
    'Fullstack Developer',
    'Web Developer',
    'Mobile Developer (iOS)',
    'Mobile Developer (Android)',
    'React Native Developer',
    'DevOps Engineer',
    'Cloud Engineer',
    'Data Engineer',
    'Data Scientist',
    'Machine Learning Engineer',
    'AI Engineer',
    'QA Engineer / Tester',
    'Security Engineer',
    'System Architect',
    'Tech Lead',
    'Engineering Manager',
    'Product Manager',
    'UI/UX Designer',
    'Business Analyst (IT)',
    'Scrum Master',
    'Database Administrator',
    'Network Engineer',
    'IT Support',
  ],
  Finance: [
    'Financial Analyst', 'Accountant', 'Auditor',
    'Investment Analyst', 'Risk Analyst', 'Credit Analyst',
    'Tax Consultant', 'CFO', 'Finance Manager',
    'Treasury Analyst', 'Compliance Officer',
  ],
  HR: [
    'HR Manager', 'HR Business Partner', 'Recruiter / Talent Acquisition',
    'Compensation & Benefits Specialist', 'Learning & Development Specialist',
    'HR Generalist', 'HRIS Analyst', 'Payroll Specialist',
  ],
  Sales: [
    'Sales Executive', 'Sales Manager', 'Account Manager',
    'Business Development Manager', 'Key Account Manager',
    'Inside Sales Representative', 'Sales Engineer', 'Pre-sales Consultant',
  ],
  Marketing: [
    'Marketing Manager', 'Digital Marketing Specialist', 'Content Marketing Specialist',
    'SEO / SEM Specialist', 'Social Media Manager', 'Brand Manager',
    'Growth Hacker', 'Marketing Analyst', 'Email Marketing Specialist',
    'Performance Marketing Specialist',
  ],
  Engineering: [
    'Mechanical Engineer', 'Electrical Engineer', 'Civil Engineer',
    'Chemical Engineer', 'Industrial Engineer', 'Structural Engineer',
    'Embedded Systems Engineer', 'Hardware Engineer', 'R&D Engineer',
    'Quality Engineer', 'Project Engineer',
  ],
  Manufacturing: [
    'Production Manager', 'Manufacturing Engineer', 'Process Engineer',
    'Quality Control Inspector', 'Supply Chain Manager',
    'Logistics Coordinator', 'Plant Manager', 'Operations Manager',
  ],
  Retail: [
    'Store Manager', 'Retail Sales Associate', 'Visual Merchandiser',
    'Buyer / Purchasing Manager', 'E-commerce Manager',
    'Category Manager', 'Inventory Manager',
  ],
  Healthcare: [
    'Doctor / Physician', 'Nurse', 'Pharmacist', 'Medical Lab Technician',
    'Healthcare Administrator', 'Clinical Data Analyst',
    'Medical Device Sales', 'Physical Therapist',
  ],
  Education: [
    'Teacher / Lecturer', 'Academic Coordinator', 'Curriculum Developer',
    'Education Consultant', 'School Principal', 'Admissions Officer',
    'E-learning Specialist',
  ],
};

export const getRolesByIndustry = (industry: string): string[] =>
  ROLES[industry] ?? [];

export const ALL_ROLES = Object.values(ROLES).flat();