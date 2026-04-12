import joblib
import os

class SmartSkillGapAnalyzer:
    def analyze(self, data):
        current_skills = data.get('current_skills', [])
        role = data.get('role', 'Unknown')
        years_exp = data.get('years_experience', 0)
        proficiency = data.get('proficiency_avg', 0.5)
        learning_velocity = data.get('learning_velocity', 0.5)

        # Role-based required skills map
        role_skills_map = {
            # Engineering
            'Software Engineer': ['Python', 'JavaScript', 'Git', 'Docker', 'SQL', 'REST APIs', 'Testing', 'CI/CD'],
            'Data Scientist': ['Python', 'Machine Learning', 'SQL', 'Statistics', 'Pandas', 'Scikit-learn', 'Data Visualization', 'Deep Learning'],
            'DevOps Engineer': ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux', 'Terraform', 'Networking', 'Git'],
            # Product & Project
            'Product Manager': ['Product Strategy', 'Agile', 'User Research', 'Roadmapping', 'Stakeholder Management', 'Product Analytics', 'A/B Testing'],
            'Project Manager': ['Agile', 'Scrum', 'Risk Management', 'Stakeholder Management', 'MS Project', 'Jira', 'Budgeting'],
            'Scrum Master': ['Scrum', 'Agile', 'Kanban', 'Jira', 'Confluence', 'Conflict Resolution', 'Sprint Planning'],
            'Business Analyst': ['SQL', 'Data Visualization', 'Excel', 'Agile', 'Stakeholder Management', 'Process Improvement', 'Jira'],
            # HR
            'HR Manager': ['Recruitment', 'Employee Relations', 'Performance Management', 'Labor Law', 'HRIS', 'Training & Development', 'Workforce Planning', 'Compensation & Benefits'],
            'HR Specialist': ['Recruitment', 'Onboarding', 'Employee Relations', 'HRIS', 'Labor Law', 'HR Policies', 'Payroll Management'],
            'Recruiter': ['Talent Acquisition', 'Recruitment', 'Onboarding', 'Communication', 'Stakeholder Management', 'HR Policies'],
            'Talent Acquisition Specialist': ['Talent Acquisition', 'Recruitment', 'Onboarding', 'Employee Engagement', 'Communication', 'Diversity & Inclusion'],
            # Sales & Marketing
            'Sales Manager': ['CRM', 'Negotiation', 'Pipeline Management', 'Lead Generation', 'Communication', 'Salesforce', 'B2B Sales'],
            'Sales Representative': ['CRM', 'Negotiation', 'Lead Generation', 'Communication', 'B2B Sales', 'B2C Sales', 'Account Management'],
            'Account Manager': ['CRM', 'Account Management', 'Negotiation', 'Communication', 'Salesforce', 'Pipeline Management'],
            'Marketing Manager': ['Digital Marketing', 'SEO', 'Content Strategy', 'Google Analytics', 'Social Media', 'Email Marketing', 'Campaign Management', 'Brand Management'],
            'Digital Marketing Specialist': ['SEO', 'SEM', 'Google Analytics', 'Social Media', 'Email Marketing', 'Content Strategy', 'Copywriting'],
            'Content Specialist': ['Copywriting', 'Content Strategy', 'SEO', 'Social Media', 'Brand Management', 'Market Research'],
            # Finance
            'Finance Manager': ['Financial Modeling', 'Excel', 'Accounting', 'Budgeting', 'Risk Management', 'ERP Systems', 'Financial Reporting'],
            'Accountant': ['Accounting', 'Excel', 'Tax Management', 'Payroll', 'IFRS', 'Auditing', 'QuickBooks'],
            'Financial Analyst': ['Financial Modeling', 'Excel', 'Forecasting', 'Data Visualization', 'SQL', 'Risk Management', 'Cost Analysis'],
            # IT
            'IT Support Specialist': ['Help Desk Support', 'Hardware Troubleshooting', 'Windows Server', 'Microsoft 365', 'Ticketing Systems', 'Networking', 'IT Security'],
            'IT Technician': ['Hardware Troubleshooting', 'Help Desk Support', 'Windows Server', 'VPN Configuration', 'Patch Management', 'Backup & Recovery', 'Networking'],
            'Network Administrator': ['Networking', 'Network Administration', 'Firewall Management', 'VPN Configuration', 'Linux', 'IT Security', 'Windows Server'],
            'System Administrator': ['Linux', 'System Administration', 'Active Directory', 'Windows Server', 'Backup & Recovery', 'Patch Management', 'Networking'],
            # Legal
            'Legal Counsel': ['Contract Management', 'Corporate Law', 'Legal Research', 'Compliance', 'GDPR', 'Intellectual Property', 'Employment Law'],
            'Compliance Officer': ['Compliance', 'GDPR', 'Risk Management', 'Legal Research', 'Regulatory Affairs', 'Data Privacy', 'HR Policies'],
            # Operations
            'Operations Manager': ['Process Improvement', 'Lean Management', 'Vendor Management', 'Supply Chain Management', 'Risk Management', 'ERP Systems', 'Six Sigma'],
            'Supply Chain Specialist': ['Supply Chain Management', 'Inventory Management', 'Logistics', 'Procurement', 'Demand Planning', 'Vendor Management', 'ERP Systems'],
        }

        # Default required skills if role not found
        default_required = ['Communication', 'Problem Solving', 'Teamwork', 'Time Management', 'Leadership', 'Adaptability', 'Critical Thinking']
        required_skills = role_skills_map.get(role, default_required)

        # Normalize for comparison
        current_lower = [s.lower().strip() for s in current_skills]
        matching = [s for s in required_skills if s.lower() in current_lower]
        missing = [s for s in required_skills if s.lower() not in current_lower]

        total = len(required_skills)
        coverage_score = round((len(matching) / total) * 100) if total > 0 else 0

        # Readiness level
        if coverage_score >= 80:
            readiness_level = 'Advanced'
        elif coverage_score >= 55:
            readiness_level = 'Intermediate'
        elif coverage_score >= 30:
            readiness_level = 'Developing'
        else:
            readiness_level = 'Beginner'

        # Upskilling estimate (months)
        base_months = len(missing) * 1.5
        velocity_factor = 1.0 - (learning_velocity * 0.4)
        estimated_months = max(1, round(base_months * velocity_factor))

        # Build recommendations for missing skills
        course_db = {
            # Software Engineering
            'Python': [{'certification': 'Python for Everybody', 'platform': 'Coursera', 'duration': '2 months'}],
            'JavaScript': [{'certification': 'The Complete JavaScript Course', 'platform': 'Udemy', 'duration': '2 months'}],
            'TypeScript': [{'certification': 'Understanding TypeScript', 'platform': 'Udemy', 'duration': '5 weeks'}],
            'Java': [{'certification': 'Java Programming Masterclass', 'platform': 'Udemy', 'duration': '3 months'}],
            'Git': [{'certification': 'Git & GitHub Bootcamp', 'platform': 'Udemy', 'duration': '3 weeks'}],
            'REST APIs': [{'certification': 'API Design & Fundamentals', 'platform': 'Udemy', 'duration': '1 month'}],
            'Testing': [{'certification': 'Software Testing Bootcamp', 'platform': 'Udemy', 'duration': '6 weeks'}],
            'Docker': [{'certification': 'Docker Certified Associate', 'platform': 'Docker', 'duration': '2 months'}],
            'Kubernetes': [{'certification': 'CKA', 'platform': 'CNCF', 'duration': '3 months'}],
            'CI/CD': [{'certification': 'DevOps CI/CD with Jenkins', 'platform': 'Udemy', 'duration': '6 weeks'}],
            'Linux': [{'certification': 'LPIC-1', 'platform': 'LPI', 'duration': '2 months'}],
            'Terraform': [{'certification': 'HashiCorp Terraform Associate', 'platform': 'HashiCorp', 'duration': '2 months'}],
            'AWS': [{'certification': 'AWS Solutions Architect', 'platform': 'AWS', 'duration': '3 months'}],
            'Azure': [{'certification': 'AZ-900 Azure Fundamentals', 'platform': 'Microsoft', 'duration': '1 month'}],
            'GCP': [{'certification': 'Google Cloud Associate Engineer', 'platform': 'Google', 'duration': '2 months'}],
            'Networking': [{'certification': 'CompTIA Network+', 'platform': 'CompTIA', 'duration': '2 months'}],
            # Data
            'SQL': [{'certification': 'SQL for Data Science', 'platform': 'Coursera', 'duration': '1 month'}],
            'Machine Learning': [{'certification': 'ML Specialization', 'platform': 'Coursera', 'duration': '3 months'}],
            'Deep Learning': [{'certification': 'Deep Learning Specialization', 'platform': 'Coursera', 'duration': '4 months'}],
            'Data Visualization': [{'certification': 'Tableau Desktop Specialist', 'platform': 'Tableau', 'duration': '2 months'}],
            'Power BI': [{'certification': 'Microsoft Power BI Data Analyst', 'platform': 'Microsoft', 'duration': '2 months'}],
            'Excel': [{'certification': 'Microsoft Excel Expert (MOS)', 'platform': 'Microsoft', 'duration': '4 weeks'}],
            'Statistics': [{'certification': 'Statistics with Python', 'platform': 'Coursera', 'duration': '2 months'}],
            'Pandas': [{'certification': 'Data Analysis with Pandas', 'platform': 'Udemy', 'duration': '4 weeks'}],
            'HR Analytics': [{'certification': 'People Analytics', 'platform': 'Coursera', 'duration': '2 months'}],
            # Project & Product
            'Agile': [{'certification': 'PMI-ACP', 'platform': 'PMI', 'duration': '2 months'}],
            'Scrum': [{'certification': 'Professional Scrum Master (PSM I)', 'platform': 'Scrum.org', 'duration': '1 month'}],
            'Kanban': [{'certification': 'Kanban Management Professional', 'platform': 'Kanban University', 'duration': '3 weeks'}],
            'Jira': [{'certification': 'Jira Fundamentals', 'platform': 'Atlassian', 'duration': '2 weeks'}],
            'Product Strategy': [{'certification': 'Product Management Certificate', 'platform': 'Product School', 'duration': '2 months'}],
            'Roadmapping': [{'certification': 'Product Roadmapping', 'platform': 'Pragmatic Institute', 'duration': '1 month'}],
            'Risk Management': [{'certification': 'PMI-RMP', 'platform': 'PMI', 'duration': '2 months'}],
            'Stakeholder Management': [{'certification': 'PMP Certification', 'platform': 'PMI', 'duration': '3 months'}],
            'MS Project': [{'certification': 'Microsoft Project Fundamentals', 'platform': 'Microsoft', 'duration': '3 weeks'}],
            'Process Improvement': [{'certification': 'Lean Six Sigma Yellow Belt', 'platform': 'ASQ', 'duration': '1 month'}],
            # HR
            'Recruitment': [{'certification': 'SHRM-CP', 'platform': 'SHRM', 'duration': '3 months'}],
            'Talent Acquisition': [{'certification': 'Talent Acquisition Specialist', 'platform': 'HRCI', 'duration': '2 months'}],
            'Employee Relations': [{'certification': 'Employee Relations Certificate', 'platform': 'HRCI', 'duration': '6 weeks'}],
            'Performance Management': [{'certification': 'Performance Management Course', 'platform': 'LinkedIn Learning', 'duration': '4 weeks'}],
            'Labor Law': [{'certification': 'Employment Law Fundamentals', 'platform': 'Coursera', 'duration': '6 weeks'}],
            'HRIS': [{'certification': 'Workday HCM Fundamentals', 'platform': 'Workday', 'duration': '4 weeks'}],
            'Training & Development': [{'certification': 'ATD Certificate in L&D', 'platform': 'ATD', 'duration': '2 months'}],
            'Compensation & Benefits': [{'certification': 'Certified Compensation Professional', 'platform': 'WorldatWork', 'duration': '3 months'}],
            'Workforce Planning': [{'certification': 'Strategic Workforce Planning', 'platform': 'HRCI', 'duration': '6 weeks'}],
            'Payroll Management': [{'certification': 'Certified Payroll Professional', 'platform': 'APA', 'duration': '3 months'}],
            'Diversity & Inclusion': [{'certification': 'Diversity & Inclusion Certificate', 'platform': 'Cornell ILR', 'duration': '2 months'}],
            'Onboarding': [{'certification': 'Employee Onboarding Best Practices', 'platform': 'LinkedIn Learning', 'duration': '2 weeks'}],
            'Conflict Resolution': [{'certification': 'Conflict Resolution Fundamentals', 'platform': 'Coursera', 'duration': '4 weeks'}],
            # Finance
            'Financial Modeling': [{'certification': 'Financial Modeling & Valuation', 'platform': 'CFI', 'duration': '3 months'}],
            'Accounting': [{'certification': 'Accounting Fundamentals', 'platform': 'CFI', 'duration': '2 months'}],
            'Auditing': [{'certification': 'Certified Internal Auditor (CIA)', 'platform': 'IIA', 'duration': '4 months'}],
            'Tax Management': [{'certification': 'Taxation Certificate', 'platform': 'AICPA', 'duration': '2 months'}],
            'ERP Systems': [{'certification': 'SAP Fundamentals', 'platform': 'SAP', 'duration': '2 months'}],
            'SAP': [{'certification': 'SAP Certified Application Associate', 'platform': 'SAP', 'duration': '3 months'}],
            'Financial Reporting': [{'certification': 'Financial Reporting & Analysis', 'platform': 'CFI', 'duration': '6 weeks'}],
            'Budgeting': [{'certification': 'Budgeting & Forecasting', 'platform': 'CFI', 'duration': '4 weeks'}],
            'IFRS': [{'certification': 'IFRS Certificate', 'platform': 'ACCA', 'duration': '3 months'}],
            # Sales & Marketing
            'Digital Marketing': [{'certification': 'Google Digital Marketing Certificate', 'platform': 'Google', 'duration': '6 months'}],
            'SEO': [{'certification': 'SEO Certification', 'platform': 'HubSpot Academy', 'duration': '4 weeks'}],
            'SEM': [{'certification': 'Google Ads Certification', 'platform': 'Google', 'duration': '3 weeks'}],
            'Social Media': [{'certification': 'Social Media Marketing', 'platform': 'HubSpot Academy', 'duration': '4 weeks'}],
            'Email Marketing': [{'certification': 'Email Marketing Certification', 'platform': 'HubSpot Academy', 'duration': '3 weeks'}],
            'Google Analytics': [{'certification': 'Google Analytics Certification', 'platform': 'Google', 'duration': '2 weeks'}],
            'CRM': [{'certification': 'Salesforce Admin Certification', 'platform': 'Salesforce', 'duration': '2 months'}],
            'Salesforce': [{'certification': 'Salesforce Certified Administrator', 'platform': 'Salesforce', 'duration': '2 months'}],
            'HubSpot': [{'certification': 'HubSpot Sales Software', 'platform': 'HubSpot Academy', 'duration': '3 weeks'}],
            'Negotiation': [{'certification': 'Successful Negotiation', 'platform': 'Coursera', 'duration': '4 weeks'}],
            'Content Strategy': [{'certification': 'Content Marketing Certification', 'platform': 'HubSpot Academy', 'duration': '4 weeks'}],
            'Lead Generation': [{'certification': 'LinkedIn Marketing Fundamentals', 'platform': 'LinkedIn', 'duration': '3 weeks'}],
            # IT Support
            'Help Desk Support': [{'certification': 'CompTIA A+', 'platform': 'CompTIA', 'duration': '2 months'}],
            'Hardware Troubleshooting': [{'certification': 'CompTIA A+', 'platform': 'CompTIA', 'duration': '2 months'}],
            'Network Administration': [{'certification': 'CompTIA Network+', 'platform': 'CompTIA', 'duration': '2 months'}],
            'Active Directory': [{'certification': 'Microsoft 365 Fundamentals', 'platform': 'Microsoft', 'duration': '4 weeks'}],
            'Windows Server': [{'certification': 'Windows Server Administration', 'platform': 'Microsoft', 'duration': '2 months'}],
            'Microsoft 365': [{'certification': 'Microsoft 365 Fundamentals (MS-900)', 'platform': 'Microsoft', 'duration': '4 weeks'}],
            'IT Security': [{'certification': 'CompTIA Security+', 'platform': 'CompTIA', 'duration': '2 months'}],
            'Ticketing Systems': [{'certification': 'ITIL 4 Foundation', 'platform': 'Axelos', 'duration': '1 month'}],
            'ITIL': [{'certification': 'ITIL 4 Foundation', 'platform': 'Axelos', 'duration': '1 month'}],
            'System Administration': [{'certification': 'Linux Professional Institute (LPIC-1)', 'platform': 'LPI', 'duration': '2 months'}],
            'Backup & Recovery': [{'certification': 'Veeam Backup & Replication', 'platform': 'Veeam', 'duration': '3 weeks'}],
            'Firewall Management': [{'certification': 'CompTIA Security+', 'platform': 'CompTIA', 'duration': '2 months'}],
            'VPN Configuration': [{'certification': 'Network Security Fundamentals', 'platform': 'Udemy', 'duration': '4 weeks'}],
            # Legal
            'Contract Management': [{'certification': 'CCMP Contract Management', 'platform': 'NCMA', 'duration': '3 months'}],
            'Compliance': [{'certification': 'Certified Compliance & Ethics Professional', 'platform': 'SCCE', 'duration': '3 months'}],
            'GDPR': [{'certification': 'GDPR Foundation & Practitioner', 'platform': 'IAPP', 'duration': '6 weeks'}],
            'Legal Research': [{'certification': 'Legal Research Certificate', 'platform': 'Coursera', 'duration': '4 weeks'}],
            'Data Privacy': [{'certification': 'CIPP/E Certification', 'platform': 'IAPP', 'duration': '3 months'}],
            # Operations
            'Supply Chain Management': [{'certification': 'APICS CSCP', 'platform': 'ASCM', 'duration': '3 months'}],
            'Lean Management': [{'certification': 'Lean Six Sigma Green Belt', 'platform': 'ASQ', 'duration': '3 months'}],
            'Six Sigma': [{'certification': 'Six Sigma Green Belt', 'platform': 'ASQ', 'duration': '3 months'}],
            'Quality Assurance': [{'certification': 'Certified Quality Auditor', 'platform': 'ASQ', 'duration': '2 months'}],
            'Procurement': [{'certification': 'CIPS Level 4', 'platform': 'CIPS', 'duration': '3 months'}],
            'Logistics': [{'certification': 'Logistics & Supply Chain Management', 'platform': 'Coursera', 'duration': '2 months'}],
            'Vendor Management': [{'certification': 'Vendor Management Fundamentals', 'platform': 'LinkedIn Learning', 'duration': '3 weeks'}],
        }

        recommendations = []
        for i, skill in enumerate(missing[:6]):
            urgency = 'Critical' if i < 2 else ('High' if i < 4 else 'Medium')
            courses = course_db.get(skill, [{'certification': f'{skill} Fundamentals', 'platform': 'Udemy', 'duration': '4 weeks'}])
            recommendations.append({'skill': skill, 'urgency': urgency, 'courses': courses})

        # Return the flat structure the frontend expects
        return {
            'skillAnalysis': {
                'coverage_score': coverage_score,
                'matching_skills': matching,
                'missing_skills': missing,
                'readiness_level': readiness_level,
                'estimated_upskilling_months': estimated_months,
                'skill_count': {
                    'current': len(matching),
                    'missing': len(missing),
                    'total_required': total,
                },
                'recommendations': recommendations,
            }
        }


