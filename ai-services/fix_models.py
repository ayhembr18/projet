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
            'Software Engineer': ['Python', 'JavaScript', 'Git', 'Docker', 'SQL', 'REST APIs', 'Testing', 'CI/CD'],
            'Data Scientist': ['Python', 'Machine Learning', 'SQL', 'Statistics', 'Pandas', 'Scikit-learn', 'Data Visualization', 'Deep Learning'],
            'DevOps Engineer': ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux', 'Terraform', 'Monitoring', 'Git'],
            'Product Manager': ['Product Strategy', 'Agile', 'User Research', 'Roadmapping', 'Data Analysis', 'Stakeholder Management'],
            'HR Manager': ['Recruitment', 'Employee Relations', 'Performance Management', 'Labor Law', 'HRIS', 'Training & Development'],
            'Sales Manager': ['CRM', 'Negotiation', 'Pipeline Management', 'Lead Generation', 'Communication', 'Data Analysis'],
            'Marketing Manager': ['Digital Marketing', 'SEO', 'Content Strategy', 'Analytics', 'Social Media', 'Email Marketing'],
            'Finance Manager': ['Financial Modeling', 'Excel', 'Accounting', 'Budgeting', 'Risk Management', 'ERP Systems'],
            'Project Manager': ['Agile', 'Scrum', 'Risk Management', 'Stakeholder Management', 'MS Project', 'Budgeting'],
        }

        # Default required skills if role not found
        default_required = ['Communication', 'Problem Solving', 'Teamwork', 'Time Management', 'Microsoft Office']
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
            'Docker': [{'certification': 'Docker Certified Associate', 'platform': 'Docker', 'duration': '2 months'}],
            'Kubernetes': [{'certification': 'CKA', 'platform': 'CNCF', 'duration': '3 months'}],
            'AWS': [{'certification': 'AWS Solutions Architect', 'platform': 'AWS', 'duration': '3 months'}],
            'Python': [{'certification': 'Python for Everybody', 'platform': 'Coursera', 'duration': '2 months'}],
            'Machine Learning': [{'certification': 'ML Specialization', 'platform': 'Coursera', 'duration': '3 months'}],
            'SQL': [{'certification': 'SQL for Data Science', 'platform': 'Coursera', 'duration': '1 month'}],
            'JavaScript': [{'certification': 'The Complete JavaScript Course', 'platform': 'Udemy', 'duration': '2 months'}],
            'Git': [{'certification': 'Git & GitHub Bootcamp', 'platform': 'Udemy', 'duration': '3 weeks'}],
            'Agile': [{'certification': 'PMI-ACP', 'platform': 'PMI', 'duration': '2 months'}],
            'Scrum': [{'certification': 'Professional Scrum Master', 'platform': 'Scrum.org', 'duration': '1 month'}],
            'Data Visualization': [{'certification': 'Tableau Desktop Specialist', 'platform': 'Tableau', 'duration': '2 months'}],
            'Terraform': [{'certification': 'HashiCorp Terraform Associate', 'platform': 'HashiCorp', 'duration': '2 months'}],
            'Deep Learning': [{'certification': 'Deep Learning Specialization', 'platform': 'Coursera', 'duration': '4 months'}],
            'REST APIs': [{'certification': 'API Design & Fundamentals', 'platform': 'Udemy', 'duration': '1 month'}],
            'CI/CD': [{'certification': 'DevOps CI/CD with Jenkins', 'platform': 'Udemy', 'duration': '6 weeks'}],
            'Linux': [{'certification': 'LPIC-1', 'platform': 'LPI', 'duration': '2 months'}],
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