class AIPredictionEngine:
    def predict(self, data):
        # Extract relevant HR fields
        years_at_company = data.get('YearsAtCompany', 0)
        years_since_promotion = data.get('YearsSinceLastPromotion', 0)
        performance = data.get('PerformanceRating', 3)
        satisfaction = data.get('JobSatisfaction', 3)
        work_life = data.get('WorkLifeBalance', 3)
        env_satisfaction = data.get('EnvironmentSatisfaction', 3)
        job_involvement = data.get('JobInvolvement', 3)
        salary_hike = data.get('PercentSalaryHike', 14)
        training = data.get('TrainingTimesLastYear', 0)
        overtime = data.get('OverTime', 'No')
        distance = data.get('DistanceFromHome', 10)
        job_level = data.get('JobLevel', 2)
        total_working_years = data.get('TotalWorkingYears', 0)
        num_companies = data.get('NumCompaniesWorked', 1)

        # ── Attrition risk ──────────────────────────────────────────────────
        attrition_score = 0

        # Dissatisfaction signals
        if satisfaction <= 2: attrition_score += 20
        elif satisfaction == 3: attrition_score += 8

        if work_life <= 2: attrition_score += 15
        elif work_life == 3: attrition_score += 5

        if env_satisfaction <= 2: attrition_score += 12

        if overtime == 'Yes': attrition_score += 15
        if distance > 20: attrition_score += 10
        elif distance > 10: attrition_score += 5

        if years_since_promotion > 4: attrition_score += 15
        elif years_since_promotion > 2: attrition_score += 7

        if num_companies > 4: attrition_score += 10
        if salary_hike < 12: attrition_score += 8

        # Stability signals (reduce attrition)
        if years_at_company > 5: attrition_score -= 10
        if performance >= 4: attrition_score -= 8
        if job_involvement >= 4: attrition_score -= 8
        if training >= 3: attrition_score -= 5

        attrition_probability = max(5, min(95, attrition_score))
        if attrition_probability >= 60:
            attrition_level = 'High'
        elif attrition_probability >= 35:
            attrition_level = 'Medium'
        else:
            attrition_level = 'Low'

        # ── Promotion readiness ──────────────────────────────────────────────
        promotion_score = 0

        if performance >= 4: promotion_score += 30
        elif performance == 3: promotion_score += 15

        if years_at_company >= 3: promotion_score += 20
        elif years_at_company >= 1: promotion_score += 10

        if job_involvement >= 4: promotion_score += 20
        elif job_involvement == 3: promotion_score += 10

        if training >= 3: promotion_score += 15
        elif training >= 1: promotion_score += 7

        if salary_hike >= 20: promotion_score += 15
        elif salary_hike >= 15: promotion_score += 8

        if years_since_promotion > 3: promotion_score += 10  # overdue

        promotion_score = max(5, min(95, promotion_score))

        if promotion_score >= 70:
            promotion_status = 'Ready'
        elif promotion_score >= 45:
            promotion_status = 'Ready Soon'
        elif promotion_score >= 25:
            promotion_status = 'Developing'
        else:
            promotion_status = 'Not Ready'

        # ── Skill growth trajectory ──────────────────────────────────────────
        growth_score = 0

        if training >= 4: growth_score += 35
        elif training >= 2: growth_score += 20
        elif training >= 1: growth_score += 10

        if performance >= 4: growth_score += 25
        elif performance == 3: growth_score += 12

        if job_involvement >= 4: growth_score += 20
        elif job_involvement == 3: growth_score += 10

        if total_working_years > 5: growth_score += 15
        elif total_working_years > 2: growth_score += 8

        growth_score = max(5, min(95, growth_score))

        if growth_score >= 65:
            growth_status = 'Accelerating'
        elif growth_score >= 40:
            growth_status = 'Steady'
        else:
            growth_status = 'Needs Support'

        # ── Insights ────────────────────────────────────────────────────────
        insights = []

        if performance >= 4:
            insights.append('Strong performance rating — high-value contributor.')
        if attrition_level == 'High':
            insights.append('High attrition risk — consider a retention conversation.')
        if attrition_level == 'Low':
            insights.append('Low flight risk — employee shows good stability signals.')
        if years_since_promotion > 3 and performance >= 3:
            insights.append('Due for a promotion review — long time since last advancement.')
        if overtime == 'Yes' and work_life <= 2:
            insights.append('Overtime combined with low work-life balance — burnout risk.')
        if training == 0:
            insights.append('No training recorded last year — invest in L&D opportunities.')
        elif training >= 3:
            insights.append('Actively investing in learning — positive development signal.')
        if job_involvement >= 4:
            insights.append('Highly engaged employee — consider for leadership or mentoring roles.')
        if promotion_status == 'Ready':
            insights.append('Meets criteria for promotion — ready for next level.')

        if not insights:
            insights.append('Profile looks balanced — continue monitoring performance metrics.')

        return {
            'hrPredictions': {
                'predictions': {
                    'attrition_risk': {
                        'probability': attrition_probability,
                        'level': attrition_level,
                    },
                    'promotion_readiness': {
                        'score': promotion_score,
                        'status': promotion_status,
                    },
                    'skill_growth_trajectory': {
                        'score': growth_score,
                        'status': growth_status,
                    },
                },
                'insights': insights[:5],  # max 5 insights
            }
        }


# ── Generate model files ─────────────────────────────────────────────────────
os.makedirs('model', exist_ok=True)
joblib.dump(SmartSkillGapAnalyzer(), 'model/skill_gap_model.pkl')
joblib.dump(AIPredictionEngine(), 'model/prediction_engine.pkl')
print('✅ Models generated successfully!')